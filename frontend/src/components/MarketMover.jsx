import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

export default function MarketMover() {
  // Fetch the focused mover data
  const { data: moverData, isLoading } = useQuery({
    queryKey: ['focusedMover'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/market/focused-mover`);
      return response.data;
    },
    refetchInterval: 60000
  });

  // Early return for loading state
  if (isLoading || !moverData) {
    return null;
  }

  // Process historical data for chart
  const chartData = moverData.historicalData?.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    price: point.close,
    volume: point.volume
  })) || [];

  return (
    <div className="crystal-effect rounded-2xl p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{moverData.symbol.replace('.US', '')}</h2>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl font-bold">
              ${moverData.close?.toFixed(2)}
            </span>
            <span className={`text-lg font-semibold ${
              moverData.change_p >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {moverData.change_p > 0 ? '+' : ''}{moverData.change_p?.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={moverData.change_p >= 0 ? '#22c55e' : '#ef4444'} 
                  stopOpacity={0.1}
                />
                <stop 
                  offset="95%" 
                  stopColor={moverData.change_p >= 0 ? '#22c55e' : '#ef4444'} 
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={moverData.change_p >= 0 ? '#22c55e' : '#ef4444'} 
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* News Section */}
      {moverData.news && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Latest News</h3>
          <div className="space-y-3">
            {moverData.news.map((item, index) => (
              <a 
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}