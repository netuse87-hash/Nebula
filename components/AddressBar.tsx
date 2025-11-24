
import React, { useState, useEffect, KeyboardEvent } from 'react';

interface AddressBarProps {
  currentUrl: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onBack: () => void;
  isOffline: boolean;
}

export const AddressBar: React.FC<AddressBarProps> = ({ 
  currentUrl, 
  isLoading, 
  onNavigate, 
  onRefresh, 
  onBack,
  isOffline 
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onNavigate(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-surface border-b border-slate-700 shadow-md z-10">
      <div className="flex gap-1 text-slate-400">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          title="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <button 
          onClick={onRefresh}
          className={`p-2 hover:bg-slate-700 rounded-full transition-colors ${isLoading ? 'animate-spin' : ''}`}
          title="Reload"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        </button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isOffline ? (
             <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          ) : inputValue.startsWith('https') ? (
             <svg className="text-green-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          ) : (
             <svg className="text-slate-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isOffline ? "Offline" : "Search or enter website URL"}
          className={`w-full bg-background border ${isOffline ? 'border-red-900/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-primary focus:ring-primary'} text-slate-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 text-sm transition-all`}
        />
      </div>

      {isOffline && (
        <div className="px-3 py-1.5 rounded-full text-xs font-bold border border-red-500 text-red-500 bg-red-500/10">
           OFFLINE
        </div>
      )}
    </div>
  );
};
