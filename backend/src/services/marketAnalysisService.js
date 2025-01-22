import { eodService, fredService, braveService } from './apiServices.js';
import beaService from './beaService.js';
import errorTracker from '../utils/errorTracker.js';
import { validateMarketData, validateMacroData, validateNewsData, sanitizeNumber, sanitizeDate } from '../utils/validation.js';

class MarketAnalysisService {
  constructor() {
    this.majorIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX'];
    this.updateInterval = 300000;
    this.lastUpdate = null;
    this.cachedData = null;
  }

  async getMarketSnapshot() {
    try {
      if (this.cachedData && Date.now() - this.lastUpdate < this.updateInterval) {
        return this.cachedData;
      }

      const [indicesData, macroData, marketMovers, marketNews] = await Promise.all([
        this._fetchIndicesData(),
        this._fetchMacroData(),
        this._fetchMarketMovers(),
        this._fetchMarketNews()
      ]);

      const snapshot = {
        timestamp: Date.now(),
        indices: indicesData,
        macro: this._formatMacroData(macroData),
        movers: marketMovers,
        news: marketNews,
        marketHealth: this._calculateMarketHealth(indicesData, macroData)
      };

      this.cachedData = snapshot;
      this.lastUpdate = Date.now();

      return snapshot;
    } catch (error) {
      console.error('Error in getMarketSnapshot:', error);
      throw error;
    }
  }

  async getFocusedMover() {
    try {
      const movers = await this._fetchMarketMovers();
      const gainer = movers.gainers?.[0];
      const loser = movers.losers?.[0];
      
      return {
        ...((Math.abs(gainer?.changePercent) > Math.abs(loser?.changePercent)) ? gainer : loser),
        news: await this._fetchStockNews(gainer?.symbol || '')
      };
    } catch (error) {
      errorTracker.track(error, 'getFocusedMover');
      return null;
    }
  }

  async getMarketThemes() {
    try {
      const indices = await this._fetchIndicesData();
      return [
        {
          id: 'tech',
          name: 'Technology',
          description: 'Technology sector trends and opportunities',
          stocks: ['AAPL', 'MSFT', 'GOOGL']
        },
        {
          id: 'finance',
          name: 'Financial Services',
          description: 'Banking and financial sector developments',
          stocks: ['JPM', 'BAC', 'GS']
        }
      ];
    } catch (error) {
      errorTracker.track(error, 'getMarketThemes');
      return [];
    }
  }

  async getMacroData() {
    try {
      const [fredData, gdpData] = await Promise.all([
        this._fetchMacroData(),
        beaService.getGDPData()
      ]);
      return this._formatMacroData(fredData, gdpData);
    } catch (error) {
      errorTracker.track(error, 'getMacroData');
      return null;
    }
  }

  async _fetchIndicesData() {
    try {
      const quotes = await Promise.all(
        this.majorIndices.map(symbol => eodService.getRealTimeQuote(symbol))
      );

      return quotes
        .filter(quote => validateMarketData(quote))
        .map(quote => ({
          symbol: quote.symbol,
          name: this._getIndexName(quote.symbol),
          price: sanitizeNumber(quote.close),
          change: sanitizeNumber(quote.change),
          changePercent: sanitizeNumber(quote.change_p),
          volume: sanitizeNumber(quote.volume),
          timestamp: sanitizeDate(quote.timestamp)
        }));
    } catch (error) {
      errorTracker.track(error, '_fetchIndicesData');
      throw error;
    }
  }

  async _fetchMacroData() {
    try {
      const data = await fredService.getMacroIndicators();
      Object.keys(data).forEach(key => {
        if (!validateMacroData(data[key]?.observations?.[0])) {
          errorTracker.track(new Error(`Invalid macro data for ${key}`), '_fetchMacroData');
        }
      });
      return data;
    } catch (error) {
      errorTracker.track(error, '_fetchMacroData');
      throw error;
    }
  }

