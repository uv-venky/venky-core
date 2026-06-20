/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useSSE } from '@/lib/sse/client/use-sse';
import { invalidateQuery } from '@/lib/core/client/useQueryBase';
import { useCallback } from 'react';
import type { JobStatusChannel, JobStatusChannelPayload } from '@/lib/sse/types';

/**
 * Subscribe to job status SSE events and invalidate the dashboard query cache
 * when jobs start, complete, or fail.
 */
export function useJobSSE() {
  const handleMessage = useCallback((_channel: JobStatusChannel, _data: JobStatusChannelPayload) => {
    // Invalidate the dashboard data when any job event occurs
    invalidateQuery('getJobDashboard');
  }, []);

  return useSSE<JobStatusChannel>({
    channels: ['job:status'],
    onMessage: handleMessage,
    enabled: true,
  });
}
