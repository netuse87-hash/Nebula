
import React, { useState, useEffect } from 'react';
import { Tab, TabType, Shortcut } from '../types';
import { fetchProxyContent } from '../services/proxy';

interface BrowserViewProps {
  tab: Tab;
  shortcuts: Shortcut[];
  isOffline: boolean;
  onNavigate: (url: string) => void;
  onAddShortcut: (name: string, url: string) => void;
  onRemoveShortcut: (id: string) => void;
  onPrint: () => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({ 
  tab, 
  shortcuts,
  isOffline, 
  onNavigate,
  onAddShortcut,
  onRemoveShortcut,
  onPrint
}) => {
  const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');
  const [homeSearch, setHomeSearch] = useState('');
  
  // Proxy / Compatibility Mode State
  const [useProxy, setUseProxy] = useState(false);
  const [proxyContent, setProxyContent] = useState<string>('');
  const [isLoadingProxy, setIsLoadingProxy] = useState(false);

  // List of domains known to block iframes via X-Frame-Options
  const BLOCKED_DOMAINS = ['google.com', 'amazon', 'facebook', 'twitter', 'x.com', 'linkedin', 'bing', 'yahoo', 'reddit', 'wikipedia', 'youtube'];

  // Check if current URL likely needs proxying
  useEffect(() => {
    if (tab.type === TabType.WEB && tab.url) {
      const shouldProxy = BLOCKED_DOMAINS.some(domain => tab.url.toLowerCase().includes(domain));
      // Special case: Google Search with igu=1 usually works without proxy, but main google.com needs it
      const isGoogleSearch = tab.url.includes('google.com/search') && tab.url.includes('igu=1');
      
      if (shouldProxy && !isGoogleSearch) {
        setUseProxy(true);
      } else {
        setUseProxy(false);
      }
    }
  }, [tab.url, tab.type]);

  // Fetch content when Proxy Mode is active
  useEffect(() => {
    let isMounted = true;
    if (useProxy && tab.url && !isOffline) {
      setIsLoadingProxy(true);
      setProxyContent(''); // Clear previous content
      
      fetchProxyContent(tab.url).then(content => {
        if (isMounted) {
          setProxyContent(content);
          setIsLoadingProxy(false);
        }
      });
    } else {
      setProxyContent('');
    }
    return () => { isMounted = false; };
  }, [useProxy, tab.url, isOffline]);

  // Handle Navigation messages from the Proxy Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure the message structure matches our contract
      if (event.data && event.data.type === 'NEBULA_NAVIGATE' && event.data.url) {
        onNavigate(event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onNavigate]);

  // Handler for Manual Download
  const handleDownload = () => {
    const contentToSave = useProxy ? proxyContent : `<html><body><p>Cannot download raw iframe content due to browser security. Please switch to Proxy Mode to download.</p></body></html>`;
    const blob = new Blob([contentToSave], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab.title || 'webpage'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Shortcut Handlers
  const handleAddShortcutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortcutName && newShortcutUrl) {
      onAddShortcut(newShortcutName, newShortcutUrl);
      setNewShortcutName('');
      setNewShortcutUrl('');
    }
  };

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      onNavigate(homeSearch);
    }
  };

  // --- RENDER: HOMEPAGE ---
  if (tab.type === TabType.EMPTY) {
    return (
      <div className="flex flex-col h-full bg-surface items-center justify-center text-center p-6 animate-in zoom-in-95 duration-300 overflow-y-auto">
        <div className="mb-10 p-8 bg-background/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-3xl">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 mb-4 tracking-tight">Nebula</h1>
          <p className="text-slate-400 text-lg font-light tracking-wide mb-8">Fast. Secure. Unrestricted.</p>
          
          <form onSubmit={handleHomeSearch} className="relative max-w-xl mx-auto flex gap-2">
             <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <svg className="text-slate-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input 
                  type="text" 
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  placeholder="Search or enter website name..." 
                  className="w-full bg-slate-800/50 border border-slate-600 text-slate-100 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                />
             </div>
             <button 
               type="submit"
               className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20"
             >
               Go
             </button>
          </form>
        </div>
        
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Favorites</h2>
            <button 
              onClick={() => setIsEditingShortcuts(!isEditingShortcuts)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${isEditingShortcuts ? 'bg-red-500/10 text-red-400 border-red-500/50' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
            >
              {isEditingShortcuts ? 'Done Editing' : 'Customize'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {shortcuts.map((site) => (
               <div 
                 key={site.id}
                 onClick={() => !isEditingShortcuts && onNavigate(site.url)}
                 className={`relative p-6 bg-slate-800/50 rounded-xl border border-slate-700 group overflow-hidden ${isEditingShortcuts ? '' : 'hover:bg-slate-700 hover:border-blue-500 cursor-pointer'} transition-all`}
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="font-bold text-xl mb-2 text-slate-200 group-hover:text-white relative z-10 truncate">{site.name}</div>
                  <div className="text-xs text-slate-500 relative z-10 truncate">{new URL('https://' + site.url.replace('https://','')).hostname}</div>
                  
                  {isEditingShortcuts && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveShortcut(site.id);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full transition-colors z-20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
               </div>
             ))}

             {isEditingShortcuts && (
               <div className="p-4 bg-slate-800/20 rounded-xl border border-dashed border-slate-600 flex flex-col justify-center gap-2">
                 <input 
                   type="text" 
                   placeholder="Name"
                   value={newShortcutName}
                   onChange={e => setNewShortcutName(e.target.value)}
                   className="bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
                 />
                 <input 
                   type="text" 
                   placeholder="URL"
                   value={newShortcutUrl}
                   onChange={e => setNewShortcutUrl(e.target.value)}
                   className="bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
                 />
                 <button 
                   onClick={handleAddShortcutSubmit}
                   disabled={!newShortcutName || !newShortcutUrl}
                   className="mt-1 bg-primary/20 hover:bg-primary text-primary hover:text-white text-xs py-1 rounded transition-colors disabled:opacity-50"
                 >
                   Add
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: WEB VIEW ---
  if (tab.type === TabType.WEB) {
    if (isOffline) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-surface">
          <svg className="w-20 h-20 mb-6 text-slate-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1h22v22H1z"/><path d="M1 1l22 22"/><path d="M23 1 1 23"/></svg>
          <h2 className="text-2xl font-bold mb-2">Offline Mode</h2>
          <p className="max-w-md text-slate-500 mb-6">Websites cannot be loaded while you are offline.</p>
        </div>
       );
    }

    return (
      <div className="w-full h-full bg-white relative flex flex-col group">
        {/* Toolbar Overlay */}
        <div className="absolute top-2 right-4 z-10 flex gap-2 no-print transition-opacity opacity-0 group-hover:opacity-100">
            {/* Toggle Proxy Button */}
            <button
              onClick={() => setUseProxy(!useProxy)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all border ${useProxy ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/90 text-slate-600 border-slate-300 hover:bg-slate-100'}`}
              title={useProxy ? "Disable Compatibility Mode" : "Enable Compatibility Mode (Fix blocked sites)"}
            >
              {useProxy ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Enhanced Mode ON</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
                  <span>Standard Mode</span>
                </>
              )}
            </button>

            {/* Download Button */}
            {useProxy && (
              <button 
                onClick={handleDownload}
                className="bg-white/90 hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm p-2 rounded-full transition-all"
                title="Download Webpage HTML"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </button>
            )}

            {/* Print Button */}
            <button 
              onClick={onPrint}
              className="bg-white/90 hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm p-2 rounded-full transition-all"
              title="Print Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            </button>
        </div>

        {/* Content Area */}
        {useProxy ? (
          isLoadingProxy ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 text-sm font-medium">Establishing secure connection via Nebula Proxy...</p>
              <p className="text-slate-400 text-xs mt-2">Connecting to {new URL(tab.url).hostname}</p>
            </div>
          ) : (
            <iframe
              srcDoc={proxyContent}
              className="w-full flex-1 border-none bg-white"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              allowFullScreen
              title={tab.title}
            />
          )
        ) : (
          <iframe
            src={tab.url}
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
            allowFullScreen
            title={tab.title}
          />
        )}
      </div>
    );
  }

  return null;
};
