
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AddressBar } from './components/AddressBar';
import { Tabs } from './components/Tabs';
import { BrowserView } from './components/BrowserView';
import { Sidebar } from './components/Sidebar';
import { Tab, TabType, HistoryItem, Bookmark, DownloadItem, Shortcut } from './types';

const DEFAULT_TAB: Tab = {
  id: 'default',
  url: '',
  title: 'New Tab',
  type: TabType.EMPTY,
  isLoading: false,
  timestamp: Date.now()
};

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: '1', name: 'Google', url: 'google.com' },
  { id: '2', name: 'Amazon', url: 'amazon.com' },
  { id: '3', name: 'Bing', url: 'bing.com' },
  { id: '4', name: 'Wikipedia', url: 'wikipedia.org' },
];

function App() {
  // Initialize State
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('nebula_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedDownloads = localStorage.getItem('nebula_downloads');
    if (savedDownloads) {
      try {
        setDownloads(JSON.parse(savedDownloads));
      } catch (e) {
        console.error("Failed to parse downloads", e);
      }
    }

    const savedShortcuts = localStorage.getItem('nebula_shortcuts');
    if (savedShortcuts) {
      try {
        setShortcuts(JSON.parse(savedShortcuts));
      } catch (e) {
        setShortcuts(DEFAULT_SHORTCUTS);
      }
    } else {
      setShortcuts(DEFAULT_SHORTCUTS);
    }

    const savedTabs = localStorage.getItem('nebula_tabs');
    const savedActiveId = localStorage.getItem('nebula_active_tab');

    if (savedTabs && savedActiveId) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        if (parsedTabs.length > 0) {
          setTabs(parsedTabs);
          setActiveTabId(savedActiveId);
        } else {
          resetTabs();
        }
      } catch (e) {
        console.error("Failed to parse tabs", e);
        resetTabs();
      }
    } else {
      resetTabs();
    }
    
    setIsInitialized(true);

    // Offline detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetTabs = () => {
    const newTab = { ...DEFAULT_TAB, id: uuidv4() };
    setTabs([newTab]);
    setActiveTabId(newTab.id);
  };

  // Save Persistence
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('nebula_history', JSON.stringify(history));
    localStorage.setItem('nebula_downloads', JSON.stringify(downloads));
    localStorage.setItem('nebula_shortcuts', JSON.stringify(shortcuts));
    localStorage.setItem('nebula_tabs', JSON.stringify(tabs));
    localStorage.setItem('nebula_active_tab', activeTabId);
  }, [history, downloads, shortcuts, tabs, activeTabId, isInitialized]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || DEFAULT_TAB;

  const addToHistory = (url: string, title: string) => {
    // Prevent duplicate adjacent entries
    setHistory(prev => {
      if (prev.length > 0 && prev[prev.length - 1].url === url) return prev;
      return [...prev, {
        id: uuidv4(),
        url,
        title,
        timestamp: Date.now()
      }];
    });
  };

  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, ...updates } : t
    ));
  };

  const handleNavigate = (input: string) => {
    let url = input.trim();
    let title = url;

    // Offline Check
    if (isOffline) {
      alert("You are offline. Please check your connection.");
      return;
    }

    // Basic URL detection
    // If it doesn't have a dot or spaces, treat as search
    const hasSpace = url.includes(' ');
    const hasDot = url.includes('.');
    const isProtocol = url.startsWith('http://') || url.startsWith('https://');

    if (!isProtocol) {
      if (hasDot && !hasSpace) {
        url = 'https://' + url;
        title = new URL(url).hostname;
      } else {
        // Treat as search query
        title = `Search: ${url}`;
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`; // igu=1 helps with some iframe permissions for google
      }
    } else {
       try {
         title = new URL(url).hostname;
       } catch(e) {
         title = url;
       }
    }

    updateActiveTab({ 
      url: url, 
      title: title, 
      type: TabType.WEB,
      isLoading: true 
    });

    addToHistory(url, title);
    
    // Simulate loading state for iframe
    setTimeout(() => {
      updateActiveTab({ isLoading: false });
    }, 1500);
  };

  const handleNewTab = () => {
    const newTab = { ...DEFAULT_TAB, id: uuidv4(), timestamp: Date.now() };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const newId = uuidv4();
      setTabs([{ ...DEFAULT_TAB, id: newId }]);
      setActiveTabId(newId);
      return;
    }
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleRefresh = () => {
    if (activeTab.type === TabType.EMPTY) return;
    // To refresh iframe, we can just force a re-render or set URL to same
    const currentUrl = activeTab.url;
    updateActiveTab({ url: '' }); // Clear briefly
    setTimeout(() => {
      updateActiveTab({ url: currentUrl });
    }, 50);
  };

  // Homepage Customization
  const handleAddShortcut = (name: string, url: string) => {
    setShortcuts(prev => [...prev, { id: uuidv4(), name, url }]);
  };

  const handleRemoveShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  };

  // Print only (Download is restricted for cross-origin iframes)
  const handlePrint = () => {
    window.print();
  };

  if (!isInitialized) return null; 

  return (
    <div className="flex h-screen w-screen bg-background text-slate-200">
      <Sidebar 
        history={history}
        bookmarks={bookmarks}
        downloads={downloads}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all">
        {/* Header Section - Hidden on Print */}
        <div className="flex flex-col bg-background z-20 no-print">
          <Tabs 
            tabs={tabs} 
            activeTabId={activeTabId} 
            onTabClick={setActiveTabId} 
            onTabClose={handleCloseTab}
            onNewTab={handleNewTab}
          />
          <AddressBar 
            currentUrl={activeTab.url}
            isLoading={activeTab.isLoading}
            onNavigate={handleNavigate}
            onRefresh={handleRefresh}
            onBack={() => {}} 
            isOffline={isOffline}
          />
        </div>

        <div className="flex-1 relative overflow-hidden bg-white">
          <BrowserView 
            tab={activeTab} 
            shortcuts={shortcuts}
            isOffline={isOffline} 
            onNavigate={handleNavigate}
            onAddShortcut={handleAddShortcut}
            onRemoveShortcut={handleRemoveShortcut}
            onPrint={handlePrint}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
