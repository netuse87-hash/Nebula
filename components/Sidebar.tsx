import React, { useState } from 'react';
import { HistoryItem, Bookmark, DownloadItem } from '../types';

interface SidebarProps {
  history: HistoryItem[];
  downloads: DownloadItem[];
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  history, 
  downloads,
  bookmarks, 
  onNavigate, 
  isOpen, 
  toggleSidebar 
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'downloads' | 'notes'>('history');
  const [note, setNote] = useState(localStorage.getItem('nebula_scratchpad') || '');

  const saveNote = (newNote: string) => {
    setNote(newNote);
    localStorage.setItem('nebula_scratchpad', newNote);
  };

  if (!isOpen) {
    return (
       <button 
         onClick={toggleSidebar}
         className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-surface p-1 rounded-r-md border-y border-r border-slate-600 shadow-lg hover:bg-slate-700 z-50 transition-all hover:pl-2 no-print"
       >
          <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
       </button>
    );
  }

  return (
    <div className="w-80 bg-surface border-r border-slate-700 flex flex-col h-full shrink-0 transition-all z-20 shadow-2xl no-print">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="font-bold text-slate-200">Nebula Sidebar</h2>
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          History
        </button>
        <button 
          onClick={() => setActiveTab('downloads')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'downloads' ? 'text-primary border-b-2 border-primary bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Downloads
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-primary border-b-2 border-primary bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'history' && (
          <div className="p-2 space-y-1">
            {history.length === 0 && <p className="text-center text-slate-500 mt-10 text-sm">No history yet</p>}
            {history.slice().reverse().map((item) => (
              <div 
                key={item.id} 
                onClick={() => onNavigate(item.url)}
                className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer group"
              >
                <div className="text-sm text-slate-200 truncate font-medium group-hover:text-primary transition-colors">{item.title}</div>
                <div className="text-xs text-slate-500 truncate">{item.url}</div>
                <div className="text-[10px] text-slate-600 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'downloads' && (
           <div className="p-2 space-y-1">
             {downloads.length === 0 && <p className="text-center text-slate-500 mt-10 text-sm">No downloads yet</p>}
             {downloads.slice().reverse().map((item) => (
               <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                 <div className="flex items-center gap-2 mb-1">
                   <svg className="text-green-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                   <span className="text-sm font-medium text-slate-200 truncate flex-1">{item.filename}</span>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500">
                   <span>{item.size}</span>
                   <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col h-full p-4">
            <p className="text-xs text-slate-400 mb-2">Offline-capable scratchpad. Changes save automatically.</p>
            <textarea
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              className="flex-1 w-full bg-background border border-slate-600 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-primary resize-none"
              placeholder="Write your notes here..."
            />
          </div>
        )}
      </div>
    </div>
  );
};