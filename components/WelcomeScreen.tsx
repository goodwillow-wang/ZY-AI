import React, { useState, useEffect } from 'react';
import { WELCOME_SUGGESTIONS } from '../constants';

interface WelcomeScreenProps {
  userName?: string;
  onSuggestionClick: (text: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onSuggestionClick }) => {
  const [displayText, setDisplayText] = useState('');
  const fullText = userName ? `欢迎回来，${userName}` : '欢迎使用正圆百事通';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-6 pt-10 pb-32">
      <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 text-center">
          {displayText}
          <span className="animate-pulse text-blue-600">|</span>
        </h1>
      </div>

      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
            <p className="text-gray-500 text-sm md:text-base">我可以帮您查询：</p>
            <div className="flex justify-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>规章制度</span>
                <span>•</span>
                <span>粮库作业</span>
                <span>•</span>
                <span>学校供餐</span>
            </div>
        </div>

        <div className="grid gap-3 w-full">
          {WELCOME_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="group flex items-center justify-between w-full p-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-gray-700 group-hover:text-blue-700 text-left text-sm md:text-base">
                {suggestion}
              </span>
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
