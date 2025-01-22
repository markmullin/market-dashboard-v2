import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h4 className="font-bold text-gray-800">{label}</h4>
      <div className="mt-2">
        <p className="text-sm">Score: {data.score}</p>
        <p className="text-sm">Grade: {data.grade}</p>
        {data.metrics && Object.entries(data.metrics).map(([key, value]) => (
          <p key={key} className="text-sm capitalize">
            {key.replace(/_/g, ' ')}: {typeof value === 'number' ? value.toFixed(2) : value}
          </p>
        ))}
      </div>
    </div>
  );
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

const getGradeColor = (grade) => {
  const colors = {
    'A+': 'text-emerald-500',
    'A': 'text-emerald-400',
    'A-': 'text-emerald-300',
    'B+': 'text-green-500',
    'B': 'text-green-400',
    'B-': 'text-green-300',
    'C+': 'text-yellow-500',
    'C': 'text-yellow-400',
    'C-': 'text-yellow-300',
    'D+': 'text-orange-500',
    'D': 'text-orange-400',
    'D-': 'text-orange-300',
    'F': 'text-red-500'
  };
  return colors[grade] || 'text-gray-500';
};

const MarketScoreCard = ({ data }) => {
  if (!data || !data.overall) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Market Score</h2>
        <div className="text-gray-500">Loading market data...</div>
      </div>
    );
  }

  const { overall, components } = data;
  const chartData = [];
  
  if (components) {
    Object.entries(components).forEach(([name, value]) => {
      chartData.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        score: value.score,
        grade: value.grade,
        metrics: value.metrics
      });
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Market Score</h2>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(overall.score)}`}>
            {overall.score}
          </div>
          <div className={`text-xl ${getGradeColor(overall.grade)}`}>
            Grade: {overall.grade}
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{
                stroke: '#4f46e5',
                strokeWidth: 2,
                r: 4,
                strokeDasharray: ''
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item) => (
          <div key={item.name} className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-600">{item.name}</div>
            <div className="flex justify-between items-center mt-1">
              <span className={getScoreColor(item.score)}>{item.score}</span>
              <span className={getGradeColor(item.grade)}>{item.grade}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketScoreCard;