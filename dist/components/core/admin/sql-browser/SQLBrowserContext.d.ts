import type { ReactNode } from 'react';
import type { editor } from 'monaco-editor';
import type { QueryTab, QueryResult } from '../../../../components/core/admin/sql-browser/types';
interface SQLBrowserState {
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    activeTabId: string;
    tabs: QueryTab[];
    showHistory: boolean;
    isLoading: boolean;
    historyKey: number;
}
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
interface SQLBrowserContextType {
    state: SQLBrowserState;
    dispatch: SQLBrowserDispatch;
    getActiveTab: () => QueryTab | undefined;
}
interface SQLBrowserProviderProps {
    children: ReactNode;
}
export declare function SQLBrowserProvider({ children }: SQLBrowserProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useSQLBrowser(): SQLBrowserContextType;
export {};
//# sourceMappingURL=SQLBrowserContext.d.ts.map