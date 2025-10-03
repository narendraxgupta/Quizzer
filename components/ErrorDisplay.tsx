
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="bg-red-900/50 border border-red-700 p-8 rounded-2xl shadow-2xl max-w-md">
        <i className="fas fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
        <h2 className="text-3xl font-bold text-red-300 mb-2">An Error Occurred</h2>
        <p className="text-red-200 mb-6">{message}</p>
            <button onClick={onRetry} className="px-6 py-2 text-white font-semibold rounded-lg transition-colors" style={{ backgroundColor: 'var(--accent)' }}>
              <i className="fas fa-sync-alt mr-2"></i>
              Try Again
            </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
