import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

const eodService = {
  baseURL: 'https://eodhd.com/api',
  
  async getRealTimeQuote(symbol) {
    const cacheKey = `eod_quote_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${this.baseURL}/intraday/${symbol}.US`, {
      params: {
        api_token: process.env.EOD_API_KEY,
        interval: '5m',
        fmt: 'json'
      }
    });
    
    const data = response.data[0] || {};
    cache.set(cacheKey, {
      symbol: symbol,
      close: data.close,
      change: data.close - data.open,
      change_p: ((data.close - data.open) / data.open) * 100,
      volume: data.volume,
      timestamp: data.timestamp
    });
    return data;
  },

  async getMarketMovers() {
    const cacheKey = 'eod_market_movers';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const majorIndices = ['SPY', 'QQQ', 'IWM', 'DIA'];
    const quotes = await Promise.all(
      majorIndices.map(symbol => this.getRealTimeQuote(symbol))
    );

    const result = {
      gainers: quotes
        .filter(q => q.change_p > 0)
        .sort((a, b) => b.change_p - a.change_p),
      losers: quotes
        .filter(q => q.change_p < 0)
        .sort((a, b) => a.change_p - b.change_p)
    };
    
    cache.set(cacheKey, result);
    return result;
  }
};

const fredService = {
  baseURL: 'https://api.stlouisfed.org/fred',

  async getEconomicIndicator(seriesId) {
    const cacheKey = `fred_${seriesId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${this.baseURL}/series/observations`, {
      params: {
        series_id: seriesId,
        api_key: process.env.FRED_API_KEY,
        file_type: 'json',
        sort_order: 'desc',
        limit: 1
      }
    });
    
    cache.set(cacheKey, response.data);
    return response.data;
  },

  async getMacroIndicators() {
    const indicators = {
      GDP: 'GDP',
      UNEMPLOYMENT: 'UNRATE',
      INFLATION: 'CPIAUCSL',
      CONSUMER_SENTIMENT: 'UMCSENT'
    };

    const results = {};
    for (const [key, seriesId] of Object.entries(indicators)) {
      results[key] = await this.getEconomicIndicator(seriesId);
    }
    return results;
  }
};

const braveService = {
  baseURL: 'https://api.search.brave.com/api/v1',

  async getMarketNews(query) {
    const cacheKey = `brave_news_${query}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${this.baseURL}/search`, {
      params: {
        q: query,
        token: process.env.BRAVE_API_KEY
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      }
    });
    
    cache.set(cacheKey, response.data);
    return response.data;
  }
};

export { eodService, fredService, braveService };