/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Clock, Loader2, Play, Terminal, Timer } from 'lucide-react';
import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { JobDashboardRow } from '../action';
import { JobHistoryPanel } from './job-history-panel';

interface JobTableProps {
  jobs: JobDashboardRow[];
  onTriggerJob: (jobName: string) => Promise<void>;
}

function StatusBadge({ job }: { job: JobDashboardRow }) {
  if (job.isRunning) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </Badge>
    );
  }
  if (job.lastRunSuccess === true) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      >
        Success
      </Badge>
    );
  }
  if (job.lastRunSuccess === false) {
    return (
      <Badge
        variant="outline"
        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
      >
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      Pending
    </Badge>
  );
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return '-';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '-';
  }
}

function formatTimeUntil(iso: string | null): string {
  if (!iso) return '-';
  try {
    const date = new Date(iso);
    const now = new Date();
    if (date <= now) return 'Due now';
    return formatDistanceToNow(date, { addSuffix: false });
  } catch {
    return '-';
  }
}

export function JobTable({ jobs, onTriggerJob }: JobTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  const handleToggleExpand = useCallback((jobName: string) => {
    setExpandedJob((prev) => (prev === jobName ? null : jobName));
  }, []);

  const handleTrigger = useCallback(
    async (jobName: string) => {
      setTriggeringJob(jobName);
      try {
        await onTriggerJob(jobName);
      } finally {
        setTriggeringJob(null);
      }
    },
    [onTriggerJob],
  );

  const runningCount = jobs.filter((j) => j.isRunning).length;
  const failedCount = jobs.filter((j) => j.lastRunSuccess === false).length;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 border-b bg-muted/30 px-5 py-3 text-left transition-colors hover:bg-muted/50"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-sm">Scheduled Jobs</span>
        <span className="ml-2 flex items-center gap-2 text-muted-foreground text-xs">
          <span>{jobs.length} jobs</span>
          {runningCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              {runningCount} running
            </span>
          )}
          {failedCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {failedCount} failed
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <>
          {/* Column Headers */}
          <div className="border-b bg-muted/20 px-5 py-2">
            <div className="grid grid-cols-[2rem_1fr_8rem_6rem_7rem_7rem_5rem_5rem] items-center gap-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <div />
              <div>Job</div>
              <div>Schedule</div>
              <div>Status</div>
              <div>Next Run</div>
              <div>Last Run</div>
              <div>Duration</div>
              <div />
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {jobs.map((job) => {
              const isExpanded = expandedJob === job.name;
              const isTriggering = triggeringJob === job.name;

              return (
                <div key={job.name}>
                  <div
                    className={cn(
                      'grid grid-cols-[2rem_1fr_8rem_6rem_7rem_7rem_5rem_5rem] items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20',
                      isExpanded && 'bg-muted/10',
                    )}
                  >
                    {/* Expand toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(job.name)}
                      className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {/* Job name */}
                    <div>
                      <button type="button" onClick={() => handleToggleExpand(job.name)} className="text-left">
                        <span className="font-medium text-sm">{job.name}</span>
                      </button>
                      {job.lastRunError && !isExpanded && (
                        <p className="mt-0.5 truncate text-red-500 text-xs">{job.lastRunError}</p>
                      )}
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate" title={job.schedule}>
                        {job.scheduleDescription}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <StatusBadge job={job} />
                    </div>

                    {/* Next run */}
                    <div className="text-muted-foreground text-xs" title={job.nextRun ?? undefined}>
                      {formatTimeUntil(job.nextRun)}
                    </div>

                    {/* Last run */}
                    <div className="text-muted-foreground text-xs" title={job.lastRun ?? undefined}>
                      {formatTimeAgo(job.lastRun)}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Timer className="h-3 w-3 shrink-0" />
                      {formatDuration(job.lastRunDurationMs)}
                    </div>

                    {/* Trigger button */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTrigger(job.name)}
                        disabled={isTriggering || job.isRunning}
                        className="h-7 gap-1 px-2 text-xs"
                        activityId={`trigger-job-${job.name}`}
                      >
                        {isTriggering ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Run
                      </Button>
                    </div>
                  </div>

                  {/* Expanded history panel */}
                  {isExpanded && (
                    <div className="border-t bg-muted/5 px-5 py-4">
                      <JobHistoryPanel jobName={job.name} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Terminal className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">No jobs registered</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
