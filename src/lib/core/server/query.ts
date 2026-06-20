import type { PoolClient, QueryConfigValues, QueryResult, QueryResultRow } from 'pg';
import {
  generateCacheKey,
  getCacheProvider,
  getCacheTtl,
  type CachedQueryResult,
  type QueryCacheOptions,
} from './cache';

export async function query<R extends QueryResultRow = any, I = any[]>(
  client: PoolClient,
  sql: string,
  params?: QueryConfigValues<I>,
): Promise<QueryResult<R>> {
  return client.query(sql, params);
}

export async function queryCached<R extends QueryResultRow = any, I = any[]>(
  client: PoolClient,
  sql: string,
  params?: QueryConfigValues<I>,
  options?: QueryCacheOptions,
): Promise<CachedQueryResult<R>> {
  const cache = getCacheProvider();
  const paramsArray = params || [];

  const cacheKey = generateCacheKey(sql, paramsArray, options);
  const ttl = getCacheTtl(options);

  // Try to get from cache first
  const cachedResult = await cache.get<QueryResult<R>>(cacheKey);

  if (cachedResult) {
    // logger.warn('Cache hit', { cacheKey, sql: sql.substring(0, 100) });
    return { ...cachedResult, fromCache: true, cacheKey };
  }

  // Cache miss - execute query
  // logger.debug('Cache miss', { cacheKey, sql: sql.substring(0, 100) });
  const result = await query<R>(client, sql, paramsArray);

  // Store in cache
  await cache.set(cacheKey, result, { ttlSeconds: ttl, autoRefreshTTL: false });

  return { ...result, fromCache: false, cacheKey };
}
