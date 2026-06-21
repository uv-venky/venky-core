import crypto from 'node:crypto';
import { getCacheProvider } from './CacheProviderFactory';
import logger from '../../../../lib/core/server/logger';
import stringify from 'safe-stable-stringify';
export function generateCacheKey(sql, params, options) {
    if (options?.cacheKey) {
        return options.cacheKey;
    }
    // Normalize SQL by removing extra whitespace and comments
    const normalizedSql = options?.sqlKey ?? sql;
    // Create hash from SQL + params
    const content = stringify({
        sql: normalizedSql,
        params,
    });
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return `db_query:${hash}`;
}
export function shouldCacheQuery(sql, options) {
    if (options?.skipCache) {
        return false;
    }
    // Only cache SELECT queries
    const normalizedSql = sql.trim().toLowerCase();
    return normalizedSql.startsWith('select');
}
export function getCacheTtl(options) {
    return options?.ttlSeconds ?? 21600; // 6 hours default
}
/**
 * Cache invalidation utilities
 */
export async function invalidateCache(pattern) {
    const cache = getCacheProvider();
    if (pattern) {
        // For pattern-based invalidation, we'd need to implement key scanning
        // This is a simplified version - Redis would be better for this
        logger.warn('Pattern-based cache invalidation not fully implemented for in-memory cache');
    }
    else {
        await cache.clear();
        logger.info('Cache cleared');
        if (process.env.AUTO_LOGIN_USER) {
            const { cacheAutoLoginSession } = await import('../../../../auth');
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
//# sourceMappingURL=cacheUtils.js.map