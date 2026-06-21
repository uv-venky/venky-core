/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';
import { cn } from '../../../../../../lib/utils';
import { ChevronDown, ChevronRight, Clock, Loader2, Play, Terminal, Timer } from 'lucide-react';
import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { JobHistoryPanel } from './job-history-panel';
function StatusBadge({ job }) {
  if (job.isRunning) {
    return _jsxs(Badge, {
      variant: 'outline',
      className:
        'gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
      children: [_jsx(Loader2, { className: 'h-3 w-3 animate-spin' }), 'Running'],
    });
  }
  if (job.lastRunSuccess === true) {
    return _jsx(Badge, {
      variant: 'outline',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
      children: 'Success',
    });
  }
  if (job.lastRunSuccess === false) {
    return _jsx(Badge, {
      variant: 'outline',
      className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
      children: 'Failed',
    });
  }
  return _jsx(Badge, {
    variant: 'outline',
    className: 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
    children: 'Pending',
  });
}
function formatDuration(ms) {
  if (ms == null) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}
function formatTimeAgo(iso) {
  if (!iso) return '-';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '-';
  }
}
function formatTimeUntil(iso) {
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
export function JobTable({ jobs, onTriggerJob }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [triggeringJob, setTriggeringJob] = useState(null);
  const handleToggleExpand = useCallback((jobName) => {
    setExpandedJob((prev) => (prev === jobName ? null : jobName));
  }, []);
  const handleTrigger = useCallback(
    async (jobName) => {
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
  return _jsxs('div', {
    className: 'overflow-hidden rounded-xl border bg-card shadow-sm',
    children: [
      _jsxs('button', {
        type: 'button',
        onClick: () => setExpanded((prev) => !prev),
        className:
          'flex w-full items-center gap-3 border-b bg-muted/30 px-5 py-3 text-left transition-colors hover:bg-muted/50',
        children: [
          expanded
            ? _jsx(ChevronDown, { className: 'h-4 w-4 text-muted-foreground' })
            : _jsx(ChevronRight, { className: 'h-4 w-4 text-muted-foreground' }),
          _jsx(Terminal, { className: 'h-4 w-4 text-muted-foreground' }),
          _jsx('span', { className: 'font-semibold text-sm', children: 'Scheduled Jobs' }),
          _jsxs('span', {
            className: 'ml-2 flex items-center gap-2 text-muted-foreground text-xs',
            children: [
              _jsxs('span', { children: [jobs.length, ' jobs'] }),
              runningCount > 0 &&
                _jsxs('span', {
                  className: 'flex items-center gap-1',
                  children: [
                    _jsx('span', { className: 'h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' }),
                    runningCount,
                    ' running',
                  ],
                }),
              failedCount > 0 &&
                _jsxs('span', {
                  className: 'flex items-center gap-1',
                  children: [
                    _jsx('span', { className: 'h-1.5 w-1.5 rounded-full bg-red-500' }),
                    failedCount,
                    ' failed',
                  ],
                }),
            ],
          }),
        ],
      }),
      expanded &&
        _jsxs(_Fragment, {
          children: [
            _jsx('div', {
              className: 'border-b bg-muted/20 px-5 py-2',
              children: _jsxs('div', {
                className:
                  'grid grid-cols-[2rem_1fr_8rem_6rem_7rem_7rem_5rem_5rem] items-center gap-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider',
                children: [
                  _jsx('div', {}),
                  _jsx('div', { children: 'Job' }),
                  _jsx('div', { children: 'Schedule' }),
                  _jsx('div', { children: 'Status' }),
                  _jsx('div', { children: 'Next Run' }),
                  _jsx('div', { children: 'Last Run' }),
                  _jsx('div', { children: 'Duration' }),
                  _jsx('div', {}),
                ],
              }),
            }),
            _jsx('div', {
              className: 'divide-y',
              children: jobs.map((job) => {
                const isExpanded = expandedJob === job.name;
                const isTriggering = triggeringJob === job.name;
                return _jsxs(
                  'div',
                  {
                    children: [
                      _jsxs('div', {
                        className: cn(
                          'grid grid-cols-[2rem_1fr_8rem_6rem_7rem_7rem_5rem_5rem] items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20',
                          isExpanded && 'bg-muted/10',
                        ),
                        children: [
                          _jsx('button', {
                            type: 'button',
                            onClick: () => handleToggleExpand(job.name),
                            className:
                              'flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                            children: isExpanded
                              ? _jsx(ChevronDown, { className: 'h-4 w-4' })
                              : _jsx(ChevronRight, { className: 'h-4 w-4' }),
                          }),
                          _jsxs('div', {
                            children: [
                              _jsx('button', {
                                type: 'button',
                                onClick: () => handleToggleExpand(job.name),
                                className: 'text-left',
                                children: _jsx('span', { className: 'font-medium text-sm', children: job.name }),
                              }),
                              job.lastRunError &&
                                !isExpanded &&
                                _jsx('p', {
                                  className: 'mt-0.5 truncate text-red-500 text-xs',
                                  children: job.lastRunError,
                                }),
                            ],
                          }),
                          _jsxs('div', {
                            className: 'flex items-center gap-1.5 text-muted-foreground text-xs',
                            children: [
                              _jsx(Clock, { className: 'h-3.5 w-3.5 shrink-0' }),
                              _jsx('span', {
                                className: 'truncate',
                                title: job.schedule,
                                children: job.scheduleDescription,
                              }),
                            ],
                          }),
                          _jsx('div', { children: _jsx(StatusBadge, { job: job }) }),
                          _jsx('div', {
                            className: 'text-muted-foreground text-xs',
                            title: job.nextRun ?? undefined,
                            children: formatTimeUntil(job.nextRun),
                          }),
                          _jsx('div', {
                            className: 'text-muted-foreground text-xs',
                            title: job.lastRun ?? undefined,
                            children: formatTimeAgo(job.lastRun),
                          }),
                          _jsxs('div', {
                            className: 'flex items-center gap-1 text-muted-foreground text-xs',
                            children: [
                              _jsx(Timer, { className: 'h-3 w-3 shrink-0' }),
                              formatDuration(job.lastRunDurationMs),
                            ],
                          }),
                          _jsx('div', {
                            className: 'flex justify-end',
                            children: _jsxs(Button, {
                              size: 'sm',
                              variant: 'ghost',
                              onClick: () => handleTrigger(job.name),
                              disabled: isTriggering || job.isRunning,
                              className: 'h-7 gap-1 px-2 text-xs',
                              activityId: `trigger-job-${job.name}`,
                              children: [
                                isTriggering
                                  ? _jsx(Loader2, { className: 'h-3.5 w-3.5 animate-spin' })
                                  : _jsx(Play, { className: 'h-3.5 w-3.5' }),
                                'Run',
                              ],
                            }),
                          }),
                        ],
                      }),
                      isExpanded &&
                        _jsx('div', {
                          className: 'border-t bg-muted/5 px-5 py-4',
                          children: _jsx(JobHistoryPanel, { jobName: job.name }),
                        }),
                    ],
                  },
                  job.name,
                );
              }),
            }),
            jobs.length === 0 &&
              _jsxs('div', {
                className: 'flex flex-col items-center justify-center py-12 text-muted-foreground',
                children: [
                  _jsx(Terminal, { className: 'mb-3 h-10 w-10 opacity-40' }),
                  _jsx('p', { className: 'text-sm', children: 'No jobs registered' }),
                ],
              }),
          ],
        }),
    ],
  });
}
//# sourceMappingURL=job-table.js.map
