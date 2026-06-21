/* Copyright (c) 2024-present Venky Corp. */
import { auth } from '../../../../auth';
import logger from '../../../../lib/core/server/logger';
import { sseRegistry } from '../../../../lib/sse/server/registry';
import { authorizeSSEChannels } from '../../../../lib/sse/server/authorizer';
import { APP_VERSION } from '../../../../lib/app-info';
/**
 * SSE Stream Route
 *
 * Single endpoint for all SSE connections. Clients subscribe to channels
 * via query parameters and receive real-time updates.
 *
 * @example
 * ```typescript
 * // Client-side connection
 * const eventSource = new EventSource('/api/sse/stream?channels=workflow:abc,notification:user1');
 * ```
 */
export async function GET(request) {
  const session = await auth();
  if (!session?.user?.userName) {
    return new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(request.url);
  const channelsParam = url.searchParams.get('channels');
  if (!channelsParam) {
    return new Response('Missing channels parameter', { status: 400 });
  }
  const requestedChannels = channelsParam.split(',').filter(Boolean);
  if (requestedChannels.length === 0) {
    return new Response('No valid channels provided', { status: 400 });
  }
  // Authorize every requested channel before subscribing. Reject the whole
  // request on any denial so callers notice misuse and clients don't silently
  // receive a partial subscription.
  const { allowed, denied } = await authorizeSSEChannels(requestedChannels, session);
  if (denied.length > 0) {
    logger.warn('[SSE Route] Rejecting subscription with unauthorized channels', {
      userName: session.user.userName,
      denied,
    });
    return new Response('Forbidden: one or more channels are not authorized for this user', {
      status: 403,
    });
  }
  const channels = allowed;
  const stream = new ReadableStream({
    start(controller) {
      // Register client with the SSE registry
      const client = sseRegistry.subscribe(channels, controller, session.user.userName);
      // Send initial connection confirmation with version
      const encoder = new TextEncoder();
      const connectMessage = `data: ${JSON.stringify({
        channel: '_system',
        data: { type: 'connected', channels },
        timestamp: Date.now(),
      })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));
      // Send version information
      const versionMessage = `data: ${JSON.stringify({
        channel: '_system',
        data: { type: 'version', version: APP_VERSION },
        timestamp: Date.now(),
      })}\n\n`;
      controller.enqueue(encoder.encode(versionMessage));
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        // logger.info('[SSE Route] Client disconnected', {
        //   userName: session.user.userName,
        //   channels,
        // });
        sseRegistry.unsubscribe(client.controller);
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      });
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
export const runtime = 'nodejs';
//# sourceMappingURL=route.js.map
