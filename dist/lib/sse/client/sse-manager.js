/* Copyright (c) 2024-present Venky Corp. */
/**
 * SSE Manager - Singleton that manages a shared EventSource connection
 *
 * Stored in globalThis to persist across Next.js Fast Refresh in development.
 * Aggregates channel subscriptions from multiple useSSE hooks and maintains
 * a single EventSource connection. When channels change, reconnects with
 * the updated subscription list.
 */
class SSEManager {
  eventSource = null;
  subscriptions = new Map();
  status = 'disconnected';
  statusListeners = new Set();
  reconnectAttempts = 0;
  reconnectTimeout = null;
  reconnectScheduledAt = null;
  reconnectDelay = null;
  maxReconnectAttempts = 10;
  baseReconnectDelay = 1000;
  maxReconnectDelay = 30000;
  currentChannels = new Set();
  /**
   * Subscribe to channels with a callback
   *
   * @param channels - Array of channel names to subscribe to
   * @param callback - Function called when a message is received on any subscribed channel
   * @returns Unsubscribe function
   */
  subscribe(channels, callback) {
    const id = Symbol('subscription');
    this.subscriptions.set(id, {
      channels: new Set(channels),
      callback: (channel, data) => {
        // Type-safe callback: only call if channel matches subscribed channels
        if (channels.includes(channel)) {
          callback(channel, data);
        }
      },
    });
    // Defer reconnect to avoid setState-during-render when subscribe is called
    // during component render (e.g. useStore with autoRefresh creating store)
    queueMicrotask(() => this.reconnect());
    return () => {
      this.subscriptions.delete(id);
      // Reconnect to update channels (or disconnect if no more subscriptions)
      this.reconnect();
    };
  }
  /**
   * Add a status change listener
   *
   * @param listener - Function called when connection status changes
   * @returns Unsubscribe function
   */
  onStatusChange(listener) {
    this.statusListeners.add(listener);
    // Immediately notify of current status
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }
  /**
   * Get the current connection status
   */
  getStatus() {
    return this.status;
  }
  /**
   * Get the time remaining until the next reconnect attempt in milliseconds
   * Returns null if no reconnect is scheduled
   */
  getReconnectDelayRemaining() {
    if (!this.reconnectScheduledAt || !this.reconnectDelay) {
      return null;
    }
    const remaining = this.reconnectScheduledAt + this.reconnectDelay - Date.now();
    return Math.max(0, remaining);
  }
  /**
   * Get all currently subscribed channels
   */
  getAggregatedChannels() {
    const allChannels = new Set();
    for (const sub of this.subscriptions.values()) {
      for (const channel of sub.channels) {
        allChannels.add(channel);
      }
    }
    return Array.from(allChannels);
  }
  /**
   * Update and notify status
   */
  setStatus(status) {
    if (this.status !== status) {
      this.status = status;
      for (const listener of this.statusListeners) {
        try {
          listener(status);
        } catch {
          // Ignore errors in listeners
        }
      }
    }
  }
  /**
   * Reconnect the EventSource with current channel subscriptions
   */
  reconnect(force = false) {
    const channels = this.getAggregatedChannels();
    const newChannelsSet = new Set(channels);
    // Check if channels have actually changed, or if we need to force reconnect
    // Force reconnect is needed when EventSource is in a bad state (e.g., CLOSED after error)
    const eventSourceClosed = this.eventSource && this.eventSource.readyState === EventSource.CLOSED;
    if (
      !force &&
      !eventSourceClosed &&
      this.eventSource &&
      this.currentChannels.size === newChannelsSet.size &&
      channels.every((ch) => this.currentChannels.has(ch))
    ) {
      // Channels haven't changed and EventSource is healthy, no need to reconnect
      return;
    }
    // Update current channels
    this.currentChannels = newChannelsSet;
    // Clear any pending reconnect
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      this.reconnectScheduledAt = null;
      this.reconnectDelay = null;
    }
    // Close existing connection
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    // If no channels to subscribe to, stay disconnected
    if (channels.length === 0) {
      this.setStatus('disconnected');
      this.reconnectAttempts = 0;
      this.reconnectScheduledAt = null;
      this.reconnectDelay = null;
      this.currentChannels.clear();
      return;
    }
    // Determine if this is an initial connection or a reconnect
    const isInitialConnection = !this.eventSource && this.status === 'disconnected';
    this.setStatus(isInitialConnection ? 'connecting' : 'reconnecting');
    try {
      const url = `/api/sse/stream?channels=${encodeURIComponent(channels.join(','))}`;
      this.eventSource = new EventSource(url);
      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectScheduledAt = null;
        this.reconnectDelay = null;
        this.setStatus('connected');
      };
      this.eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Handle system messages - dispatch to subscribers who are listening to _system channel
          if (message.channel === '_system') {
            for (const sub of this.subscriptions.values()) {
              if (sub.channels.has('_system')) {
                try {
                  sub.callback('_system', message.data);
                } catch {
                  // Ignore errors in callbacks
                }
              }
            }
            return;
          }
          // Dispatch to all subscribers interested in this channel
          for (const sub of this.subscriptions.values()) {
            if (sub.channels.has(message.channel)) {
              try {
                sub.callback(message.channel, message.data);
              } catch {
                // Ignore errors in callbacks
              }
            }
          }
        } catch {
          // Ignore malformed messages
        }
      };
      this.eventSource.onerror = (x) => {
        console.info('Connection error', this.eventSource?.readyState, x);
        // EventSource.readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
        // EventSource automatically reconnects on error, so we should let it handle reconnection
        // When readyState is CONNECTING (0), EventSource is already trying to reconnect automatically
        // When readyState is CLOSED (2), EventSource has given up, so we schedule our own reconnect
        if (this.eventSource) {
          if (this.eventSource.readyState === EventSource.CLOSED) {
            // EventSource has given up on automatic reconnection, schedule our own
            this.setStatus('error');
            this.scheduleReconnect();
          } else {
            // EventSource is still trying to reconnect automatically (CONNECTING or OPEN)
            // Just update status to reflect the error, but let EventSource handle reconnection
            this.setStatus('connecting');
          }
        }
      };
    } catch {
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }
  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.info('Max reconnect attempts reached, disconnecting');
      this.setStatus('disconnected');
      this.reconnectScheduledAt = null;
      this.reconnectDelay = null;
      return;
    }
    const delay = Math.min(this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    console.info(`Scheduling a new reconnect attempt in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    this.reconnectAttempts++;
    this.reconnectDelay = delay;
    this.reconnectScheduledAt = Date.now();
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect(true); // Force reconnect after error
      this.reconnectScheduledAt = null;
      this.reconnectDelay = null;
    }, delay);
  }
  /**
   * Force disconnect and cleanup
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.setStatus('disconnected');
    this.reconnectAttempts = 0;
    this.reconnectScheduledAt = null;
    this.reconnectDelay = null;
    this.currentChannels.clear();
  }
  /**
   * Reset all state (for testing purposes)
   * @internal
   */
  _reset() {
    this.disconnect();
    this.subscriptions.clear();
    this.statusListeners.clear();
    this.currentChannels.clear();
  }
}
/**
 * Get or create the singleton SSE Manager instance
 * Uses globalThis to persist across Next.js Fast Refresh in development
 */
function getSSEManager() {
  if (!globalThis.__sseManager) {
    globalThis.__sseManager = new SSEManager();
  }
  return globalThis.__sseManager;
}
export const sseManager = getSSEManager();
//# sourceMappingURL=sse-manager.js.map