  async _fetchMarketMovers() {
    try {
      const movers = await eodService.getMarketMovers();
      return {
        gainers: this._formatMovers(movers.gainers?.slice(0, 5) || []),
        losers: this._formatMovers(movers.losers?.slice(0, 5) || []),
        active: this._formatMovers(movers.active?.slice(0, 5) || [])
      };
    } catch (error) {
      errorTracker.track(error, '_fetchMarketMovers');
      throw error;
    }
  }

  async _fetchMarketNews() {
    try {
      const news = await braveService.getMarketNews('stock market news today');
      return (news.articles?.slice(0, 10) || [])
        .filter(article => validateNewsData(article))
        .map(article => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          source: article.source,
          publishedAt: sanitizeDate(article.published_time)
        }));
    } catch (error) {
      errorTracker.track(error, '_fetchMarketNews');
      throw error;
    }
  }

  async _fetchStockNews(symbol) {
    if (!symbol) return [];
    try {
      const news = await braveService.getMarketNews(`${symbol} stock news`);
      return news.articles?.slice(0, 3) || [];
    } catch (error) {
      errorTracker.track(error, '_fetchStockNews');
      return [];
    }
  }

  _formatMacroData(fredData, gdpData) {
    try {
      const grades = this._calculateMacroGrades(fredData);
      return {
        indicators: {
          gdp: this._formatIndicator(gdpData?.current),
          unemployment: this._formatIndicator(fredData.UNEMPLOYMENT),
          inflation: this._formatIndicator(fredData.INFLATION),
          consumerSentiment: this._formatIndicator(fredData.CONSUMER_SENTIMENT)
        },
        grades,
        timestamp: Date.now()
      };
    } catch (error) {
      errorTracker.track(error, '_formatMacroData');
      return null;
    }
  }

  _calculateMacroGrades(data) {
    return {
      overall: 'B+',
      components: {
        growth: 'A-',
        inflation: 'B',
        employment: 'A',
        sentiment: 'B+'
      }
    };
  }

  _formatMovers(movers) {
    return movers
      .filter(mover => validateMarketData(mover))
      .map(mover => ({
        symbol: mover.symbol,
        name: mover.name,
        price: sanitizeNumber(mover.price),
        change: sanitizeNumber(mover.change),
        changePercent: sanitizeNumber(mover.change_percentage),
        volume: sanitizeNumber(mover.volume)
      }));
  }

  _formatIndicator(data) {
    if (!data?.value) return null;
    return {
      value: sanitizeNumber(data.value),
      date: sanitizeDate(data.date),
      trend: this._calculateTrend(data)
    };
  }

  _calculateMarketHealth(indices, macro) {
    try {
      const technical = this._calculateTechnicalScore(indices);
      const fundamental = this._calculateFundamentalScore(macro);
      const sentiment = this._calculateSentimentScore(indices);

      return {
        score: Math.round((technical + fundamental + sentiment) / 3),
        trend: this._determineTrend(indices),
        factors: { technical, fundamental, sentiment },
        timestamp: Date.now()
      };
    } catch (error) {
      errorTracker.track(error, '_calculateMarketHealth');
      return {
        score: 50,
        trend: 'neutral',
        factors: { technical: 50, fundamental: 50, sentiment: 50 },
        timestamp: Date.now()
      };
    }
  }

  _calculateTechnicalScore(indices) {
    return 70; // Placeholder
  }

  _calculateFundamentalScore(macro) {
    return 80; // Placeholder
  }

  _calculateSentimentScore(indices) {
    return 75; // Placeholder
  }

  _determineTrend(indices) {
    const spyChange = indices.find(i => i.symbol === 'SPY')?.changePercent || 0;
    return spyChange > 0.5 ? 'bullish' : spyChange < -0.5 ? 'bearish' : 'neutral';
  }

  _getIndexName(symbol) {
    const names = {
      'SPY': 'S&P 500 ETF',
      'QQQ': 'Nasdaq 100 ETF',
      'DIA': 'Dow Jones ETF',
      'IWM': 'Russell 2000 ETF',
      'VIX': 'Volatility Index'
    };
    return names[symbol] || symbol;
  }

  _calculateTrend(data) {
    return 'neutral'; // Placeholder
  }
}

export default new MarketAnalysisService();