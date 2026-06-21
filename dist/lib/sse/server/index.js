/* Copyright (c) 2024-present Venky Corp. */
/**
 * SSE Server-side exports
 *
 * @example
 * ```typescript
 * import { publishSSE, sseRegistry } from '../../../lib/sse/server';
 *
 * // Publish an event
 * await publishSSE(client, 'workflow:abc123', { status: 'running' });
 *
 * // Check registry stats (for debugging/monitoring)
 * console.log('Connected clients:', sseRegistry.getClientCount());
 * ```
 */
export { publishSSE } from './publisher';
export { sseRegistry } from './registry';
export { authorizeSSEChannel, authorizeSSEChannels, registerChannelAuthorizer } from './authorizer';
//# sourceMappingURL=index.js.map
