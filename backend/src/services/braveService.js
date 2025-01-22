import fetch from 'node-fetch';
import { redisClient } from './cacheService.js';

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAFHHikdsv2YXSYODQSPES2tTMILHI';
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

export class BraveService {
  constructor() {
    this.baseHeaders = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': BRAVE_API_KEY
    };
  }

  async fetchWithCache(endpoint, params) {
    const cacheKey = `brave:${endpoint}:${JSON.stringify(params)}`;
    
    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If not in cache, fetch from API
    const queryString = new URLSearchParams(params).toString();
    const url = `https://api.search.brave.com/res/v1/${endpoint}?${queryString}`;
    
    const response = await fetch(url, {
      headers: this.baseHeaders
    });

    if (!response.ok) {
      throw new Error(`Brave API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store in cache
    await redisClient.setex(cacheKey, CACHE_DURATION, JSON.stringify(data));
    
    return data;
  }

  async getNewsAndSentiment(query) {
    try {
      const data = await this.fetchWithCache('news/search', {
        q: query,
        count: 10
      });
      
      return this.analyzeNewsData(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.defaultSentiment();
    }
  }

  async getMarketMovers() {
    try {
      const queries = [
        'stock market biggest movers today',
        'significant stock price movement today',
        'major stock market news today'
      ];

      const results = await Promise.all(
        queries.map(query => this.fetchWithCache('news/search', { q: query, count: 5 }))
      );

      return this.processMarketMovers(results);
    } catch (error) {
      console.error('Error fetching market movers:', error);
      return [];
    }
  }

  async getMarketThemes() {
    try {
      const data = await this.fetchWithCache('news/search', {
        q: 'current market themes trends sectors',
        count: 15
      });

      return this.extractThemes(data);
    } catch (error) {
      console.error('Error fetching market themes:', error);
      return [];
    }
  }

  async getMarketSentiment() {
    try {
      const data = await this.fetchWithCache('news/search', {
        q: 'stock market sentiment outlook analysis',
        count: 20
      });

      return this.analyzeBroadMarketSentiment(data);
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      return this.defaultSentiment();
    }
  }

  // Helper methods
  analyzeNewsData(newsData) {
    if (!newsData?.articles?.length) {
      return this.defaultSentiment();
    }

    const articles = newsData.articles.slice(0, 10);
    const sentimentScores = articles.map(article => this.analyzeSentiment(article.title));
    
    const positive = sentimentScores.filter(score => score > 0).length;
    const negative = sentimentScores.filter(score => score < 0).length;
    const neutral = sentimentScores.filter(score => score === 0).length;
    
    const total = articles.length;
    const sentimentScore = this.calculateSentimentScore(positive, negative, neutral, total);

    return {
      sentiment: this.determineSentiment(sentimentScore),
      score: sentimentScore,
      positive: positive / total,
      negative: negative / total,
      neutral: neutral / total,
      confidence: this.calculateConfidence(positive, negative, neutral, total),
      trend: this.determineTrend(sentimentScore),
      topArticles: articles.map(article => ({
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source
      }))
    };
  }

  processMarketMovers(newsResults) {
    const allArticles = newsResults.flatMap(result => result.articles || []);
    const stockMentions = new Map();

    allArticles.forEach(article => {
      const stockMatches = article.title.match(/\$[A-Z]+|\b[A-Z]{3,5}\b/g) || [];
      stockMatches.forEach(stock => {
        stock = stock.replace('$', '');
        if (!stockMentions.has(stock)) {
          stockMentions.set(stock, {
            symbol: stock,
            mentions: 0,
            articles: []
          });
        }
        const data = stockMentions.get(stock);
        data.mentions++;
        data.articles.push({
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source
        });
      });
    });

    return Array.from(stockMentions.values())
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  }

  extractThemes(newsData) {
    if (!newsData?.articles?.length) return [];

    const themes = new Map();
    const keywords = {
      'technology': ['tech', 'software', 'AI', 'cyber', 'digital'],
      'healthcare': ['health', 'biotech', 'medical', 'pharma'],
      'finance': ['banking', 'fintech', 'payment', 'crypto'],
      'energy': ['energy', 'oil', 'renewable', 'solar', 'electric']
    };

    newsData.articles.forEach(article => {
      const text = `${article.title} ${article.description || ''}`.toLowerCase();
      
      Object.entries(keywords).forEach(([theme, words]) => {
        if (words.some(word => text.includes(word))) {
          if (!themes.has(theme)) {
            themes.set(theme, {
              name: theme,
              articles: [],
              relevance: 0
            });
          }
          const themeData = themes.get(theme);
          themeData.relevance++;
          themeData.articles.push({
            title: article.title,
            url: article.url,
            publishedAt: article.publishedAt
          });
        }
      });
    });

    return Array.from(themes.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4);
  }

  analyzeBroadMarketSentiment(newsData) {
    const sentiment = this.analyzeNewsData(newsData);
    
    const marketTerms = {
      bullish: ['rally', 'growth', 'recovery', 'optimistic', 'upward'],
      bearish: ['recession', 'downturn', 'crisis', 'bearish', 'downward']
    };

    const articles = newsData.articles || [];
    let bullishCount = 0;
    let bearishCount = 0;

    articles.forEach(article => {
      const text = `${article.title} ${article.description || ''}`.toLowerCase();
      
      marketTerms.bullish.forEach(term => {
        if (text.includes(term)) bullishCount++;
      });
      
      marketTerms.bearish.forEach(term => {
        if (text.includes(term)) bearishCount++;
      });
    });

    return {
      ...sentiment,
      marketBias: bullishCount > bearishCount ? 'bullish' : 
                 bearishCount > bullishCount ? 'bearish' : 'neutral',
      confidence: Math.abs(bullishCount - bearishCount) / (bullishCount + bearishCount || 1)
    };
  }

  analyzeSentiment(text) {
    const positiveWords = ['surge', 'gain', 'up', 'rise', 'grow', 'improve', 'positive', 'bull'];
    const negativeWords = ['drop', 'fall', 'down', 'decline', 'loss', 'negative', 'bear', 'crash'];
    
    text = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) score++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) score--;
    });
    
    return score;
  }

  calculateSentimentScore(positive, negative, neutral, total) {
    if (total === 0) return 0.5;
    return (positive + (neutral * 0.5)) / total;
  }

  calculateConfidence(positive, negative, neutral, total) {
    if (total === 0) return 0.5;
    return Math.abs((positive - negative) / total);
  }

  determineSentiment(score) {
    if (score > 0.6) return 'positive';
    if (score < 0.4) return 'negative';
    return 'neutral';
  }

  determineTrend(score) {
    if (score > 0.7) return 'strongly_positive';
    if (score > 0.6) return 'positive';
    if (score < 0.3) return 'strongly_negative';
    if (score < 0.4) return 'negative';
    return 'stable';
  }

  defaultSentiment() {
    return {
      sentiment: 'neutral',
      score: 0.5,
      positive: 0.33,
      negative: 0.33,
      neutral: 0.34,
      confidence: 0.5,
      trend: 'stable',
      topArticles: [],
      marketBias: 'neutral'
    };
  }
}

export default new BraveService();