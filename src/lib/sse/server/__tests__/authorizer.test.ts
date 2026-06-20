import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/auth';
import logger from '@/lib/core/server/logger';
import { authorizeSSEChannel, authorizeSSEChannels, registerChannelAuthorizer } from '../authorizer';

const { mockQuery, mockGetDataSource, mockHasAccess } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockGetDataSource: vi.fn(),
  mockHasAccess: vi.fn(),
}));

vi.mock('@/lib/core/server/db', () => ({
  newReadOnlyClient: vi.fn(async () => ({
    query: mockQuery,
    release: vi.fn(),
  })),
}));

vi.mock('@/lib/server/ds/defs/ds', () => ({
  getDataSource: (...args: unknown[]) => mockGetDataSource(...args),
}));

vi.mock('@/lib/core/server/ds/hasAccess', () => ({
  hasAccess: (...args: unknown[]) => mockHasAccess(...args),
}));

function sessionWithRoles(roles: string[], userName = 'test@venky.local'): Session {
  return {
    id: 'test-session',
    expires: new Date().toISOString(),
    user: {
      userName,
      email: userName,
      roles,
      settings: { theme: 'system' },
    },
  };
}

describe('authorizeSSEChannel', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockQuery.mockReset();
    mockGetDataSource.mockReset();
    mockHasAccess.mockReset();
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('denies when session has no userName', async () => {
    const session: Session = {
      id: 'x',
      expires: new Date().toISOString(),
      user: {
        userName: '',
        email: null,
        roles: ['admin'],
        settings: { theme: 'system' },
      },
    };
    expect(await authorizeSSEChannel('_system', session)).toBe(false);
  });

  describe('_system', () => {
    it('allows any authenticated user', async () => {
      expect(await authorizeSSEChannel('_system', sessionWithRoles(['user']))).toBe(true);
    });
  });

  describe('notification:', () => {
    it('allows when the suffix matches session userName exactly', async () => {
      const session = sessionWithRoles(['user'], 'alice@venky.local');
      expect(await authorizeSSEChannel('notification:alice@venky.local', session)).toBe(true);
    });

    it('denies when the suffix does not match', async () => {
      const session = sessionWithRoles(['user'], 'alice@venky.local');
      expect(await authorizeSSEChannel('notification:other@venky.local', session)).toBe(false);
    });
  });

  describe('job:status', () => {
    it('allows users with the admin role', async () => {
      expect(await authorizeSSEChannel('job:status', sessionWithRoles(['admin']))).toBe(true);
    });

    it('denies users without the admin role', async () => {
      expect(await authorizeSSEChannel('job:status', sessionWithRoles(['user']))).toBe(false);
    });
  });

  describe('unknown channel shape', () => {
    it('denies channels that do not match a known pattern', async () => {
      expect(await authorizeSSEChannel('totally:unknown:shape', sessionWithRoles(['user']))).toBe(false);
    });
  });

  describe('workflow:', () => {
    it('denies when the id segment is empty', async () => {
      expect(await authorizeSSEChannel('workflow:', sessionWithRoles(['user']))).toBe(false);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('allows when the workflow is owned by the session user', async () => {
      const session = sessionWithRoles(['user'], 'owner@venky.local');
      mockQuery.mockResolvedValue({ rows: [{ id: 'wf-99' }] });
      const ok = await authorizeSSEChannel('workflow:wf-99', session);
      expect(ok).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toEqual(['wf-99', 'owner@venky.local']);
    });

    it('denies when the workflow is not found for the user', async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const ok = await authorizeSSEChannel('workflow:missing-id', sessionWithRoles(['user']));
      expect(ok).toBe(false);
    });
  });

  describe('execution:', () => {
    it('denies when the id segment is empty', async () => {
      expect(await authorizeSSEChannel('execution:', sessionWithRoles(['user']))).toBe(false);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('allows when the execution belongs to a workflow owned by the session user', async () => {
      const session = sessionWithRoles(['user'], 'owner@venky.local');
      mockQuery.mockResolvedValue({ rows: [{ id: 'ex-1' }] });
      const ok = await authorizeSSEChannel('execution:ex-1', session);
      expect(ok).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][1]).toEqual(['ex-1', 'owner@venky.local']);
    });

    it('denies when the execution is not found for the user', async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const ok = await authorizeSSEChannel('execution:missing-id', sessionWithRoles(['user']));
      expect(ok).toBe(false);
    });
  });

  describe('data:', () => {
    it('denies when the datasource id segment is empty', async () => {
      expect(await authorizeSSEChannel('data:', sessionWithRoles(['user']))).toBe(false);
      expect(mockGetDataSource).not.toHaveBeenCalled();
    });

    it('denies when the datasource is not registered', async () => {
      mockGetDataSource.mockReturnValue(undefined);
      const ok = await authorizeSSEChannel('data:users', sessionWithRoles(['user']));
      expect(ok).toBe(false);
      expect(mockGetDataSource).toHaveBeenCalledWith('users');
    });

    it('allows when getDataSource returns a def and hasAccess allows Query', async () => {
      const ds = { name: 'users' } as any;
      mockGetDataSource.mockReturnValue(ds);
      mockHasAccess.mockReturnValue(true);
      const session = sessionWithRoles(['user']);
      const ok = await authorizeSSEChannel('data:users', session);
      expect(ok).toBe(true);
      expect(mockHasAccess).toHaveBeenCalledWith(ds, session, 'Query');
    });

    it('denies when hasAccess returns false', async () => {
      mockGetDataSource.mockReturnValue({} as any);
      mockHasAccess.mockReturnValue(false);
      expect(await authorizeSSEChannel('data:users', sessionWithRoles(['user']))).toBe(false);
    });

    it('denies when getDataSource throws', async () => {
      mockGetDataSource.mockImplementation(() => {
        throw new Error('boom');
      });
      expect(await authorizeSSEChannel('data:bad', sessionWithRoles(['user']))).toBe(false);
    });
  });

  describe('comment: and custom:', () => {
    it('denies when no authorizer is registered for the channel', async () => {
      const ok = await authorizeSSEChannel('custom:not-registered-xyz:1', sessionWithRoles(['user']));
      expect(ok).toBe(false);
    });

    it('denies comment: channels with no authorizer', async () => {
      const ok = await authorizeSSEChannel('comment:thread-1:msg-2', sessionWithRoles(['user']));
      expect(ok).toBe(false);
    });

    it('allows when a registered authorizer returns true', async () => {
      const prefix = 'custom:authz-ok-';
      registerChannelAuthorizer(prefix, (channel, session) => {
        return channel === 'custom:authz-ok-123' && session.user.userName === 'test@venky.local';
      });
      const ok = await authorizeSSEChannel('custom:authz-ok-123', sessionWithRoles(['user']));
      expect(ok).toBe(true);
    });

    it('denies when a registered authorizer returns false', async () => {
      const prefix = 'custom:authz-false-';
      registerChannelAuthorizer(prefix, () => false);
      const ok = await authorizeSSEChannel('custom:authz-false-any', sessionWithRoles(['user']));
      expect(ok).toBe(false);
    });

    it('denies when a registered authorizer throws', async () => {
      const prefix = 'custom:authz-throw-';
      registerChannelAuthorizer(prefix, () => {
        throw new Error('authorizer error');
      });
      const ok = await authorizeSSEChannel('custom:authz-throw-1', sessionWithRoles(['user']));
      expect(ok).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});

describe('authorizeSSEChannels', () => {
  it('splits allowed and denied channels in parallel', async () => {
    const session = sessionWithRoles(['user'], 'a@b.c');
    const { allowed, denied } = await authorizeSSEChannels(
      ['_system', 'notification:other@b.c', 'notification:a@b.c'],
      session,
    );
    expect(allowed.sort()).toEqual(['_system', 'notification:a@b.c'].sort());
    expect(denied).toEqual(['notification:other@b.c']);
  });
});
