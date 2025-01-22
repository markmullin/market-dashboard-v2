import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/market';

const ThemeCard = ({ theme }) => {
  const getPerformanceColor = (performance) => {
    const numericPerformance = parseFloat(performance?.daily || 0);
    if (numericPerformance > 0) return 'text-green-500';
    if (numericPerformance < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{theme.name}</h3>
          <p className="text-gray-600">{theme.description}</p>
        </div>
        <div className={`text-right ${getPerformanceColor(theme.performance)}`}>
          <div className="text-2xl font-bold">
            {parseFloat(theme.performance?.daily || 0).toFixed(2)}%
          </div>
          <div className="text-sm">
            {theme.performance?.trend === 'up' ? '▲' : '▼'} {theme.performance?.strength}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {theme.stocks?.map((stock) => (
          <div key={stock.symbol || stock} className="flex justify-between items-center">
            <span className="font-medium">{stock.symbol || stock}</span>
            <div className={getPerformanceColor(stock.changePercent)}>
              {parseFloat(stock.changePercent || 0).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketThemes = () => {
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/themes`);
        if (!response.ok) {
          throw new Error('Failed to fetch themes');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setThemes(result.data);
        } else {
          throw new Error('Invalid themes data format');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching themes:', err);
        setError('Failed to load market themes');
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
    const interval = setInterval(fetchThemes, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!themes || themes.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        No market themes available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Market Themes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  );
};

export default MarketThemes;