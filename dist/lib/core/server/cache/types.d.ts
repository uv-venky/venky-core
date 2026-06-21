import type { QueryResult } from 'pg';
export interface CacheConfig {
  /** Default TTL in seconds */
  defaultTtlSeconds: number;
  /** Maximum number of entries in memory cache */
  maxEntries: number;
  /** Enable/disable caching */
  enabled: boolean;
  /** Cache key prefix */
  keyPrefix: string;
}
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  hits: number;
  options: {
    ttlMs: number;
    autoRefreshTTL: boolean;
  };
}
export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
}
export interface CacheSetOptions {
  ttlSeconds?: number;
  autoRefreshTTL?: boolean;
}
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
}
export interface QueryCacheOptions {
  /** TTL in seconds for this specific query */
  ttlSeconds?: number;
  /** Skip cache for this query */
  skipCache?: boolean;
  /** Custom cache key (if not provided, will be generated from SQL + params) */
  cacheKey?: string;
  /** Custom SQL key (if not provided, will be generated from SQL) */
  sqlKey?: string;
}
export interface CachedQueryResult<T extends Record<string, any> = any> extends QueryResult<T> {
  fromCache?: boolean;
  cacheKey?: string;
}
//# sourceMappingURL=types.d.ts.map
