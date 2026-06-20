'use client';

import { useState } from 'react';
import { useClientSession } from '@/components/core/session-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Database, KeyIcon, Loader2, PencilOff, Play, Send, Sparkles, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataSourcePanel } from './components/datasource-panel';
import PageLayout from '@/components/core/page/PageLayout';
import { cn } from '@/lib/utils';
import { getErrorMessage, isErrorResponse } from '@/lib/core/common/error';
import { useApiTester } from './context';
import { ResultTabs } from './components/result-tabs';
import { DataSourceTab, getWhoAttributesCount, isMissingPrimaryKey, type Show } from './components/datasource-tab';
import { PostTab } from './components/post-tab';
import { QueryTab } from './components/query-tab';
import { SecurityPanel } from './components/security-panel';
import { SelectInput } from '@/components/core/page/fields';

export function ApiTesterContent() {
  const { userName, roles } = useClientSession();
  const [dsFilter, setDsFilter] = useState<Show | undefined>();
  const {
    state: {
      dataSources,
      selectedDS,
      queryMode,
      resultMode,
      role,
      queryData,
      postData,
      response,
      loading,
      error,
      headers,
    },
    dispatch,
    executeQuery,
  } = useApiTester();

  const whoAttributesCount = selectedDS ? getWhoAttributesCount(selectedDS) : 4;
  const missingPrimaryKey = selectedDS ? isMissingPrimaryKey(selectedDS) : false;

  const executePost = async () => {
    if (!selectedDS || !postData?.trim()) {
      dispatch.setError('Please select a data source and provide post data');
      return;
    }

    dispatch.setLoading(true);

    try {
      let rows: any[] = [];
      try {
        rows = JSON.parse(postData);
        if (!Array.isArray(rows)) {
          dispatch.setError('Post data must be an array');
          return;
        }
      } catch (err) {
        dispatch.setError(`Invalid JSON format for post data: ${getErrorMessage(err)}`);
        return;
      }

      const payload = {
        ds: selectedDS.id,
        rows,
        debug: true,
      };

      const response = await fetch('/api/ds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      dispatch.setHeaders(response.headers);

      const result = await response.json();
      if (isErrorResponse(result)) {
        dispatch.setError(result.message);
      } else {
        dispatch.setError(null);
      }
      dispatch.setResponse(result);
    } catch (err) {
      dispatch.setError(err instanceof Error ? err.message : 'Failed to execute post');
      dispatch.setResponse(null);
    } finally {
      dispatch.setLoading(false);
    }
  };

  return (
    <PageLayout
      title="API Playground"
      subTitle={selectedDS?.id ? `Testing ${selectedDS.id}` : 'Select a data source to begin'}
      icon={
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
        </div>
      }
      toolbar={
        <div className="flex items-center gap-3">
          {queryMode === 'Query' && (
            <Button
              onClick={executeQuery}
              disabled={loading || !selectedDS}
              className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/30 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                Execute Query
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          )}
          {queryMode === 'Post' && (
            <Button
              onClick={executePost}
              disabled={loading || !selectedDS}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white shadow-emerald-500/25 shadow-lg transition-all duration-300 hover:shadow-emerald-500/30 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
                Submit Post
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          )}
        </div>
      }
      mainSection={
        <div className="flex h-full w-full flex-col gap-5 overflow-hidden p-5">
          <div className="grid flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-3">
            {/* Left Panel - Configuration */}
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex flex-col gap-5 overflow-auto pr-1">
              <DataSourcePanel
                selectedDataSource={selectedDS?.id ?? ''}
                setSelectedDataSource={(value) => {
                  const ds = dataSources.find((ds) => ds.id === value);
                  dispatch.setSelectedDS(ds);
                }}
                dataSources={dataSources}
              />
              {selectedDS && (
                <SecurityPanel
                  selectedDS={selectedDS}
                  roleCode={role}
                  setRole={dispatch.setRole}
                  userName={userName}
                  roles={roles}
                />
              )}
            </div>

            {/* Right Panel - Testing Interface */}
            <div className="flex flex-col gap-4 overflow-hidden lg:col-span-2">
              <Tabs
                className={cn(
                  'flex min-h-[200px] flex-1 flex-col gap-0 overflow-hidden rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm',
                  queryMode !== 'DS' && 'max-h-[300px]',
                )}
                value={queryMode}
                onValueChange={(value) => dispatch.setQueryMode(value as 'Query' | 'Post' | 'DS')}
              >
                <div className="flex shrink-0 items-center justify-between border-border/50 border-b px-3 py-1.5">
                  <TabsList className="h-9 gap-1 rounded-lg bg-muted/60 p-1">
                    <TabsTrigger
                      value="Query"
                      className="rounded-md px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Query
                    </TabsTrigger>
                    <TabsTrigger
                      value="Post"
                      className="rounded-md px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Post
                    </TabsTrigger>
                    <TabsTrigger
                      value="DS"
                      className="rounded-md px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Definition
                    </TabsTrigger>
                  </TabsList>

                  {/* DS Filter Controls */}
                  {queryMode === 'DS' && selectedDS && (
                    <div className="flex items-center gap-2">
                      <SelectInput
                        value={dsFilter}
                        onSelect={(value) => setDsFilter(value as Show)}
                        options={[
                          { label: 'Primary Key Only', value: 'primary' },
                          { label: 'WHO Attributes Only', value: 'who' },
                          { label: 'Required Only', value: 'required' },
                        ]}
                        getLabel={(option) => option.label}
                        getValue={(option) => option.value}
                        className="w-44"
                        placeholder="Filter attributes..."
                        noneLabel="Show All"
                      />
                      {selectedDS.readOnly && (
                        <Button
                          variant="outline"
                          size="icon"
                          data-tip="Read Only"
                          className="h-9 w-9 cursor-default border-muted-foreground/20"
                        >
                          <PencilOff className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      {missingPrimaryKey && (
                        <Button
                          variant="outline"
                          size="icon"
                          data-tip="Missing primary key"
                          data-tip-error
                          onClick={() => setDsFilter('primary')}
                          className="h-9 w-9 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10"
                        >
                          <KeyIcon className="h-4 w-4 text-amber-500" />
                        </Button>
                      )}
                      {whoAttributesCount !== 4 && (
                        <Button
                          variant="outline"
                          data-tip={`Missing ${4 - whoAttributesCount} WHO attributes`}
                          data-tip-error
                          onClick={() => setDsFilter('who')}
                          className="h-9 gap-1 border-amber-300 bg-amber-50 px-2.5 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10"
                        >
                          <User2 className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-amber-600 text-xs dark:text-amber-400">
                            {4 - whoAttributesCount}
                          </span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <TabsContent value="Query" className="mt-0 min-h-0 flex-1">
                  {selectedDS && (
                    <QueryTab selectedDS={selectedDS} queryData={queryData} setQueryData={dispatch.setQueryData} />
                  )}
                </TabsContent>

                <TabsContent value="Post" className="mt-0 min-h-0 flex-1">
                  {selectedDS && (
                    <PostTab selectedDS={selectedDS} postData={postData} setPostData={dispatch.setPostData} />
                  )}
                </TabsContent>

                <TabsContent value="DS" className="mt-0 min-h-0 flex-1">
                  {selectedDS && <DataSourceTab selectedDS={selectedDS} filter={dsFilter} />}
                </TabsContent>
              </Tabs>

              {/* Response Display */}
              {queryMode !== 'DS' && (
                <ResultTabs
                  resultMode={resultMode}
                  setResultMode={dispatch.setResultMode}
                  response={response}
                  error={error}
                  headers={headers}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}
