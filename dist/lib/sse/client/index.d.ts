/**
 * SSE Client-side exports
 *
 * @example
 * ```typescript
 * import { useSSE, useSSEStatus, sseManager } from '../../../lib/sse/client';
 *
 * // In a component
 * const { status } = useSSE({
 *   channels: ['workflow:abc123'],
 *   onMessage: (channel, data) => console.log(channel, data),
 * });
 *
 * // Just get status
 * const status = useSSEStatus();
 * ```
 */
export { useSSE, useSSEStatus } from './use-sse';
export { sseManager } from './sse-manager';
//# sourceMappingURL=index.d.ts.map
