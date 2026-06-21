/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useSSE } from '../../../../../../lib/sse/client/use-sse';
import { invalidateQuery } from '../../../../../../lib/core/client/useQueryBase';
import { useCallback } from 'react';
/**
 * Subscribe to job status SSE events and invalidate the dashboard query cache
 * when jobs start, complete, or fail.
 */
export function useJobSSE() {
  const handleMessage = useCallback((_channel, _data) => {
    // Invalidate the dashboard data when any job event occurs
    invalidateQuery('getJobDashboard');
  }, []);
  return useSSE({
    channels: ['job:status'],
    onMessage: handleMessage,
    enabled: true,
  });
}
//# sourceMappingURL=use-job-sse.js.map
