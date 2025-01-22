import React, { useState } from 'react';

const GradeDisplay = ({ grade, score }) => {
  if (!grade || !score) return null;
  
  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-emerald-500',
      'A': 'bg-emerald-400',
      'A-': 'bg-emerald-300',
      'B+': 'bg-green-500',
      'B': 'bg-green-400',
      'B-': 'bg-green-300',
      'C+': 'bg-yellow-500',
      'C': 'bg-yellow-400',
      'C-': 'bg-yellow-300',
      'D+': 'bg-orange-500',
      'D': 'bg-orange-400',
      'D-': 'bg-orange-300',
      'F': 'bg-red-500'
    };
    return colors[grade] || 'bg-gray-400';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`px-3 py-1 rounded-lg text-white font-bold ${getGradeColor(grade)}`}>
        {grade}
      </div>
      <span className="text-sm text-gray-500">Score: {score}</span>
    </div>
  );
};

const ComponentDetails = ({ components }) => {
  if (!components) return null;

  return (
    <div className="space-y-2">
      {Object.entries(components).map(([name, { grade, score }]) => (
        <div key={name} className="flex justify-between items-center">
          <span className="capitalize text-sm">{name}:</span>
          <GradeDisplay grade={grade} score={score} />
        </div>
      ))}
    </div>
  );
};

const TrendIndicator = ({ trend }) => {
  if (!trend) return null;

  const isPositive = ['improving', 'strong', 'expanding', 'contained'].includes(trend);
  
  return (
    <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      <span className="mr-1">{isPositive ? '↑' : '↓'}</span>
      <span className="capitalize text-sm">{trend}</span>
    </div>
  );
};

const MacroMetric = ({ title, data }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-4 text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  const { grade, score, components, description, impact, context } = data;

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 bg-white rounded-lg shadow ${
        isHovered ? 'shadow-lg transform scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{title}</h3>
            {grade && score && <GradeDisplay grade={grade} score={score} />}
          </div>

          {isHovered && components && (
            <div className="space-y-4 animate-fadeIn">
              <ComponentDetails components={components} />
              {data.trends && (
                <div className="space-y-2">
                  <TrendIndicator trend={data.trends.weekly} />
                  <TrendIndicator trend={data.trends.monthly} />
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            {description && <p className="mb-2">{description}</p>}
            {impact && <p className="mb-2">{impact}</p>}
            {context && <p>{context}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroMetric;