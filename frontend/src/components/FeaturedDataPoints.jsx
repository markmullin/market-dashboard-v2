import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = 'http://localhost:5000/api';

// Theme Card Component
const ThemeCard = ({ theme }) => (
  <div className="crystal-effect rounded-xl p-6 hover:shadow-lg transition-all">
    <h3 className="text-xl font-semibold text-gray-900">{theme.name}</h3>
    <p className="mt-2 text-gray-600 text-sm">{theme.description}</p>
    
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-500">Related Tickers</h4>
      <div className="flex flex-wrap gap-2 mt-2">
        {theme.tickers.map(ticker => (
          <span key={ticker} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
            {ticker}
          </span>
        ))}
      </div>
    </div>

    {theme.news?.length > 0 && (
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-500">Latest News</h4>
        <ul className="mt-2 space-y-2">
          {theme.news.map((item, idx) => (
            <li key={idx} className="text-sm">
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:text-blue-800">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Market Mover Card Component
const MarketMoverCard = ({ mover }) => {
  const chartData = [
    { name: 'Change', value: mover.change_p }
  ];

  return (
    <div className="crystal-effect rounded-xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{mover.symbol}</h3>
          <p className={`text-2xl font-bold mt-1 ${
            mover.change_p >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {mover.change_p > 0 ? '+' : ''}{mover.change_p.toFixed(2)}%
          </p>
        </div>
        
        <div className="w-32 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar dataKey="value">
                <Cell fill={mover.change_p >= 0 ? '#22c55e' : '#ef4444'} />
              </Bar>
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {mover.news?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-500">Latest News</h4>
          <ul className="mt-2 space-y-2">
            {mover.news.map((item, idx) => (
              <li key={idx} className="text-sm">
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:text-blue-800">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function FeaturedDataPoints() {
  const { data: themes = [], isLoading: themesLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/market/themes`);
      return data;
    }
  });

  const { data: movers = [], isLoading: moversLoading } = useQuery({
    queryKey: ['movers'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/market/movers`);
      return data;
    }
  });

  if (themesLoading || moversLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-gray-100 rounded-xl"></div>
        <div className="h-48 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Market Themes Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Market Themes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map(theme => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </section>

      {/* Market Movers Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Market Movers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movers.slice(0, 4).map(mover => (
            <MarketMoverCard key={mover.symbol} mover={mover} />
          ))}
        </div>
      </section>
    </div>
  );
}