import React, { useState, useEffect } from 'react';
import MacroMetric from './MacroMetric';

const API_BASE_URL = 'http://localhost:5000/api/market';

const MacroDashboard = () => {
  const [macroData, setMacroData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/macro`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data) {
          throw new Error('No data received from server');
        }

        setMacroData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching macro data:', err);
        setError('Failed to load macro metrics');
        // Keep the previous data if it exists
        setMacroData(prevData => prevData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading && !macroData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error && !macroData) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Macroeconomic Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MacroMetric 
          title="Growth & Economic Health" 
          data={macroData?.growthAndHealth} 
        />
        <MacroMetric 
          title="Monetary Policy & Rates" 
          data={macroData?.monetaryPolicy} 
        />
        <MacroMetric 
          title="Inflation & Commodities" 
          data={macroData?.inflationMetrics} 
        />
        <MacroMetric 
          title="Global Markets" 
          data={macroData?.globalMarkets} 
        />
      </div>
    </div>
  );
};

export default MacroDashboard;