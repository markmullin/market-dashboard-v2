import axios from 'axios';

class IntradayService {
  constructor() {
    this.baseURL = process.env.EOD_API_BASE_URL;
    this.apiKey = process.env.EOD_API_KEY;
    this.cache = new Map();
    this.cacheDuration = parseInt(process.env.CACHE_DURATION) || 300000;
  }

  async getIntradayData(symbol, interval = '5m') {
    try {
      // Add .US suffix if not present
      const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.US`;
      
      // Check cache first
      const cacheKey = `${formattedSymbol}-${interval}`;
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
        return cachedData.data;
      }

      const response = await axios.get(`${this.baseURL}/intraday/${formattedSymbol}`, {
        params: {
          api_token: this.apiKey,
          fmt: 'json',
          interval: interval
        }
      });

      // Cache the response
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response.data
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching intraday data:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch intraday data');
    }
  }

  async getLatestPrice(symbol) {
    try {
      const data = await this.getIntradayData(symbol);
      if (Array.isArray(data) && data.length > 0) {
        return data[data.length - 1];
      }
      throw new Error('No recent price data available');
    } catch (error) {
      console.error('Error fetching latest price:', error.message);
      throw error;
    }
  }
}

export default new IntradayService();