import React from 'react';

// Expects: analysis = { estimated_total_time, goal_clarity, ... }
export default function ProgressChart({ analysis }) {
  if (!analysis) return null;

  // Dummy calculation (replace with your own logic)
  const completionPercent = Math.min((analysis.goal_clarity / 10) * 100, 100);

  return (
    <div className="glass-card p-4 mb-4">
      <h4 className="text-white text-md mb-2">Project Progress</h4>
      <div className="w-full bg-gray-800 rounded h-5">
        <div
          style={{
            width: `${completionPercent}%`,
            background: 'linear-gradient(90deg,#3b82f6,#6366f1)',
            height: '100%',
            borderRadius: 'inherit'
          }}
        />
      </div>
      <p className="text-blue-200 mt-2">{completionPercent}% clarity (goal)</p>
    </div>
  );
}
