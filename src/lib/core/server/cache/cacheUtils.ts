import crypto from 'node:crypto';
import type { QueryCacheOptions } from './types';
import { getCacheProvider } from './CacheProviderFactory';
import logger from '@/lib/core/server/logger';
import stringify from 'safe-stable-stringify';

export function generateCacheKey(sql: string, params: unknown[], options?: QueryCacheOptions): string {
  if (options?.cacheKey) {
    return options.cacheKey;
  }

  // Normalize SQL by removing extra whitespace and comments
  const normalizedSql = options?.sqlKey ?? sql;

  // Create hash from SQL + params
  const content = stringify({
    sql: normalizedSql,
    params,
  }) as string;

  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return `db_query:${hash}`;
}

export function shouldCacheQuery(sql: string, options?: QueryCacheOptions): boolean {
  if (options?.skipCache) {
    return false;
  }

  // Only cache SELECT queries
  const normalizedSql = sql.trim().toLowerCase();
  return normalizedSql.startsWith('select');
}

export function getCacheTtl(options?: QueryCacheOptions): number {
  return options?.ttlSeconds ?? 21600; // 6 hours default
}

/**
 * Cache invalidation utilities
 */
export async function invalidateCache(pattern?: string): Promise<void> {
  const cache = getCacheProvider();

  if (pattern) {
    // For pattern-based invalidation, we'd need to implement key scanning
    // This is a simplified version - Redis would be better for this
    logger.warn('Pattern-based cache invalidation not fully implemented for in-memory cache');
  } else {
    await cache.clear();
    logger.info('Cache cleared');
    if (process.env.AUTO_LOGIN_USER) {
      const { cacheAutoLoginSession } = await import('@/auth');
      await cacheAutoLoginSession();
    }
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  const cache = getCacheProvider();
  return await cache.getStats();
}
