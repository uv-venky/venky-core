/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UserError } from '@/lib/core/common/error';
import type { PgPoolClient } from '@/lib/core/server/db';
import type { JobEntry } from '../registry';

const mockBroadcast = vi.fn();
const mockGetAllJobs = vi.fn();
const mockGetConfig = vi.fn();
const mockWithBlockingAdvisoryLock = vi.fn();

vi.mock('../registry', () => ({
  getAllJobs: (...args: unknown[]) => mockGetAllJobs(...args),
}));

vi.mock('@/lib/core/server/config', () => ({
  getConfig: (...args: unknown[]) => mockGetConfig(...args),
}));

vi.mock('@/lib/sse/server/registry', () => ({
  sseRegistry: {
    broadcast: (...args: unknown[]) => mockBroadcast(...args),
  },
}));

vi.mock('@/lib/core/server/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/core/server/db')>();
  return {
    ...actual,
    withBlockingAdvisoryLock: (...args: unknown[]) => mockWithBlockingAdvisoryLock(...args),
  };
});

import { hashJobName } from '@/lib/core/server/db';
import { computeNextRun, runJobByName } from '../scheduler';

function makeClient(jobRunId = 42): PgPoolClient {
  const query = vi.fn().mockImplementation(async (sql: string) => {
    if (sql.includes('INSERT INTO')) {
      return { rows: [{ job_run_id: jobRunId }] };
    }
    return { rows: [] };
  });
  return { query } as unknown as PgPoolClient;
}

describe('computeNextRun', () => {
  it('calculates the next 10 minute interval', () => {
    const now = new Date('2024-01-01T00:05:00Z');
    const next = computeNextRun('0 */10 * * * *', now);
    expect(next.getUTCMinutes()).toBe(10);
  });
});

describe('runJobByName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConfig.mockReturnValue({ appId: 'core' });
    mockWithBlockingAdvisoryLock.mockImplementation(async (_key, callback) => {
      return callback(makeClient());
    });
  });

  it('throws UserError when job is not found', async () => {
    mockGetAllJobs.mockResolvedValue([]);

    await expect(runJobByName('missing')).rejects.toThrow(UserError);
    expect(mockWithBlockingAdvisoryLock).not.toHaveBeenCalled();
  });

  it('runs job handler and returns success', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    mockGetAllJobs.mockResolvedValue([{ name: 'sendEmails', schedule: '1 * * * * *', handler } satisfies JobEntry]);

    const result = await runJobByName('sendEmails', { triggeredBy: 'test:manual' });

    expect(result).toEqual({ success: true, jobRunId: 42, error: null });
    expect(handler).toHaveBeenCalledOnce();
    expect(mockWithBlockingAdvisoryLock).toHaveBeenCalledWith(hashJobName('sendEmails'), expect.any(Function));
    expect(mockBroadcast).toHaveBeenCalledTimes(2);
  });

  it('returns failure when handler throws', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('boom'));
    mockGetAllJobs.mockResolvedValue([{ name: 'sendEmails', schedule: '1 * * * * *', handler } satisfies JobEntry]);

    const result = await runJobByName('sendEmails');

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
    expect(result.jobRunId).toBe(42);
  });
});
