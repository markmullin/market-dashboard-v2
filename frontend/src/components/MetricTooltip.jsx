import React from 'react';

export default function MetricTooltip({ metric, isVisible }) {
  if (!isVisible) return null;

  const renderComponent = (name, value) => (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{name}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-100 rounded overflow-hidden">
          <div 
            className="h-full bg-blue-500"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm font-medium">{value.toFixed(1)}%</span>
      </div>
    </div>
  );

  return (
    <div className="absolute z-50 w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-100 top-full mt-2 left-0">
      <div className="space-y-4">
        {/* Grade Explanation */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Grade Components</h4>
          <div className="space-y-2">
            {renderComponent("Historical Strength", metric.components.relativeStrength)}
            {renderComponent("Trend Strength", metric.components.trendStrength)}
            {renderComponent("News Sentiment", metric.components.sentiment)}
          </div>
        </div>

        {/* Interpretation */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Interpretation</h4>
          <p className="text-sm text-gray-600">{metric.interpretation}</p>
        </div>

        {/* Impact Factors */}
        {metric.impactFactors && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Key Impact Factors</h4>
            <ul className="text-sm text-gray-600 list-disc pl-4">
              {metric.impactFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Grade Scale */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Grade Scale</h4>
          <p className="text-sm text-gray-600">
            A+: Outstanding (95-100)<br />
            A/A-: Strong (85-94)<br />
            B+/B/B-: Above Average (70-84)<br />
            C+/C/C-: Average (55-69)<br />
            D+/D/D-: Below Average (40-54)<br />
            F: Weak (0-39)
          </p>
        </div>
      </div>
    </div>
  );
}