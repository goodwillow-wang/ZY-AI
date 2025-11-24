import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

// Declare KaTeX function on window
declare global {
    interface Window {
        renderMathInElement: (element: HTMLElement, options: any) => void;
    }
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Render Math formula if KaTeX is loaded and it's a bot message
    if (!isUser && contentRef.current && window.renderMathInElement) {
        window.renderMathInElement(contentRef.current, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });
    }
  }, [message.content, isUser]);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in mb-6`}>
      <div
        className={`relative max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
        }`}
      >
        {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
            <div 
                ref={contentRef}
                className="prose prose-sm md:prose-base prose-slate max-w-none overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: message.content }} 
            />
        )}
        
        <div className={`text-[10px] mt-2 opacity-70 ${isUser ? 'text-blue-100 text-right' : 'text-gray-400 text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
