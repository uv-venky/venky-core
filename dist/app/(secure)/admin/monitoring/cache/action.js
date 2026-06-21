/* Copyright (c) 2024-present Venky Corp. */
import { UserError } from '../../../../../lib/core/common/error';
import { getCacheStats, invalidateCache } from '../../../../../lib/core/server/cache';
export async function getCacheStatsAction(_client, session) {
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access denied');
  }
  return getCacheStats();
}
export async function clearCacheAction(_client, session) {
  if (!session.user.roles.includes('admin')) {
    throw new UserError('Access denied');
  }
  await invalidateCache();
}
//# sourceMappingURL=action.js.map
