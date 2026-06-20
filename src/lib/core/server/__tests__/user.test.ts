import { describe, it, expect, vi } from 'vitest';
import { assignRolesToUser, endDateRolesToUser, createUser } from '@/lib/core/server/user';

vi.mock('@/auth', () => ({ hashPassword: vi.fn(async () => 'hash') }));

describe('user helpers', () => {
  it('endDateRolesToUser returns early with no roles', async () => {
    const client = { query: vi.fn() } as any;
    await endDateRolesToUser(client, {
      updatedBy: 'u',
      roles: [],
      userName: 'x',
    });
    expect(client.query).not.toHaveBeenCalled();
  });

  it('assignRolesToUser is idempotent', async () => {
    const client = { query: vi.fn().mockResolvedValue({}) } as any;
    await assignRolesToUser(client, {
      createdBy: 'u',
      roles: ['r1'],
      userName: 'x',
    });
    expect(client.query).toHaveBeenCalled();
    expect((client.query as any).mock.calls[0][0]).toContain('ON CONFLICT');
  });

  it('createUser returns inserted user name', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({ rows: [{ user_name: 'x' }] }),
    } as any;
    const user = await createUser(client, 'admin', {
      userName: 'x',
      userId: 1,
      email: 'e',
      displayName: 'd',
      locationName: 'loc',
      password: 'test',
      startDate: new Date().toISOString(),
      locked: false,
      settings: { theme: 'light' as const },
    });
    expect(user).toBe('x');
  });
});
