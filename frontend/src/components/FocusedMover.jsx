import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api/market';

const PriceChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const FocusedMover = () => {
  const [moverData, setMoverData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/focused-mover`);
        if (!response.ok) {
          throw new Error('Failed to fetch market mover');
        }
        const data = await response.json();
        setMoverData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching mover:', err);
        setError('Failed to load market mover');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Market Mover in Focus</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Market Mover in Focus</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!moverData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Market Mover in Focus</h2>
        <div className="text-gray-500">No market mover data available</div>
      </div>
    );
  }

  const changeColor = moverData.price?.changePercent >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Market Mover in Focus</h2>
          <div className="mt-2">
            <span className="text-xl font-bold">{moverData.companyName}</span>
            <span className="text-gray-500 ml-2">({moverData.symbol})</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            ${moverData.price?.current.toFixed(2)}
          </div>
          <div className={`text-lg ${changeColor}`}>
            {moverData.price?.changePercent >= 0 ? '+' : ''}
            {moverData.price?.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <PriceChart data={moverData.priceHistory} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="font-bold mb-2">Company Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sector:</span>
              <span>{moverData.company?.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Industry:</span>
              <span>{moverData.company?.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Market Cap:</span>
              <span>{moverData.company?.marketCap}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2">Analysis</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span>{moverData.analysis?.riskLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sentiment:</span>
              <span>{moverData.analysis?.sentiment}</span>
            </div>
          </div>
        </div>
      </div>

      {moverData.analysis?.moveReason && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Move Reasons</h3>
          <ul className="list-disc list-inside space-y-1">
            {moverData.analysis.moveReason.map((reason, index) => (
              <li key={index} className="text-gray-600">{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {moverData.analysis?.technicalSignals && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Technical Signals</h3>
          <ul className="list-disc list-inside space-y-1">
            {moverData.analysis.technicalSignals.map((signal, index) => (
              <li key={index} className="text-gray-600">{signal}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FocusedMover;