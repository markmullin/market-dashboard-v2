import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CircularProgress = ({ score, size = 200 }) => {
  const radius = size * 0.35;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-green-500 transition-all duration-1000 ease-in-out"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl font-bold">{score}</span>
          <span className="block text-sm text-gray-500">Market Score</span>
        </div>
      </div>
    </div>
  );
};

const MarketConditions = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/market/snapshot');
        console.log('Market data response:', response.data);  // Debug log
        if (response.data.success !== false) {
          setMarketData(response.data.data || response.data);
          setError(null);
        } else {
          throw new Error(response.data.error || 'Failed to fetch market data');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError(err.message || 'Failed to load market conditions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="w-48 h-48 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-gray-500 text-center">No market data available</div>
      </div>
    );
  }

  console.log('Rendering market data:', marketData);  // Debug log
  const { conditions, indices } = marketData;

  // Find the primary market index (SPY) or use first available index
  const primaryIndex = indices.find(idx => idx.symbol === 'SPY') || indices[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
        {/* Score Circle */}
        <div className="md:w-1/3 flex justify-center">
          <CircularProgress score={conditions.score} />
        </div>

        {/* Analysis */}
        <div className="md:w-2/3 md:pl-8">
          <h2 className="text-2xl font-bold mb-4">Market Environment</h2>
          
          {/* Market Summary */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed mb-4">
              {conditions.analysis.summary}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">S&P 500:</span>
              <div className="text-right">
                <span className="font-medium">${primaryIndex.price.toFixed(2)}</span>
                <span className={`ml-2 ${primaryIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {primaryIndex.change >= 0 ? '+' : ''}{primaryIndex.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Market Indices */}
          <div className="mt-4 grid grid-cols-1 gap-4">
            {indices.map((index) => (
              index.symbol !== 'SPY' && (
                <div key={index.symbol} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-500">
                      {index.name}
                    </div>
                    <div className={`text-sm font-semibold ${
                      index.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketConditions;