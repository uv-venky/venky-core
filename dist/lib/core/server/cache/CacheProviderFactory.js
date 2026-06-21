import { InMemoryCacheProvider } from './InMemoryCacheProvider';
import logger from '../../../../lib/core/server/logger';
export function getCacheProvider() {
    if (!globalThis._$cacheProvider) {
        const config = {
            defaultTtlSeconds: Number.parseInt(process.env.DB_CACHE_TTL_SECONDS || '21600', 10), // 6 hours default
            maxEntries: Number.parseInt(process.env.DB_CACHE_MAX_ENTRIES || '200', 10),
            enabled: process.env.DB_CACHE_ENABLED !== 'false',
            keyPrefix: process.env.DB_CACHE_KEY_PREFIX || 'db_query',
        };
        globalThis._$cacheProvider = new InMemoryCacheProvider(config);
        logger.info('Using in-memory cache provider', { config });
    }
    return globalThis._$cacheProvider;
}
//# sourceMappingURL=CacheProviderFactory.js.map