import axios from 'axios';

class EODService {
  constructor() {
    this.baseURL = 'https://eodhistoricaldata.com/api';
    this.apiKey = process.env.EOD_API_KEY;
  }

  async getMarketData() {
    try {
      console.log('Fetching market data...');
      
      // First try bulk quote endpoint
      const stockSymbols = ['SPY', 'QQQ', 'DIA', 'IWM'].map(s => `${s}.US`).join(',');
      console.log('Fetching bulk quotes for:', stockSymbols);
      
      const stocksResponse = await axios.get(
        `${this.baseURL}/real-time/${stockSymbols}`, {
          params: {
            api_token: this.apiKey,
            fmt: 'json'
          }
        }
      );

      console.log('Stock data received:', stocksResponse.data);

      // Skip VIX for now since it's causing issues
      const stocksData = Array.isArray(stocksResponse.data) ? stocksResponse.data : [stocksResponse.data];
      const normalizedData = stocksData.map(this.normalizeStockData.bind(this));

      console.log('Normalized market data:', normalizedData);
      return normalizedData;

    } catch (error) {
      console.error('Error fetching market data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  normalizeStockData(data) {
    try {
      // Extract symbol from code (remove .US suffix)
      const symbol = (data.code || '').replace('.US', '').replace('^', '');
      
      return {
        symbol,
        code: data.code,
        name: this.getStockName(symbol),
        price: this.getNumericValue(data.close || data.price),
        open: this.getNumericValue(data.open),
        high: this.getNumericValue(data.high),
        low: this.getNumericValue(data.low),
        previousClose: this.getNumericValue(data.previousClose),
        volume: this.getNumericValue(data.volume),
        change: this.getNumericValue(data.change),
        changePercent: this.getNumericValue(data.change_p || data.change_percent),
        timestamp: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error normalizing stock data:', {
        error: error.message,
        data: data
      });
      return null;
    }
  }

  getNumericValue(value) {
    if (value === null || value === undefined || value === 'NA') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  getStockName(symbol) {
    const names = {
      'SPY': 'S&P 500 ETF',
      'QQQ': 'Nasdaq 100 ETF',
      'DIA': 'Dow Jones ETF',
      'IWM': 'Russell 2000 ETF',
      'VIX': 'Volatility Index'
    };
    return names[symbol] || symbol;
  }

  // Keep these methods for other functionality
  async getStockDetails(symbol) {
    try {
      const response = await axios.get(
        `${this.baseURL}/fundamentals/${symbol}.US`, {
          params: {
            api_token: this.apiKey,
            fmt: 'json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching stock details:', error);
      throw error;
    }
  }

  async getSectorPerformance() {
    try {
      const response = await axios.get(
        `${this.baseURL}/market-overview`, {
          params: {
            api_token: this.apiKey,
            fmt: 'json',
            exchanges: 'US'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      throw error;
    }
  }
}

export default new EODService();