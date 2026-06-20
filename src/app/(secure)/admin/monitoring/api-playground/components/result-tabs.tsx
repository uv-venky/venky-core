'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Clock,
  Code2,
  FileJson2,
  Loader2,
  Network,
  Rows3,
  Terminal,
  XCircle,
} from 'lucide-react';
import { LazyMonacoEditor } from '../MonacoEditorLazy';
import type { ApiResponse } from '../types';
import EmptyState from './empty-state';

interface ResultTabsProps {
  resultMode: 'Result' | 'Debug' | 'Headers';
  setResultMode: (mode: 'Result' | 'Debug' | 'Headers') => void;
  response: ApiResponse | null;
  error: string | null;
  headers: Headers | null;
  loading: boolean;
}

export function ResultTabs({ resultMode, setResultMode, response, error, headers, loading }: ResultTabsProps) {
  if (!response && !error) return <EmptyState />;

  const isSuccess = response?.status === 'OK';

  return (
    <Tabs
      className="flex flex-1 flex-col gap-0 overflow-hidden rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm"
      value={resultMode}
      onValueChange={(value) => setResultMode(value as 'Result' | 'Debug' | 'Headers')}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <TabsList className="h-10 gap-1 rounded-lg bg-muted/60 p-1">
          <TabsTrigger
            value="Result"
            className="rounded-md px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileJson2 className="mr-2 h-4 w-4" />
            Result
          </TabsTrigger>
          <TabsTrigger
            value="Debug"
            className="rounded-md px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bug className="mr-2 h-4 w-4" />
            Debug
          </TabsTrigger>
          <TabsTrigger
            value="Headers"
            className="rounded-md px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Network className="mr-2 h-4 w-4" />
            Headers
          </TabsTrigger>
        </TabsList>

        {response && (
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <Badge
                className={
                  isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'
                }
              >
                {isSuccess ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                {response.status}
              </Badge>
            )}

            {response.elapsed && (
              <div className="flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{response.elapsed}ms</span>
              </div>
            )}

            <div className="flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs">
              <Rows3 className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{response.count ?? response.rows?.length ?? 0} rows</span>
            </div>
          </div>
        )}
      </div>

      <TabsContent value="Result" className="mt-0 flex-1">
        {error ? (
          <Alert
            variant="destructive"
            className="mx-4 w-auto border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mt-1">{error}</AlertDescription>
          </Alert>
        ) : (
          <LazyMonacoEditor
            value={response ? JSON.stringify(response.rows, null, 2) : 'Submit a query to see results'}
            type="Result"
            disabled
          />
        )}
      </TabsContent>

      <TabsContent value="Debug" className="mt-0 flex-1 overflow-hidden">
        {response && (
          <div className="flex h-full flex-col">
            {response.sql && (
              <div className="flex h-1/2 flex-col overflow-hidden">
                <div className="flex shrink-0 items-center gap-2 bg-muted/30 px-3 py-1.5">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">SQL Query</span>
                </div>
                <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-auto border-t bg-background p-3 font-mono text-emerald-600 text-sm dark:text-emerald-400">
                  <pre className="whitespace-pre-wrap">{response.sql}</pre>
                </div>
              </div>
            )}

            {response.params && response.params.length > 0 && (
              <div className="flex h-1/2 flex-col overflow-hidden">
                <div className="flex shrink-0 items-center gap-2 bg-muted/30 px-3 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Parameters</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {response.params.length}
                  </Badge>
                </div>
                <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 overflow-auto border-t bg-background p-3 font-mono text-cyan-600 text-sm dark:text-cyan-400">
                  <pre>{JSON.stringify(response.params, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="Headers" className="mt-0 flex-1 overflow-hidden">
        {headers && (
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-1/3 font-semibold">Header</TableHead>
                  <TableHead className="font-semibold">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(headers.entries()).map(([key, value]) => (
                  <TableRow key={key} className="font-mono text-sm">
                    <TableCell className="whitespace-nowrap text-violet-600 dark:text-violet-400">{key}</TableCell>
                    <TableCell className="text-muted-foreground">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
