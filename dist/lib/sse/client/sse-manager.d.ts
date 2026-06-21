import type { Channel, SSEConnectionStatus, SSEMessageCallback } from '../types';
declare global {
    var __sseManager: SSEManager | undefined;
}
/**
 * SSE Manager - Singleton that manages a shared EventSource connection
 *
 * Stored in globalThis to persist across Next.js Fast Refresh in development.
 * Aggregates channel subscriptions from multiple useSSE hooks and maintains
 * a single EventSource connection. When channels change, reconnects with
 * the updated subscription list.
 */
declare class SSEManager {
    private eventSource;
    private subscriptions;
    private status;
    private statusListeners;
    private reconnectAttempts;
    private reconnectTimeout;
    private reconnectScheduledAt;
    private reconnectDelay;
    private readonly maxReconnectAttempts;
    private readonly baseReconnectDelay;
    private readonly maxReconnectDelay;
    private currentChannels;
    /**
     * Subscribe to channels with a callback
     *
     * @param channels - Array of channel names to subscribe to
     * @param callback - Function called when a message is received on any subscribed channel
     * @returns Unsubscribe function
     */
    subscribe<T extends Channel>(channels: T[], callback: SSEMessageCallback<T>): () => void;
    /**
     * Add a status change listener
     *
     * @param listener - Function called when connection status changes
     * @returns Unsubscribe function
     */
    onStatusChange(listener: (status: SSEConnectionStatus) => void): () => void;
    /**
     * Get the current connection status
     */
    getStatus(): SSEConnectionStatus;
    /**
     * Get the time remaining until the next reconnect attempt in milliseconds
     * Returns null if no reconnect is scheduled
     */
    getReconnectDelayRemaining(): number | null;
    /**
     * Get all currently subscribed channels
     */
    private getAggregatedChannels;
    /**
     * Update and notify status
     */
    private setStatus;
    /**
     * Reconnect the EventSource with current channel subscriptions
     */
    private reconnect;
    /**
     * Schedule a reconnection attempt with exponential backoff
     */
    private scheduleReconnect;
    /**
     * Force disconnect and cleanup
     */
    disconnect(): void;
    /**
     * Reset all state (for testing purposes)
     * @internal
     */
    _reset(): void;
}
export declare const sseManager: SSEManager;
export {};
//# sourceMappingURL=sse-manager.d.ts.map