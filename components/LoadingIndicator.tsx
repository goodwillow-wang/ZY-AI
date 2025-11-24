import React from 'react';

interface LoadingIndicatorProps {
  statusText: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ statusText }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-sm text-gray-500 font-medium animate-pulse">{statusText}</p>
    </div>
  );
};
