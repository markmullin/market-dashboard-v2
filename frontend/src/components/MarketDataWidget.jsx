import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function MarketDataWidget({ symbol = 'AAPL' }) {
  const { data: marketData, error, isLoading } = useQuery({
    queryKey: ['marketData', symbol],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/market/latest/${symbol}`);
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-red-500">Error: {error.message}</p>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{symbol}</h2>
      {marketData && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-lg font-semibold">${marketData.close?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Volume</p>
            <p className="text-lg font-semibold">{marketData.volume?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="text-lg font-semibold">
              {new Date(marketData.datetime).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}