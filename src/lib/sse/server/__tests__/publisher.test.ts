import { describe, expect, it, vi } from 'vitest';
import { publishSSE } from '../publisher';
import type { PgPoolClient } from '@/lib/core/server/db';

describe('publishSSE', () => {
  it('should send a pg_notify with the correct format', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockClient = {
      query: mockQuery,
    } as unknown as PgPoolClient;

    await publishSSE(mockClient, 'workflow:abc123', {
      type: 'new_execution',
      executionId: 'exec-123',
      status: 'running',
    });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(`SELECT pg_notify('VENKY_events', $1)`, expect.any(Array));

    // Parse the payload
    const payload = JSON.parse(mockQuery.mock.calls[0][1][0]);
    expect(payload[0]).toBe('sse');
    expect(payload[1].channel).toBe('workflow:abc123');
    expect(payload[1].data).toEqual({ type: 'new_execution', executionId: 'exec-123', status: 'running' });
    expect(payload[1].timestamp).toBeDefined();
  });

  it('should handle complex data payloads', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockClient = {
      query: mockQuery,
    } as unknown as PgPoolClient;

    const complexData: { type: 'update'; status: 'started' | 'running' | 'success' | 'error' | 'paused' } = {
      type: 'update',
      status: 'running',
    };

    await publishSSE(mockClient, 'execution:exec-123', complexData);

    const payload = JSON.parse(mockQuery.mock.calls[0][1][0]);
    expect(payload[1].data).toEqual(complexData);
  });

  it('should work with different channel types', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockClient = {
      query: mockQuery,
    } as unknown as PgPoolClient;

    // Test various channel patterns
    await publishSSE(mockClient, 'notification:user-1', { title: 'Hello', body: 'World' });
    await publishSSE(mockClient, 'data:users', { action: 'update', id: '123' });

    expect(mockQuery).toHaveBeenCalledTimes(2);

    const payload1 = JSON.parse(mockQuery.mock.calls[0][1][0]);
    expect(payload1[1].channel).toBe('notification:user-1');

    const payload2 = JSON.parse(mockQuery.mock.calls[1][1][0]);
    expect(payload2[1].channel).toBe('data:users');
  });
});
