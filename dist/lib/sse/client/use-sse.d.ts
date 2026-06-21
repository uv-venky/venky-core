import type { Channel, SSEConnectionStatus, UseSSEOptions, UseSSEReturn } from '../types';
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
export declare function useSSE<T extends Channel>(options: UseSSEOptions<T>): UseSSEReturn;
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
export declare function useSSEStatus(): SSEConnectionStatus;
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
export declare function useSSEStatusWithDelay(): {
    status: SSEConnectionStatus;
    reconnectDelayRemaining: number | null;
};
//# sourceMappingURL=use-sse.d.ts.map