import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function StockWidget({ symbol }) {
  const { data: marketData, error, isLoading } = useQuery({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/market/stock/${symbol}`);
      console.log('Received market data:', data);
      return data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="crystal-effect rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
          <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
          <div className="h-8 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crystal-effect rounded-2xl p-6">
        <p className="text-red-500 font-medium">Error: {error.message}</p>
      </div>
    );
  }

  const changePercent = parseFloat(marketData?.change_p) || 0;
  const closePrice = parseFloat(marketData?.close) || 0;
  const volume = parseInt(marketData?.volume) || 0;

  return (
    <div className="crystal-effect rounded-2xl p-6 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{symbol}</h3>
          <p className="text-sm text-gray-500 mt-1">Real-time Data</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-sm font-medium shimmer-effect
          ${changePercent >= 0 
            ? 'bg-green-50/50 text-green-700' 
            : 'bg-red-50/50 text-red-700'}`}>
          {changePercent.toFixed(2)}%
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50/50 rounded-xl p-4 crystal-effect">
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <p className="text-xl font-semibold text-gray-900">
              ${closePrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-4 crystal-effect">
            <p className="text-sm text-gray-500 mb-1">Volume</p>
            <p className="text-xl font-semibold text-gray-900">
              {volume.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="h-0.5 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full overflow-hidden">
          <div className="h-full shimmer-effect" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}