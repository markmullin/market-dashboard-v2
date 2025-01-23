import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

const SECTOR_MAP = {
  XLF: { name: 'Financial', color: 'rgb(54, 162, 235)' },
  XLK: { name: 'Technology', color: 'rgb(75, 192, 192)' },
  XLV: { name: 'Healthcare', color: 'rgb(153, 102, 255)' },
  XLE: { name: 'Energy', color: 'rgb(255, 159, 64)' },
  XLI: { name: 'Industrial', color: 'rgb(255, 99, 132)' },
  XLP: { name: 'Consumer Staples', color: 'rgb(255, 205, 86)' },
  XLY: { name: 'Consumer Discretionary', color: 'rgb(201, 203, 207)' },
  XLB: { name: 'Materials', color: 'rgb(75, 192, 192)' },
  XLU: { name: 'Utilities', color: 'rgb(54, 162, 235)' },
  XLRE: { name: 'Real Estate', color: 'rgb(153, 102, 255)' },
  XLC: { name: 'Communication', color: 'rgb(255, 159, 64)' }
};

const eodService = {
  baseURL: 'https://eodhd.com/api',
  
  async getRealTimeQuote(symbol) {
    const cacheKey = `eod_quote_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/real-time/${symbol}.US`, {
        params: {
          api_token: process.env.EOD_API_KEY,
          fmt: 'json'
        }
      });
    
      const data = response.data;
      const result = {
        symbol: symbol,
        close: data.close || data.price,
        change: data.change,
        change_p: data.change_p || data.change_percent,
        volume: data.volume,
        timestamp: data.timestamp,
        name: SECTOR_MAP[symbol]?.name || symbol
      };
    
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      return null;
    }
  },

  async getMarketMovers() {
    const cacheKey = 'eod_market_movers';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const majorIndices = ['SPY', 'QQQ', 'IWM', 'DIA', 'TLT'];
    const quotes = await Promise.all(
      majorIndices.map(symbol => this.getRealTimeQuote(symbol))
    );

    const result = quotes.reduce((acc, quote) => {
      if (quote && quote.change_p) {
        if (quote.change_p > 0) {
          acc.gainers.push(quote);
        } else {
          acc.losers.push(quote);
        }
      }
      return acc;
    }, { gainers: [], losers: [] });

    result.gainers.sort((a, b) => b.change_p - a.change_p);
    result.losers.sort((a, b) => a.change_p - b.change_p);
    
    cache.set(cacheKey, result);
    return result;
  }
};

const marketService = {
  async getData() {
    const symbols = ['SPY', 'QQQ', 'IWM', 'DIA', 'TLT'];
    const quotes = await Promise.all(
      symbols.map(symbol => eodService.getRealTimeQuote(symbol))
    );
    
    return quotes.reduce((acc, quote) => {
      if (quote) {
        acc[quote.symbol] = quote;
      }
      return acc;
    }, {});
  },

  async getSectorData() {
    const sectorSymbols = Object.keys(SECTOR_MAP);
    const quotes = await Promise.all(
      sectorSymbols.map(symbol => eodService.getRealTimeQuote(symbol))
    );
    
    return quotes
      .filter(quote => quote !== null)
      .map(quote => ({
        ...quote,
        color: SECTOR_MAP[quote.symbol].color
      }))
      .sort((a, b) => b.change_p - a.change_p);
  },

  async getDataForSymbols(symbols) {
    const quotes = await Promise.all(
      symbols.map(symbol => eodService.getRealTimeQuote(symbol))
    );
    
    return quotes.reduce((acc, quote) => {
      if (quote) {
        acc[quote.symbol] = quote;
      }
      return acc;
    }, {});
  },

  async getHistoricalData(symbol) {
    const cacheKey = `history_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${eodService.baseURL}/eod/${symbol}.US`, {
        params: {
          api_token: process.env.EOD_API_KEY,
          fmt: 'json',
          period: 'd',
          from: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      });

      const data = response.data;
      
      // Calculate moving 200-day MA for each point
      const last30Days = data.slice(-30).map((item, index) => {
        // Get 200 days of data before this point for MA calculation
        const maWindow = data.slice(Math.max(0, index - 200 + 30), index + 30);
        const ma200 = maWindow.reduce((sum, d) => sum + d.close, 0) / maWindow.length;

        return {
          date: item.date,
          price: item.close,
          ma200: ma200
        };
      });

      cache.set(cacheKey, last30Days);
      return last30Days;
    } catch (error) {
      console.error(`Error fetching history for ${symbol}:`, error.message);
      return [];
    }
  }
};

export { eodService, marketService };