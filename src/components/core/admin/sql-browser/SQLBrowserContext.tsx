'use client';

import { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { editor } from 'monaco-editor';
import type { QueryTab, QueryResult } from '@/components/core/admin/sql-browser/types';

// State interface
interface SQLBrowserState {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  activeTabId: string;
  tabs: QueryTab[];
  showHistory: boolean;
  isLoading: boolean;
  historyKey: number;
}

// Action types
type SQLBrowserAction =
  | { type: 'setActiveTab'; tabId: string }
  | { type: 'addTab'; sql?: string; name?: string }
  | { type: 'updateTab'; tabId: string; updates: Partial<QueryTab> }
  | { type: 'closeTab'; tabId: string }
  | { type: 'setShowHistory'; show: boolean }
  | { type: 'setLoading'; loading: boolean }
  | { type: 'incrementHistoryKey' }
  | { type: 'setEditorRef'; editor: editor.IStandaloneCodeEditor | null }
  | { type: 'setTabResult'; tabId: string; result: QueryResult };

// Initial state
const initialState: SQLBrowserState = {
  editorRef: { current: null },
  activeTabId: '1',
  tabs: [{ id: '1', name: 'Query 1', sql: '' }],
  showHistory: false,
  isLoading: false,
  historyKey: 0,
};

// Reducer function
function sqlBrowserReducer(state: SQLBrowserState, action: SQLBrowserAction): SQLBrowserState {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTabId: action.tabId };

    case 'addTab': {
      const newTab: QueryTab = {
        id: Date.now().toString(),
        name: action.name || `Query ${state.tabs.length + 1}`,
        sql: action.sql || '',
      };
      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
    }

    case 'updateTab':
      return {
        ...state,
        tabs: state.tabs.map((tab) => (tab.id === action.tabId ? { ...tab, ...action.updates } : tab)),
      };

    case 'closeTab': {
      if (state.tabs.length === 1) return state; // Keep at least one tab
      const newTabs = state.tabs.filter((tab) => tab.id !== action.tabId);
      return {
        ...state,
        tabs: newTabs,
        activeTabId: state.activeTabId === action.tabId ? newTabs[0].id : state.activeTabId,
      };
    }

    case 'setShowHistory':
      return { ...state, showHistory: action.show };

    case 'setLoading':
      return { ...state, isLoading: action.loading };

    case 'incrementHistoryKey':
      return { ...state, historyKey: state.historyKey + 1 };

    case 'setEditorRef':
      return { ...state, editorRef: { current: action.editor } };

    case 'setTabResult':
      return {
        ...state,
        tabs: state.tabs.map((tab) => (tab.id === action.tabId ? { ...tab, result: action.result } : tab)),
      };

    default:
      return state;
  }
}

// User-friendly dispatch interface
interface SQLBrowserDispatch {
  addTab: (sql?: string, name?: string) => void;
  updateTab: (tabId: string, updates: Partial<QueryTab>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setShowHistory: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  incrementHistoryKey: () => void;
  setEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void;
  setTabResult: (tabId: string, result: QueryResult) => void;
}

// Context interface
interface SQLBrowserContextType {
  state: SQLBrowserState;
  dispatch: SQLBrowserDispatch;
  getActiveTab: () => QueryTab | undefined;
}

// Create context
const SQLBrowserContext = createContext<SQLBrowserContextType | undefined>(undefined);

// Provider component
interface SQLBrowserProviderProps {
  children: ReactNode;
}

export function SQLBrowserProvider({ children }: SQLBrowserProviderProps) {
  const [state, dispatch] = useReducer(sqlBrowserReducer, initialState);

  // Create user-friendly dispatch interface
  const userDispatch: SQLBrowserDispatch = useMemo(
    () => ({
      addTab: (sql?: string, name?: string) => {
        dispatch({ type: 'addTab', sql, name });
      },
      updateTab: (tabId: string, updates: Partial<QueryTab>) => {
        dispatch({ type: 'updateTab', tabId, updates });
      },
      closeTab: (tabId: string) => {
        dispatch({ type: 'closeTab', tabId });
      },
      setActiveTab: (tabId: string) => {
        dispatch({ type: 'setActiveTab', tabId });
      },
      setShowHistory: (show: boolean) => {
        dispatch({ type: 'setShowHistory', show });
      },
      setLoading: (loading: boolean) => {
        dispatch({ type: 'setLoading', loading });
      },
      incrementHistoryKey: () => {
        dispatch({ type: 'incrementHistoryKey' });
      },
      setEditorRef: (editor: editor.IStandaloneCodeEditor | null) => {
        dispatch({ type: 'setEditorRef', editor });
      },
      setTabResult: (tabId: string, result: QueryResult) => {
        dispatch({ type: 'setTabResult', tabId, result });
      },
    }),
    [],
  );

  const getActiveTab = useMemo(() => {
    return () => state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0];
  }, [state.tabs, state.activeTabId]);

  const contextValue: SQLBrowserContextType = useMemo(
    () => ({
      state,
      dispatch: userDispatch,
      getActiveTab,
    }),
    [state, userDispatch, getActiveTab],
  );

  return <SQLBrowserContext.Provider value={contextValue}>{children}</SQLBrowserContext.Provider>;
}

// Hook to use the context
export function useSQLBrowser() {
  const context = useContext(SQLBrowserContext);
  if (context === undefined) {
    throw new Error('useSQLBrowser must be used within a SQLBrowserProvider');
  }
  return context;
}
