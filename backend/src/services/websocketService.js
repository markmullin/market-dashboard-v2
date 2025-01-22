import errorTracker from '../utils/errorTracker.js';
import marketAnalysisService from './marketAnalysisService.js';
import { WebSocketServer } from 'ws';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.updateInterval = 5000;
    this.clients = new Set();
  }

  initialize(server) {
    try {
      this.wss = new WebSocketServer({ server });
      
      this.wss.on('connection', (ws) => {
        this.clients.add(ws);
        
        ws.on('close', () => {
          this.clients.delete(ws);
        });
      });

      this.startBroadcasting();
    } catch (error) {
      errorTracker.track(error, 'WebSocketService.initialize');
    }
  }

  startBroadcasting() {
    setInterval(async () => {
      try {
        const marketData = await marketAnalysisService.getMarketSnapshot();
        this.broadcast(marketData);
      } catch (error) {
        errorTracker.track(error, 'WebSocketService.broadcast');
      }
    }, this.updateInterval);
  }

  broadcast(data) {
    const message = JSON.stringify({
      type: 'MARKET_UPDATE',
      data,
      timestamp: Date.now()
    });

    this.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }
}

export default new WebSocketService();