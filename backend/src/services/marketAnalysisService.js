import { eodService, marketService } from './apiServices.js';

class MarketAnalysisService {
  async getMarketSnapshot() {
    try {
      return await marketService.getData();
    } catch (error) {
      console.error('Error getting market snapshot:', error);
      throw error;
    }
  }

  async getTopMover() {
    try {
      const movers = await eodService.getMarketMovers();
      const topMover = movers.gainers[0] || movers.losers[0];
      
      if (!topMover) {
        return {
          symbol: 'SPY',
          price: 0,
          changePercent: 0,
          reason: 'No significant market moves'
        };
      }

      return {
        symbol: topMover.symbol,
        price: topMover.close,
        changePercent: topMover.change_p,
        reason: `${topMover.symbol} moved ${topMover.change_p.toFixed(2)}% today`
      };
    } catch (error) {
      console.error('Error getting top mover:', error);
      throw error;
    }
  }

  async searchStocks(query) {
    // Basic symbol search
    const symbols = ['SPY', 'QQQ', 'DIA', 'IWM', 'TLT'];
    return symbols
      .filter(symbol => symbol.toLowerCase().includes(query.toLowerCase()))
      .map(symbol => ({
        symbol,
        type: 'ETF'
      }));
  }
}

export default new MarketAnalysisService();