
import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.06)', borderTopColor: 'var(--accent)' }}></div>
      <p className="text-lg font-semibold text-gray-300">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
