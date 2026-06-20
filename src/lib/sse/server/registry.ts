/* Copyright (c) 2024-present Venky Corp. */

import logger from '@/lib/core/server/logger';
import type { Channel, SSEClient, SSEMessage } from '../types';

// Extend globalThis to include our registry
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
class SSERegistry {
  /** Map of channel name to set of clients subscribed to that channel */
  private channelClients = new Map<string, Set<SSEClient>>();

  /** Map of controller to client info for quick lookup during unsubscribe */
  private controllerToClient = new Map<ReadableStreamDefaultController<Uint8Array>, SSEClient>();

  /**
   * Subscribe a client to one or more channels
   *
   * @param channels - Array of channel names to subscribe to
   * @param controller - The ReadableStream controller for sending data
   * @param userName - The user ID associated with this connection
   * @returns The SSEClient object
   */
  subscribe(channels: string[], controller: ReadableStreamDefaultController<Uint8Array>, userName: string): SSEClient {
    const client: SSEClient = {
      controller,
      userName,
      channels: new Set(channels),
      encoder: new TextEncoder(),
    };

    // Register client for each channel
    for (const channel of channels) {
      let clients = this.channelClients.get(channel);
      if (!clients) {
        clients = new Set();
        this.channelClients.set(channel, clients);
      }
      clients.add(client);
    }

    // Store reverse mapping for unsubscribe
    this.controllerToClient.set(controller, client);

    if (logger.debugEnabled) {
      logger.debug('[SSE Registry] Client subscribed', {
        userName,
        channels,
        totalClients: this.controllerToClient.size,
      });
    }

    return client;
  }

  /**
   * Unsubscribe a client from all channels
   *
   * @param controller - The controller to unsubscribe
   */
  unsubscribe(controller: ReadableStreamDefaultController<Uint8Array>): void {
    const client = this.controllerToClient.get(controller);
    if (!client) {
      return;
    }

    // Remove from all channels
    for (const channel of client.channels) {
      const clients = this.channelClients.get(channel);
      if (clients) {
        clients.delete(client);
        // Clean up empty channel sets
        if (clients.size === 0) {
          this.channelClients.delete(channel);
        }
      }
    }

    // Remove reverse mapping
    this.controllerToClient.delete(controller);

    if (logger.debugEnabled) {
      logger.debug('[SSE Registry] Client unsubscribed', {
        userName: client.userName,
        channels: Array.from(client.channels),
        totalClients: this.controllerToClient.size,
      });
    }
  }

  /**
   * Broadcast a message to all clients subscribed to a channel
   *
   * @param channel - The channel to broadcast to
   * @param data - The data to send
   */
  broadcast(channel: string, data: unknown): void {
    const clients = this.channelClients.get(channel);
    if (!clients || clients.size === 0) {
      // if (logger.debugEnabled) {
      //   logger.debug('[SSE Registry] No clients for channel', { channel });
      // }
      return;
    }

    const message: SSEMessage = {
      channel: channel as Channel,
      data: data as never,
      timestamp: Date.now(),
    };

    let messageString: string;
    try {
      messageString = `data: ${JSON.stringify(message)}\n\n`;
    } catch (error) {
      logger.error('[SSE Registry] Broadcast payload not serializable or too large', {
        channel,
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }
    let sentCount = 0;
    const failedClients: SSEClient[] = [];

    for (const client of clients) {
      try {
        const encoded = client.encoder.encode(messageString);
        client.controller.enqueue(encoded);
        sentCount++;
      } catch (error) {
        logger.error('[SSE Registry] Failed to send message to client', {
          userName: client.userName,
          channel,
          error,
        });
        // Mark for cleanup
        failedClients.push(client);
      }
    }

    // Clean up failed clients
    for (const client of failedClients) {
      this.unsubscribe(client.controller);
    }

    if (logger.debugEnabled) {
      logger.debug('[SSE Registry] Broadcast complete', {
        channel,
        sentCount,
        failedCount: failedClients.length,
      });
    }
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.controllerToClient.size;
  }

  /**
   * Get the number of clients subscribed to a specific channel
   */
  getChannelClientCount(channel: string): number {
    return this.channelClients.get(channel)?.size ?? 0;
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channelClients.keys());
  }

  /**
   * Clear all clients and channels (for testing purposes)
   * @internal
   */
  _reset(): void {
    this.channelClients.clear();
    this.controllerToClient.clear();
  }

  // Snapshot of registry state — read by the memory-sampler job and surfaced
  // in uv_memory_samples. `queuedBytesEstimate` and `negativeDesiredSizeClients`
  // approximate buffered-bytes-per-client and catch SSE backpressure leaks.
  getDebugStats(): {
    totalClients: number;
    channels: Array<{ channel: string; clients: number }>;
    queuedBytesEstimate: number;
    negativeDesiredSizeClients: number;
  } {
    const channels = Array.from(this.channelClients.entries())
      .map(([channel, clients]) => ({ channel, clients: clients.size }))
      .sort((a, b) => b.clients - a.clients);

    // controller.desiredSize goes negative when the internal queue exceeds
    // highWaterMark — a proxy for "this client isn't draining". Sum of the
    // negative magnitudes approximates buffered bytes across all clients.
    let queuedBytesEstimate = 0;
    let negativeDesiredSizeClients = 0;
    for (const client of this.controllerToClient.values()) {
      const desired = client.controller.desiredSize;
      if (desired != null && desired < 0) {
        queuedBytesEstimate += -desired;
        negativeDesiredSizeClients++;
      }
    }

    return {
      totalClients: this.controllerToClient.size,
      channels,
      queuedBytesEstimate,
      negativeDesiredSizeClients,
    };
  }
}

/**
 * Get or create the singleton SSE Registry instance
 * Uses globalThis to persist across Next.js HMR reloads in development
 */
function getSSERegistry(): SSERegistry {
  if (!globalThis.__sseRegistry) {
    globalThis.__sseRegistry = new SSERegistry();
  }
  return globalThis.__sseRegistry;
}

export const sseRegistry = getSSERegistry();
