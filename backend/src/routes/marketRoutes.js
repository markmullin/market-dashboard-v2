import express from 'express';
import marketAnalysisService from '../services/marketAnalysisService.js';
import { marketService } from '../services/apiServices.js';
import errorTracker from '../utils/errorTracker.js';

const router = express.Router();

router.get('/data', async (req, res, next) => {
  try {
    console.log('Fetching market data...');
    const data = await marketService.getData();
    console.log('Market data:', data);
    const formattedData = Object.entries(data).map(([symbol, quote]) => ({
      symbol: symbol,
      name: quote.name || symbol,
      close: quote.close,
      change_p: quote.change_p
    }));
    res.json(formattedData);
  } catch (error) {
    console.error('Market data error:', error);
    next(error);
  }
});

router.get('/sectors', async (req, res, next) => {
  try {
    console.log('Fetching sector data...');
    const sectors = await marketService.getSectorData();
    res.json(sectors);
  } catch (error) {
    console.error('Sector data error:', error);
    next(error);
  }
});

router.get('/macro', async (req, res, next) => {
  try {
    console.log('Fetching macro data...');
    const macroSymbols = ['TLT', 'UUP', 'IBIT'];
    const macroData = await marketService.getDataForSymbols(macroSymbols);
    console.log('Macro data:', macroData);
    
    res.json({
      tlt: {
        price: macroData.TLT?.close || 0,
        change: macroData.TLT?.change_p || 0
      },
      usdIndex: {
        price: macroData.UUP?.close || 0,
        change: macroData.UUP?.change_p || 0
      },
      bitcoin: {
        price: macroData.IBIT?.close || 0,
        change: macroData.IBIT?.change_p || 0
      }
    });
  } catch (error) {
    console.error('Macro data error:', error);
    next(error);
  }
});

router.get('/mover', async (req, res, next) => {
  try {
    const mover = await marketAnalysisService.getTopMover();
    res.json(mover);
  } catch (error) {
    console.error('Market mover error:', error);
    next(error);
  }
});

router.get('/mover-history', async (req, res, next) => {
  try {
    const mover = await marketAnalysisService.getTopMover();
    if (!mover) {
      return res.json([]);
    }

    const history = await marketService.getHistoricalData(mover.symbol);
    res.json(history);
  } catch (error) {
    console.error('Mover history error:', error);
    next(error);
  }
});

export default router;