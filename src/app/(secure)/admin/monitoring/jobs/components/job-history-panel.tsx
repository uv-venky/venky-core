/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@/lib/core/client/useQuery';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Loader2, Server } from 'lucide-react';
import type { JobHistoryResult, JobHistoryRow } from '../action';

interface JobHistoryPanelProps {
  jobName: string;
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function RunStatusIcon({ run }: { run: JobHistoryRow }) {
  if (run.finishedAt == null) {
    return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  }
  if (run.success) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  return <AlertCircle className="h-4 w-4 text-red-500" />;
}

export function JobHistoryPanel({ jobName }: JobHistoryPanelProps) {
  const historyResult = useQuery('getJobHistory', jobName);

  if (historyResult.status === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        <div className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Run History</div>
        {['a', 'b', 'c'].map((key) => (
          <Skeleton key={key} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (historyResult.status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        Failed to load history: {historyResult.error}
      </div>
    );
  }

  const { runs } = historyResult.data as JobHistoryResult;

  if (runs.length === 0) {
    return <div className="py-4 text-center text-muted-foreground text-sm">No run history available</div>;
  }

  return (
    <div>
      <div className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
        Recent Runs ({runs.length})
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-muted-foreground text-xs">
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Started</th>
              <th className="px-3 py-2 text-left font-medium">Duration</th>
              <th className="px-3 py-2 text-left font-medium">Node</th>
              <th className="px-3 py-2 text-left font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {runs.map((run) => (
              <tr key={run.jobRunId} className="transition-colors hover:bg-muted/10">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <RunStatusIcon run={run} />
                    <span className="text-xs">
                      {run.finishedAt == null ? 'Running' : run.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(run.startedAt), 'MMM d, HH:mm:ss')}
                  </div>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">{formatDuration(run.durationMs)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Server className="h-3 w-3" />
                    <span className="max-w-[120px] truncate" title={run.node}>
                      {run.node}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {run.error && (
                    <span className="max-w-[200px] truncate text-red-500 text-xs" title={run.error}>
                      {run.error}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
