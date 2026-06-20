'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useHasRole } from '@/hooks/use-has-role';
import QueryResults from '@/components/core/admin/sql-browser/QueryResults';
import SchemaExplorer from '@/components/core/admin/sql-browser/SchemaExplorer';
import { LazySQLEditor } from '@/components/core/admin/sql-browser/SQLEditorLazy';
import SQLTabBar from '@/components/core/admin/sql-browser/SQLTabBar';
import { SQLBrowserProvider, useSQLBrowser } from '@/components/core/admin/sql-browser/SQLBrowserContext';
import EmptyState from '@/app/(secure)/admin/monitoring/api-playground/components/empty-state';
import { isErrorResponse } from '@/lib/core/common/error';
import PageLayout from '@/components/core/page/PageLayout';
import { Database, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SQLBrowserContent() {
  const { state, dispatch, getActiveTab } = useSQLBrowser();

  const { activeTabId, isLoading } = state;

  const activeTab = getActiveTab();

  const handleTableDoubleClick = (schemaName: string, tableName: string) => {
    const query = `SELECT * FROM ${schemaName}.${tableName} LIMIT 100`;
    const tabName = `${schemaName}.${tableName}`;
    dispatch.addTab(query, tabName);
  };

  const runQuery = async (sql: string) => {
    if (!sql.trim()) return;

    dispatch.setLoading(true);
    try {
      const response = await fetch('/api/sql/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });

      const result = await response.json();

      if (isErrorResponse(result)) {
        dispatch.setTabResult(activeTabId, {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: 0,
          error: result.message,
        });
      } else {
        dispatch.setTabResult(activeTabId, result);

        // Save query to history after successful execution
        try {
          await fetch('/api/sql/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: sql,
              name: activeTab?.name || `Query ${activeTabId}`,
            }),
          });
        } catch (historyError) {
          console.error('Failed to save query to history:', historyError);
        }
      }
    } catch (error) {
      dispatch.setTabResult(activeTabId, {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      dispatch.setLoading(false);
    }
  };

  const formatSQL = async () => {
    const editor = state.editorRef.current;
    if (!editor) return;
    const value = editor.getValue();

    try {
      const { format } = await import('sql-formatter');
      const formatted = format(value, {
        language: 'postgresql',
        keywordCase: 'upper',
      });

      editor.setValue(formatted);
    } catch (error) {
      console.error('SQL formatting error:', error);
      const formatted = value
        .replace(/\s+/g, ' ')
        .replace(/\s*([,()])\s*/g, '$1 ')
        .replace(
          /\s*(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN)\s+/gi,
          '\n$1 ',
        )
        .trim();

      editor.setValue(formatted);
    }
  };

  const runSelectedQuery = () => {
    const editor = state.editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const selectedText = editor.getModel()?.getValueInRange(selection);
      if (selectedText) {
        runQuery(selectedText);
      }
    } else {
      runQuery(activeTab?.sql || '');
    }
  };

  return (
    <PageLayout
      title="SQL Browser"
      subTitle={activeTab?.name || 'Write and execute SQL queries'}
      icon={
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 blur-xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
        </div>
      }
      toolbar={
        <Button
          onClick={runSelectedQuery}
          disabled={isLoading}
          className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-teal-600 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            Run Query
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Button>
      }
      mainSection={
        <ResizablePanelGroup direction="horizontal" className="h-full w-full flex-1 overflow-hidden">
          <ResizablePanel defaultSize="20%" minSize="0%" maxSize="50%">
            <SchemaExplorer onTableDoubleClick={handleTableDoubleClick} onAddTab={dispatch.addTab} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize="80%" minSize="50%">
            <div className="flex h-full flex-col overflow-hidden">
              <SQLTabBar onFormatSQL={formatSQL} />

              <ResizablePanelGroup direction="vertical" className="flex-1">
                <ResizablePanel defaultSize="40%" minSize="20%">
                  <div className="h-full overflow-hidden">
                    <LazySQLEditor
                      value={activeTab?.sql || ''}
                      onChange={(sql) => dispatch.updateTab(activeTabId, { sql })}
                      handleEditorDidMount={(editor, monaco) => {
                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                          void runQuery(activeTab?.sql || '');
                        });

                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
                          void formatSQL();
                        });
                        dispatch.setEditorRef(editor);
                      }}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize="60%" minSize="20%">
                  <div className="h-full overflow-hidden">
                    {activeTab?.result ? <QueryResults result={activeTab.result} /> : <EmptyState actionLabel="Run" />}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    />
  );
}

export default function SQLBrowser() {
  const isAdmin = useHasRole('admin');

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl text-red-600">Access Denied</h2>
          <p className="text-gray-600">Access restricted to admins.</p>
        </div>
      </div>
    );
  }

  return (
    <SQLBrowserProvider>
      <SQLBrowserContent />
    </SQLBrowserProvider>
  );
}
