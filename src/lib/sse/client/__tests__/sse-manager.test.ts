import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Channel, SSEConnectionStatus, SSEMessage } from '../../types';

// Mock EventSource
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
  static instances: MockEventSource[] = [];

  url: string;
  readyState = MockEventSource.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    // Simulate async connection
    queueMicrotask(() => {
      if (this.readyState !== MockEventSource.CLOSED) {
        this.readyState = MockEventSource.OPEN;
        this.onopen?.(new Event('open'));
      }
    });
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // Helper for tests to simulate messages
  simulateMessage(data: SSEMessage<Channel>) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }

  // Helper for tests to simulate errors
  simulateError() {
    this.readyState = MockEventSource.CLOSED;
    this.onerror?.(new Event('error'));
  }

  static reset() {
    MockEventSource.instances = [];
  }
}

// Must be set before importing the module
vi.stubGlobal('EventSource', MockEventSource);

import { sseManager } from '../sse-manager';

describe('SSEManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.reset();
    // Reset the singleton state between tests
    sseManager._reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('subscribe', () => {
    it('should create an EventSource with the correct URL', async () => {
      const callback = vi.fn();

      sseManager.subscribe(['workflow:1', 'workflow:2'], callback);
      await vi.advanceTimersByTimeAsync(0);

      expect(MockEventSource.instances).toHaveLength(1);
      expect(MockEventSource.instances[0].url).toBe('/api/sse/stream?channels=workflow%3A1%2Cworkflow%3A2');
    });

    it('should aggregate channels from multiple subscriptions', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      sseManager.subscribe(['workflow:1'], callback1);
      await vi.advanceTimersByTimeAsync(0);

      // First EventSource
      expect(MockEventSource.instances).toHaveLength(1);
      expect(MockEventSource.instances[0].url).toContain('workflow%3A1');

      sseManager.subscribe(['workflow:2'], callback2);
      await vi.advanceTimersByTimeAsync(0);

      // Should have closed first and created new one with both channels
      expect(MockEventSource.instances).toHaveLength(2);
      expect(MockEventSource.instances[1].url).toContain('workflow%3A1');
      expect(MockEventSource.instances[1].url).toContain('workflow%3A2');
    });

    it('should return an unsubscribe function', () => {
      const callback = vi.fn();

      const unsubscribe = sseManager.subscribe(['workflow:1'], callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();

      // Should disconnect since no more subscriptions
      expect(sseManager.getStatus()).toBe('disconnected');
    });
  });

  describe('message handling', () => {
    it('should dispatch messages to the correct callback', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      sseManager.subscribe(['workflow:1'], callback1);
      await vi.advanceTimersByTimeAsync(0);
      sseManager.subscribe(['workflow:2'], callback2);
      await vi.advanceTimersByTimeAsync(0);

      // Get the latest EventSource
      const eventSource = MockEventSource.instances[MockEventSource.instances.length - 1];

      // Simulate a message for workflow:1
      eventSource.simulateMessage({
        channel: 'workflow:1',
        data: { executionId: 'exec-1', type: 'update', status: 'running' },
        timestamp: Date.now(),
      });

      expect(callback1).toHaveBeenCalledWith('workflow:1', {
        executionId: 'exec-1',
        type: 'update',
        status: 'running',
      });
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should skip system messages', async () => {
      const callback = vi.fn();

      sseManager.subscribe(['workflow:1'], callback);
      await vi.advanceTimersByTimeAsync(0);

      const eventSource = MockEventSource.instances[MockEventSource.instances.length - 1];

      // Simulate a system message
      eventSource.simulateMessage({
        channel: '_system',
        data: { type: 'connected' },
        timestamp: Date.now(),
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('status', () => {
    it('should start as disconnected', () => {
      expect(sseManager.getStatus()).toBe('disconnected');
    });

    it('should transition to connecting when subscribing', async () => {
      const statusCallback = vi.fn();

      sseManager.onStatusChange(statusCallback);
      sseManager.subscribe(['workflow:1'], vi.fn());
      await vi.advanceTimersByTimeAsync(0);

      // Initial callback with current status + connecting
      expect(statusCallback).toHaveBeenCalledWith('connecting');
    });

    it('should transition to connected after EventSource opens', async () => {
      const statusCallback = vi.fn();
      const statuses: SSEConnectionStatus[] = [];

      sseManager.onStatusChange((status) => {
        statuses.push(status);
        statusCallback(status);
      });
      sseManager.subscribe(['workflow:1'], vi.fn());

      // Run microtasks to trigger EventSource onopen
      await vi.runAllTimersAsync();

      expect(statuses).toContain('connected');
    });
  });

  describe('reconnection', () => {
    it('should attempt to reconnect on error', async () => {
      sseManager.subscribe(['workflow:1'], vi.fn());

      await vi.runAllTimersAsync();

      // Initial connection
      expect(MockEventSource.instances).toHaveLength(1);

      // Simulate error
      MockEventSource.instances[0].simulateError();

      // Advance timer for reconnect delay (1000ms base)
      await vi.advanceTimersByTimeAsync(1100);

      // Should have created a new EventSource
      expect(MockEventSource.instances).toHaveLength(2);
    });
  });

  describe('disconnect', () => {
    it('should close the EventSource and reset state', async () => {
      sseManager.subscribe(['workflow:1'], vi.fn());

      await vi.runAllTimersAsync();
      expect(sseManager.getStatus()).toBe('connected');

      sseManager.disconnect();

      expect(sseManager.getStatus()).toBe('disconnected');
      expect(MockEventSource.instances[0].readyState).toBe(MockEventSource.CLOSED);
    });
  });
});
