import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

class BEAService {
  constructor() {
    this.baseURL = 'https://apps.bea.gov/api/data';
    this.apiKey = process.env.BEA_API_KEY;
  }

  async getGDPData() {
    const cacheKey = 'bea_gdp';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(this.baseURL, {
      params: {
        UserID: this.apiKey,
        method: 'GetData',
        datasetname: 'NIPA',
        TableName: 'T10101',
        Frequency: 'Q',
        Year: 'X',
        ResultFormat: 'JSON'
      }
    });
    
    const data = this._formatGDPData(response.data);
    cache.set(cacheKey, data);
    return data;
  }

  async getIndustryData() {
    const cacheKey = 'bea_industry';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(this.baseURL, {
      params: {
        UserID: this.apiKey,
        method: 'GetData',
        datasetname: 'GDPbyIndustry',
        Frequency: 'A',
        Year: 'LAST5',
        ResultFormat: 'JSON'
      }
    });
    
    const data = this._formatIndustryData(response.data);
    cache.set(cacheKey, data);
    return data;
  }

  _formatGDPData(rawData) {
    // Implementation for formatting GDP data
    return {
      current: rawData.BEAAPI.Results.Data[0],
      historical: rawData.BEAAPI.Results.Data.slice(1)
    };
  }

  _formatIndustryData(rawData) {
    // Implementation for formatting industry data
    return {
      sectors: rawData.BEAAPI.Results.Data.reduce((acc, curr) => {
        if (!acc[curr.Industry]) {
          acc[curr.Industry] = [];
        }
        acc[curr.Industry].push(curr);
        return acc;
      }, {})
    };
  }
}

export default new BEAService();