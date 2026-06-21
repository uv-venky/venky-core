import type { SSEClient } from '../types';
declare global {
  var __sseRegistry: SSERegistry | undefined;
}
/**
 * SSE Registry - Singleton that manages connected SSE clients
 *
 * Stored in globalThis to persist across Next.js HMR reloads in development.
 * Tracks which clients are subscribed to which channels and handles
 * broadcasting messages to the appropriate clients.
 */
declare class SSERegistry {
  /** Map of channel name to set of clients subscribed to that channel */
  private channelClients;
  /** Map of controller to client info for quick lookup during unsubscribe */
  private controllerToClient;
  /**
   * Subscribe a client to one or more channels
   *
   * @param channels - Array of channel names to subscribe to
   * @param controller - The ReadableStream controller for sending data
   * @param userName - The user ID associated with this connection
   * @returns The SSEClient object
   */
  subscribe(channels: string[], controller: ReadableStreamDefaultController<Uint8Array>, userName: string): SSEClient;
  /**
   * Unsubscribe a client from all channels
   *
   * @param controller - The controller to unsubscribe
   */
  unsubscribe(controller: ReadableStreamDefaultController<Uint8Array>): void;
  /**
   * Broadcast a message to all clients subscribed to a channel
   *
   * @param channel - The channel to broadcast to
   * @param data - The data to send
   */
  broadcast(channel: string, data: unknown): void;
  /**
   * Get the number of connected clients
   */
  getClientCount(): number;
  /**
   * Get the number of clients subscribed to a specific channel
   */
  getChannelClientCount(channel: string): number;
  /**
   * Get all active channels
   */
  getActiveChannels(): string[];
  /**
   * Clear all clients and channels (for testing purposes)
   * @internal
   */
  _reset(): void;
  getDebugStats(): {
    totalClients: number;
    channels: Array<{
      channel: string;
      clients: number;
    }>;
    queuedBytesEstimate: number;
    negativeDesiredSizeClients: number;
  };
}
export declare const sseRegistry: SSERegistry;
export {};
//# sourceMappingURL=registry.d.ts.map
