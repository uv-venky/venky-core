/* Copyright (c) 2024-present Venky Corp. */

import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { UserError } from '@/lib/core/common/error';
import { getCacheStats, invalidateCache, type CacheStats } from '@/lib/core/server/cache';

export async function getCacheStatsAction(_client: PgPoolClient, session: Session): Promise<CacheStats> {
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access denied');
  }

  return getCacheStats();
}

export async function clearCacheAction(_client: PgPoolClient, session: Session): Promise<void> {
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access denied');
  }

  await invalidateCache();
}
