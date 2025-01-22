import express from 'express';
import marketAnalysisService from '../services/marketAnalysisService.js';
import errorTracker from '../utils/errorTracker.js';

const router = express.Router();

router.get('/snapshot', async (req, res, next) => {
  try {
    const marketData = await marketAnalysisService.getMarketSnapshot();
    res.json({
      success: true,
      data: marketData,
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ success: true, results: [] });
    }

    const results = await marketAnalysisService.searchStocks(query);
    res.json({
      success: true,
      results,
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

export default router;