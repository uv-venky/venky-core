import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import logger from '@/lib/core/server/logger';
import { sseRegistry } from '../registry';

describe('SSERegistry', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset the singleton state between tests
    sseRegistry._reset();
    // Mock logger.error to suppress expected error logs during tests
    errorSpy = vi.spyOn(logger as any, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('subscribe', () => {
    it('should register a client for channels', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      const client = sseRegistry.subscribe(['channel:1', 'channel:2'], mockController, 'user-123');

      expect(client.userName).toBe('user-123');
      expect(client.channels.has('channel:1')).toBe(true);
      expect(client.channels.has('channel:2')).toBe(true);
      expect(sseRegistry.getClientCount()).toBe(1);
      expect(sseRegistry.getChannelClientCount('channel:1')).toBe(1);
      expect(sseRegistry.getChannelClientCount('channel:2')).toBe(1);
    });

    it('should register multiple clients for the same channel', () => {
      const mockController1 = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;
      const mockController2 = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      sseRegistry.subscribe(['channel:1'], mockController1, 'user-1');
      sseRegistry.subscribe(['channel:1'], mockController2, 'user-2');

      expect(sseRegistry.getClientCount()).toBe(2);
      expect(sseRegistry.getChannelClientCount('channel:1')).toBe(2);
    });
  });

  describe('unsubscribe', () => {
    it('should remove a client from all channels', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      sseRegistry.subscribe(['channel:1', 'channel:2'], mockController, 'user-123');
      expect(sseRegistry.getClientCount()).toBe(1);

      sseRegistry.unsubscribe(mockController);

      expect(sseRegistry.getClientCount()).toBe(0);
      expect(sseRegistry.getChannelClientCount('channel:1')).toBe(0);
      expect(sseRegistry.getChannelClientCount('channel:2')).toBe(0);
    });

    it('should handle unsubscribing a non-existent client', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      // Should not throw
      expect(() => sseRegistry.unsubscribe(mockController)).not.toThrow();
    });
  });

  describe('broadcast', () => {
    it('should send message to all clients subscribed to a channel', () => {
      const enqueue1 = vi.fn();
      const enqueue2 = vi.fn();
      const mockController1 = {
        enqueue: enqueue1,
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;
      const mockController2 = {
        enqueue: enqueue2,
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      sseRegistry.subscribe(['channel:1'], mockController1, 'user-1');
      sseRegistry.subscribe(['channel:1'], mockController2, 'user-2');

      sseRegistry.broadcast('channel:1', { message: 'hello' });

      expect(enqueue1).toHaveBeenCalledTimes(1);
      expect(enqueue2).toHaveBeenCalledTimes(1);

      // Verify the message format
      const sentData = enqueue1.mock.calls[0][0];
      const decoder = new TextDecoder();
      const decoded = decoder.decode(sentData);
      expect(decoded).toContain('data: ');
      expect(decoded).toContain('"channel":"channel:1"');
      expect(decoded).toContain('"message":"hello"');
    });

    it('should only send to clients subscribed to the specific channel', () => {
      const enqueue1 = vi.fn();
      const enqueue2 = vi.fn();
      const mockController1 = {
        enqueue: enqueue1,
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;
      const mockController2 = {
        enqueue: enqueue2,
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      sseRegistry.subscribe(['channel:1'], mockController1, 'user-1');
      sseRegistry.subscribe(['channel:2'], mockController2, 'user-2');

      sseRegistry.broadcast('channel:1', { message: 'hello' });

      expect(enqueue1).toHaveBeenCalledTimes(1);
      expect(enqueue2).not.toHaveBeenCalled();
    });

    it('should handle errors when sending to a client', () => {
      const mockController = {
        enqueue: vi.fn().mockImplementation(() => {
          throw new Error('Connection closed');
        }),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      sseRegistry.subscribe(['channel:1'], mockController, 'user-1');
      expect(sseRegistry.getClientCount()).toBe(1);

      // Should not throw and should remove the failed client
      sseRegistry.broadcast('channel:1', { message: 'hello' });

      expect(sseRegistry.getClientCount()).toBe(0);
    });

    it('should do nothing when broadcasting to a channel with no subscribers', () => {
      // Should not throw
      expect(() => sseRegistry.broadcast('nonexistent', { message: 'hello' })).not.toThrow();
    });
  });

  describe('getActiveChannels', () => {
    it('should return all channels with active subscriptions', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController<Uint8Array>;

      sseRegistry.subscribe(['channel:1', 'channel:2', 'channel:3'], mockController, 'user-1');

      const channels = sseRegistry.getActiveChannels();
      expect(channels).toHaveLength(3);
      expect(channels).toContain('channel:1');
      expect(channels).toContain('channel:2');
      expect(channels).toContain('channel:3');
    });
  });
});
