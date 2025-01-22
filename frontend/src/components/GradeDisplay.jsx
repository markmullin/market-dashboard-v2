import React from 'react';

const gradeColors = {
  'A+': 'bg-green-100 text-green-800 border-green-200',
  'A':  'bg-green-100 text-green-800 border-green-200',
  'A-': 'bg-green-100 text-green-800 border-green-200',
  'B+': 'bg-blue-100 text-blue-800 border-blue-200',
  'B':  'bg-blue-100 text-blue-800 border-blue-200',
  'B-': 'bg-blue-100 text-blue-800 border-blue-200',
  'C+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'C':  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'C-': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'D+': 'bg-orange-100 text-orange-800 border-orange-200',
  'D':  'bg-orange-100 text-orange-800 border-orange-200',
  'D-': 'bg-orange-100 text-orange-800 border-orange-200',
  'F':  'bg-red-100 text-red-800 border-red-200'
};

export default function GradeDisplay({ grade, score, showScore = false }) {
  const colorClasses = gradeColors[grade] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-lg font-bold border ${colorClasses}`}>
        {grade}
      </div>
      {showScore && (
        <span className="text-sm text-gray-500">
          ({score.toFixed(1)})
        </span>
      )}
    </div>
  );
}