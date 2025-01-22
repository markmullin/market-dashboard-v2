import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import marketRoutes from './routes/marketRoutes.js';
import websocketService from './services/websocketService.js';
import errorTracker from './utils/errorTracker.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} [${new Date().toISOString()}]`);
  next();
});

// API validation middleware
app.use((req, res, next) => {
  const requiredApis = {
    'EOD API': process.env.EOD_API_KEY,
    'Brave API': process.env.BRAVE_API_KEY,
    'FRED API': process.env.FRED_API_KEY,
    'BEA API': process.env.BEA_API_KEY
  };

  const missingApis = Object.entries(requiredApis)
    .filter(([_, key]) => !key)
    .map(([name]) => name);

  if (missingApis.length > 0) {
    const error = new Error(`Missing API keys: ${missingApis.join(', ')}`);
    errorTracker.track(error, 'API Validation');
    next(error);
  } else {
    next();
  }
});

// Routes
app.use('/api/market', marketRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const errors = errorTracker.getRecent(5);
  res.json({ 
    status: errors.length === 0 ? 'healthy' : 'degraded',
    apis: {
      eod: Boolean(process.env.EOD_API_KEY),
      brave: Boolean(process.env.BRAVE_API_KEY),
      fred: Boolean(process.env.FRED_API_KEY),
      bea: Boolean(process.env.BEA_API_KEY)
    },
    recentErrors: errors.length,
    timestamp: Date.now()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  errorTracker.track(err, `${req.method} ${req.path}`);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    timestamp: Date.now()
  });
});

// Initialize WebSocket
websocketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});