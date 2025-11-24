
export enum TabType {
  WEB = 'WEB',
  EMPTY = 'EMPTY',
  SETTINGS = 'SETTINGS',
  SEARCH = 'SEARCH'
}

export interface Tab {
  id: string;
  url: string;
  title: string;
  type: TabType;
  isLoading: boolean;
  favicon?: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
}

export interface Shortcut {
  id: string;
  name: string;
  url: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  timestamp: number;
  size: string;
}

export interface SearchResult {
  text: string;
  sources: {
    uri: string;
    title: string;
  }[];
}
