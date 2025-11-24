import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from './types';
import { apiService } from './services/apiService';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageBubble } from './components/MessageBubble';
import { LoadingIndicator } from './components/LoadingIndicator';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('正在处理...');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingStatus]);

  // Auth Logic
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check Session Storage
      const storedUser = sessionStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthChecking(false);
          return;
        } catch (e) {
          sessionStorage.removeItem('user');
        }
      }

      // 2. Check URL Code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        const authenticatedUser = await apiService.authenticate(code);
        if (authenticatedUser) {
          setUser(authenticatedUser);
          sessionStorage.setItem('user', JSON.stringify(authenticatedUser));
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        // 3. Redirect if strictly required (uncomment for prod)
        // apiService.redirectToWeChatAuth();
        console.log("No code found, running in guest/dev mode or waiting for user action.");
      }
      setIsAuthChecking(false);
    };

    initAuth();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setLoadingStatus('正在理解您的问题...');
    
    // Reset textarea height
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
    }

    try {
      const responseHtml = await apiService.submitQuery(
        content, 
        user, 
        (status) => setLoadingStatus(status)
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: responseHtml,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `<div class="text-red-500 font-medium">抱歉，遇到了一些问题：${error.message || '未知错误'}</div><p>请稍后再试。</p>`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingIndicator statusText="正在验证身份..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5f7fa] font-sans">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              Z
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">正圆百事通</h1>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {user ? `${user.name}` : '访客模式'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative no-scrollbar">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen 
              userName={user?.name} 
              onSuggestionClick={(text) => handleSendMessage(text)} 
            />
          ) : (
            <div className="flex flex-col pb-24">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                <div className="self-start bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm mb-6">
                    <LoadingIndicator statusText={loadingStatus} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="flex-none bg-white border-t border-gray-200 p-4 pb-6 z-20">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={adjustTextareaHeight}
              onKeyDown={handleKeyDown}
              placeholder="请输入您的问题，例如：查看一号仓粮情..."
              className="w-full bg-transparent border-none outline-none resize-none py-2 text-gray-700 max-h-[120px] placeholder-gray-400"
              rows={1}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className={`mb-1 p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                !inputValue.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white shadow-md hover:bg-blue-600 active:scale-95'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
               AI生成内容可能包含错误，请以官方文件和数据为准
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
