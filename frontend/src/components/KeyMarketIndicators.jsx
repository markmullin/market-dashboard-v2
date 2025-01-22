import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/market';

const IndicatorCard = ({ symbol, data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const changeColor = data.price.changePercent >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">{symbol}</h3>
        <div className={changeColor}>
          {data.price.changePercent >= 0 ? '+' : ''}
          {data.price.changePercent.toFixed(2)}%
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Real-time Data</div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Price</span>
          <span className="font-medium">${data.price.current.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Volume</span>
          <span className="font-medium">{data.price.volume.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const KeyMarketIndicators = () => {
  const [indicatorsData, setIndicatorsData] = useState({});
  const [error, setError] = useState(null);

  const indicators = [
    'SPY',  // S&P 500
    'QQQ',  // NASDAQ
    'DIA',  // Dow Jones
    'TLT',  // 20+ Year Treasury
    'VWO',  // Emerging Markets
    'IBIT', // Bitcoin ETF
    'UUP'   // US Dollar
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = indicators.map(async (symbol) => {
          const response = await fetch(`${API_BASE_URL}/stock/${symbol}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${symbol}`);
          }
          const data = await response.json();
          return [symbol, data];
        });

        const results = await Promise.all(promises);
        const newData = Object.fromEntries(results);
        setIndicatorsData(newData);
        setError(null);
      } catch (err) {
        console.error('Error fetching indicators:', err);
        setError('Error loading market data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Key Market Indicators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {indicators.map((symbol) => (
          <IndicatorCard
            key={symbol}
            symbol={symbol}
            data={indicatorsData[symbol]}
          />
        ))}
      </div>
      {error && (
        <div className="text-red-500 mt-4">{error}</div>
      )}
    </div>
  );
};

export default KeyMarketIndicators;