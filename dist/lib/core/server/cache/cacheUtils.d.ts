import type { QueryCacheOptions } from './types';
export declare function generateCacheKey(sql: string, params: unknown[], options?: QueryCacheOptions): string;
export declare function shouldCacheQuery(sql: string, options?: QueryCacheOptions): boolean;
export declare function getCacheTtl(options?: QueryCacheOptions): number;
/**
 * Cache invalidation utilities
 */
export declare function invalidateCache(pattern?: string): Promise<void>;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): Promise<import('./types').CacheStats>;
//# sourceMappingURL=cacheUtils.d.ts.map
