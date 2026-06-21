import { generateCacheKey, getCacheProvider, getCacheTtl } from './cache';
export async function query(client, sql, params) {
  return client.query(sql, params);
}
export async function queryCached(client, sql, params, options) {
  const cache = getCacheProvider();
  const paramsArray = params || [];
  const cacheKey = generateCacheKey(sql, paramsArray, options);
  const ttl = getCacheTtl(options);
  // Try to get from cache first
  const cachedResult = await cache.get(cacheKey);
  if (cachedResult) {
    // logger.warn('Cache hit', { cacheKey, sql: sql.substring(0, 100) });
    return { ...cachedResult, fromCache: true, cacheKey };
  }
  // Cache miss - execute query
  // logger.debug('Cache miss', { cacheKey, sql: sql.substring(0, 100) });
  const result = await query(client, sql, paramsArray);
  // Store in cache
  await cache.set(cacheKey, result, { ttlSeconds: ttl, autoRefreshTTL: false });
  return { ...result, fromCache: false, cacheKey };
}
//# sourceMappingURL=query.js.map
