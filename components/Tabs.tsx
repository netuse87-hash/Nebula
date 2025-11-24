import React from 'react';
import { Tab, TabType } from '../types';

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTabId, 
  onTabClick, 
  onTabClose, 
  onNewTab 
}) => {
  return (
    <div className="flex items-end bg-background pt-2 px-2 gap-1 overflow-x-auto select-none no-scrollbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`
            group flex items-center gap-2 px-3 py-2 min-w-[160px] max-w-[240px] rounded-t-lg cursor-pointer transition-all border-b-0
            ${tab.id === activeTabId 
              ? 'bg-surface text-white border-t border-x border-slate-600' 
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-t border-x border-transparent hover:border-slate-700'}
          `}
        >
          {/* Icon based on Type */}
          {tab.type === TabType.SEARCH ? (
            <svg className="text-purple-400 shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7-.7.7m0 11.4.7.7m-12.1-.7-.7.7"/></svg>
          ) : tab.type === TabType.WEB ? (
             <img 
               src={`https://www.google.com/s2/favicons?domain=${tab.url}&sz=32`} 
               alt="favicon" 
               className="w-3.5 h-3.5 shrink-0 rounded-sm opacity-80"
               onError={(e) => {
                 // Fallback if favicon fails
                 (e.target as HTMLImageElement).style.display = 'none';
               }}
             />
          ) : (
            <svg className="text-slate-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><path d="m9 16 3-3 3 3"/></svg>
          )}

          <span className="text-xs truncate flex-1">{tab.title || 'New Tab'}</span>
          
          <button
            onClick={(e) => onTabClose(tab.id, e)}
            className="p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      ))}
      <button 
        onClick={onNewTab}
        className="p-2 mb-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
      </button>
    </div>
  );
};