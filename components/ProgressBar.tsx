
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progressPercentage = (current / total) * 100;

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
      <div
        className="h-2.5 rounded-full transition-all duration-500 ease-out time-fill"
        style={{ width: `${progressPercentage}%`, backgroundColor: 'var(--accent)' }}
      ></div>
    </div>
  );
};

export default ProgressBar;
