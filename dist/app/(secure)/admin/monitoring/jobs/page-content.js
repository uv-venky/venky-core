/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import PageLayout from '../../../../../components/core/page/PageLayout';
import { Button } from '../../../../../components/ui/button';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { useQuery, useMutation } from '../../../../../lib/core/client/useQuery';
import { invalidateQuery } from '../../../../../lib/core/client/useQueryBase';
import { showSuccess, showError } from '../../../../../components/core/common/Notification';
import { RefreshCcw, Terminal } from 'lucide-react';
import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { JobSummaryCards } from './components/job-summary-cards';
import { JobTable } from './components/job-table';
import { SchedulerNodesSection } from './components/scheduler-nodes-section';
import { useJobSSE } from './hooks/use-job-sse';
export default function JobCommandCenter() {
  const [lastUpdated, setLastUpdated] = useState(null);
  const dashboardResult = useQuery('getJobDashboard');
  // SSE for real-time updates
  useJobSSE();
  const triggerJob = useMutation('triggerJob', {
    invalidateOnSuccess: ['getJobDashboard'],
  });
  const handleRefresh = useCallback(() => {
    invalidateQuery('getJobDashboard');
    setLastUpdated(new Date());
  }, []);
  const handleTriggerJob = useCallback(
    async (jobName) => {
      try {
        const result = await triggerJob(jobName);
        if (result && typeof result === 'object' && 'success' in result) {
          if (result.success) {
            showSuccess(`Job "${jobName}" completed successfully`);
          } else {
            showError(`Job "${jobName}" failed: ${result.error}`);
          }
        }
      } catch {
        showError(`Failed to trigger job "${jobName}"`);
      }
    },
    [triggerJob],
  );
  const loading = dashboardResult.status === 'loading';
  const data = dashboardResult.status === 'success' ? dashboardResult.data : null;
  const error = dashboardResult.status === 'error' ? dashboardResult.error : null;
  if (loading && !data) {
    return _jsx(PageLayout, {
      icon: _jsxs('div', {
        className: 'relative',
        children: [
          _jsx('div', {
            className:
              'absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-xl',
          }),
          _jsx('div', {
            className:
              'relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg',
            children: _jsx(Terminal, { className: 'h-6 w-6 text-white' }),
          }),
        ],
      }),
      title: 'Job Command Center',
      subTitle: 'Loading job data...',
      children: _jsx('div', {
        className: 'h-full w-full overflow-auto p-6',
        children: _jsxs('div', {
          className: 'mx-auto flex w-full max-w-6xl flex-col gap-6',
          children: [
            _jsx('div', {
              className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
              children: ['total', 'running', 'failed', 'rate'].map((key) =>
                _jsx(Skeleton, { className: 'h-28 rounded-xl' }, key),
              ),
            }),
            _jsx(Skeleton, { className: 'h-96 rounded-xl' }),
          ],
        }),
      }),
    });
  }
  return _jsx(PageLayout, {
    icon: _jsxs('div', {
      className: 'relative',
      children: [
        _jsx('div', {
          className:
            'absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-xl',
        }),
        _jsx('div', {
          className:
            'relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg',
          children: _jsx(Terminal, { className: 'h-6 w-6 text-white' }),
        }),
      ],
    }),
    title: 'Job Command Center',
    transparentMainSection: true,
    subTitle: lastUpdated
      ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
      : 'Scheduled job monitoring & control',
    toolbar: _jsxs(Button, {
      onClick: handleRefresh,
      disabled: loading,
      className:
        'group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl',
      activityId: 'jobs-refresh',
      children: [
        _jsxs('span', {
          className: 'relative z-10 flex items-center gap-2',
          children: [
            _jsx(RefreshCcw, {
              className: `h-4 w-4 ${loading ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}`,
            }),
            'Refresh',
          ],
        }),
        _jsx('div', {
          className:
            'absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        }),
      ],
    }),
    children: _jsxs('div', {
      className: 'h-full w-full overflow-auto p-4',
      children: [
        error &&
          _jsx('div', {
            className:
              'mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-400',
            children: error,
          }),
        data &&
          _jsxs('div', {
            className: 'mx-auto flex w-full max-w-6xl flex-col gap-6',
            children: [
              _jsx(JobSummaryCards, { summary: data.summary }),
              _jsx(SchedulerNodesSection, {}),
              _jsx(JobTable, { jobs: data.jobs, onTriggerJob: handleTriggerJob }),
            ],
          }),
      ],
    }),
  });
}
//# sourceMappingURL=page-content.js.map
