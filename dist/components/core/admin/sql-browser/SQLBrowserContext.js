'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useMemo } from 'react';
// Initial state
const initialState = {
    editorRef: { current: null },
    activeTabId: '1',
    tabs: [{ id: '1', name: 'Query 1', sql: '' }],
    showHistory: false,
    isLoading: false,
    historyKey: 0,
};
// Reducer function
function sqlBrowserReducer(state, action) {
    switch (action.type) {
        case 'setActiveTab':
            return { ...state, activeTabId: action.tabId };
        case 'addTab': {
            const newTab = {
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
            if (state.tabs.length === 1)
                return state; // Keep at least one tab
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
// Create context
const SQLBrowserContext = createContext(undefined);
export function SQLBrowserProvider({ children }) {
    const [state, dispatch] = useReducer(sqlBrowserReducer, initialState);
    // Create user-friendly dispatch interface
    const userDispatch = useMemo(() => ({
        addTab: (sql, name) => {
            dispatch({ type: 'addTab', sql, name });
        },
        updateTab: (tabId, updates) => {
            dispatch({ type: 'updateTab', tabId, updates });
        },
        closeTab: (tabId) => {
            dispatch({ type: 'closeTab', tabId });
        },
        setActiveTab: (tabId) => {
            dispatch({ type: 'setActiveTab', tabId });
        },
        setShowHistory: (show) => {
            dispatch({ type: 'setShowHistory', show });
        },
        setLoading: (loading) => {
            dispatch({ type: 'setLoading', loading });
        },
        incrementHistoryKey: () => {
            dispatch({ type: 'incrementHistoryKey' });
        },
        setEditorRef: (editor) => {
            dispatch({ type: 'setEditorRef', editor });
        },
        setTabResult: (tabId, result) => {
            dispatch({ type: 'setTabResult', tabId, result });
        },
    }), []);
    const getActiveTab = useMemo(() => {
        return () => state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0];
    }, [state.tabs, state.activeTabId]);
    const contextValue = useMemo(() => ({
        state,
        dispatch: userDispatch,
        getActiveTab,
    }), [state, userDispatch, getActiveTab]);
    return _jsx(SQLBrowserContext.Provider, { value: contextValue, children: children });
}
// Hook to use the context
export function useSQLBrowser() {
    const context = useContext(SQLBrowserContext);
    if (context === undefined) {
        throw new Error('useSQLBrowser must be used within a SQLBrowserProvider');
    }
    return context;
}
//# sourceMappingURL=SQLBrowserContext.js.map