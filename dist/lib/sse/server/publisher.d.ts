import type { PgPoolClient } from '../../../lib/core/server/db';
import type { Channel, ChannelPayload } from '../types';
/**
 * Publish an SSE event to a channel via PostgreSQL NOTIFY
 *
 * This sends the event through the VENKY_events channel, which is picked up
 * by the singleton listener and broadcast to connected SSE clients.
 *
 * @param client - PostgreSQL pool client
 * @param channel - The SSE channel to publish to (e.g., 'workflow:abc123')
 * @param data - The data payload to send
 *
 * @example
 * ```typescript
 * // Publish a workflow status update
 * await publishSSE(client, `workflow:${workflowId}`, {
 *   executionId: execution.id,
 *   status: 'running',
 * });
 *
 * // Publish a user notification
 * await publishSSE(client, `notification:${userId}`, {
 *   title: 'Task Complete',
 *   body: 'Your workflow has finished running.',
 * });
 *
 * // Publish a data change event
 * await publishSSE(client, `data:users`, {
 *   action: 'update',
 *   id: user.id,
 * });
 * ```
 */
export declare function publishSSE<T extends Channel>(
  client: PgPoolClient,
  channel: T,
  data: ChannelPayload<T>,
): Promise<void>;
//# sourceMappingURL=publisher.d.ts.map
