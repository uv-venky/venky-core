'use client';

/* Copyright (c) 2024-present Venky Corp. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Channel, ChannelPayload, SSEConnectionStatus, UseSSEOptions, UseSSEReturn } from '../types';
import { sseManager } from './sse-manager';

/**
 * React hook for subscribing to SSE channels
 *
 * Uses the shared SSE Manager singleton to efficiently manage subscriptions.
 * Multiple useSSE hooks share a single EventSource connection.
 *
 * @example
 * ```typescript
 * // Subscribe to workflow updates
 * const { status } = useSSE({
 *   channels: [`workflow:${workflowId}`],
 *   onMessage: (channel, data) => {
 *     console.log('Received:', channel, data);
 *     // Update state, refetch data, etc.
 *   },
 * });
 *
 * // Conditional subscription
 * const { status } = useSSE({
 *   channels: [`execution:${executionId}`],
 *   onMessage: handleUpdate,
 *   enabled: isRunning,
 * });
 * ```
 */
export function useSSE<T extends Channel>(options: UseSSEOptions<T>): UseSSEReturn {
  const { channels, onMessage, enabled = true, onStatusChange } = options;

  const [status, setStatus] = useState<SSEConnectionStatus>('disconnected');

  // Use refs to avoid re-subscribing when callbacks change
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  // Stable callback that uses refs
  const handleMessage = useCallback((channel: T, data: ChannelPayload<T>) => {
    onMessageRef.current(channel, data);
  }, []);

  // Create a stable key from channels by sorting and joining
  // This ensures we detect content changes, not just reference changes
  const channelsKey = useMemo(() => {
    return [...channels].sort().join(',');
  }, [channels]);

  // Memoize sorted channels array based on the stable key
  // This prevents unnecessary re-renders when channels array reference changes but content is the same
  // We use channelsKey as the dependency instead of channels to avoid re-memoizing when only the reference changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: channelsKey is computed from channels, so it captures content changes
  const memoizedChannels = useMemo(() => {
    return [...channels].sort() as T[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelsKey]);

  const channelsCount = memoizedChannels.length;

  useEffect(() => {
    if (!enabled || channelsCount === 0) {
      setStatus('disconnected');
      return;
    }

    // Subscribe to status changes
    const unsubscribeStatus = sseManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      onStatusChangeRef.current?.(newStatus);
    });

    // Subscribe to channels (memoizedChannels is stable based on channelsKey)
    const unsubscribeChannels = sseManager.subscribe(memoizedChannels, handleMessage);

    return () => {
      unsubscribeStatus();
      unsubscribeChannels();
    };
  }, [channelsKey, channelsCount, enabled, handleMessage, memoizedChannels]);

  return { status };
}

/**
 * Hook to get the current SSE connection status without subscribing to channels
 *
 * @example
 * ```typescript
 * const status = useSSEStatus();
 *
 * return (
 *   <div>
 *     Connection: {status === 'connected' ? '🟢' : '🔴'}
 *   </div>
 * );
 * ```
 */
export function useSSEStatus(): SSEConnectionStatus {
  const [status, setStatus] = useState<SSEConnectionStatus>(() => sseManager.getStatus());

  useEffect(() => {
    return sseManager.onStatusChange(setStatus);
  }, []);

  return status;
}

/**
 * Hook to get the current SSE connection status and reconnect delay remaining
 *
 * @example
 * ```typescript
 * const { status, reconnectDelayRemaining } = useSSEStatusWithDelay();
 *
 * return (
 *   <div>
 *     Connection: {status}
 *     {reconnectDelayRemaining !== null && (
 *       <span>Reconnecting in {Math.ceil(reconnectDelayRemaining / 1000)}s</span>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useSSEStatusWithDelay(): {
  status: SSEConnectionStatus;
  reconnectDelayRemaining: number | null;
} {
  const [status, setStatus] = useState<SSEConnectionStatus>(() => sseManager.getStatus());
  const [reconnectDelayRemaining, setReconnectDelayRemaining] = useState<number | null>(() =>
    sseManager.getReconnectDelayRemaining(),
  );

  useEffect(() => {
    const unsubscribe = sseManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setReconnectDelayRemaining(sseManager.getReconnectDelayRemaining());
    });

    // Poll for reconnect delay updates every second when disconnected/error
    const interval = setInterval(() => {
      const delay = sseManager.getReconnectDelayRemaining();
      setReconnectDelayRemaining(delay);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { status, reconnectDelayRemaining };
}
