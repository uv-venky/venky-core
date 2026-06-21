/* Copyright (c) 2024-present Venky Corp. */
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
export async function publishSSE(client, channel, data) {
  const eventType = 'sse';
  const payload = {
    channel,
    data,
    timestamp: Date.now(),
  };
  await client.query(`SELECT pg_notify('VENKY_events', $1)`, [JSON.stringify([eventType, payload])]);
}
//# sourceMappingURL=publisher.js.map
