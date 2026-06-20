import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryCacheProvider } from '@/lib/core/server/cache/InMemoryCacheProvider';
import { generateCacheKey, shouldCacheQuery, getCacheTtl } from '@/lib/core/server/cache/cacheUtils';
import type { CacheConfig } from '@/lib/core/server/cache/types';

describe('Database Cache Implementation', () => {
  let cacheProvider: InMemoryCacheProvider;
  let config: CacheConfig;

  beforeEach(() => {
    config = {
      defaultTtlSeconds: 3600, // 1 hour
      maxEntries: 100,
      enabled: true,
      keyPrefix: 'test',
    };
    cacheProvider = new InMemoryCacheProvider(config);
  });

  describe('InMemoryCacheProvider', () => {
    it('should store and retrieve cached data', async () => {
      const key = 'test-key';
      const data = { rows: [{ id: 1, name: 'test' }] };

      await cacheProvider.set(key, data);
      const result = await cacheProvider.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheProvider.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle TTL expiration', async () => {
      const key = 'test-key';
      const data = { rows: [{ id: 1, name: 'test' }] };

      // Set with 1 second TTL
      await cacheProvider.set(key, data, {
        ttlSeconds: 1,
        autoRefreshTTL: false,
      });

      // Should be available immediately
      let result = await cacheProvider.get(key);
      expect(result).toEqual(data);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be expired now
      result = await cacheProvider.get(key);
      expect(result).toBeNull();
    });

    it('should enforce max entries limit', async () => {
      // Fill cache beyond max entries
      for (let i = 0; i < config.maxEntries + 10; i++) {
        await cacheProvider.set(`key-${i}`, { data: i });
      }

      const stats = await cacheProvider.getStats();
      expect(stats.entries).toBeLessThanOrEqual(config.maxEntries);
    });

    it('should track cache statistics', async () => {
      await cacheProvider.set('key1', { data: 1 });
      await cacheProvider.set('key2', { data: 2 });

      // Hit
      await cacheProvider.get('key1');

      // Miss
      await cacheProvider.get('key3');

      const stats = await cacheProvider.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.entries).toBe(2);
    });
  });

  describe('Cache Utils', () => {
    it('should generate consistent cache keys', () => {
      const sql1 = 'SELECT * FROM users WHERE id = $1';
      const params1 = [1];

      const sql2 = 'SELECT * FROM users WHERE id = $1';
      const params2 = [1];

      const key1 = generateCacheKey(sql1, params1);
      const key2 = generateCacheKey(sql2, params2);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different queries', () => {
      const sql1 = 'SELECT * FROM users WHERE id = $1';
      const params1 = [1];

      const sql2 = 'SELECT * FROM users WHERE id = $1';
      const params2 = [2];

      const key1 = generateCacheKey(sql1, params1);
      const key2 = generateCacheKey(sql2, params2);

      expect(key1).not.toBe(key2);
    });

    it('should not normalize SQL for different keys', () => {
      const sql1 = 'SELECT * FROM users WHERE id = $1';
      const sql2 = 'SELECT * FROM users WHERE id = $1  -- comment';
      const params = [1];

      const key1 = generateCacheKey(sql1, params);
      const key2 = generateCacheKey(sql2, params);

      expect(key1).not.toBe(key2);
    });

    it('should only cache SELECT queries', () => {
      expect(shouldCacheQuery('SELECT * FROM users')).toBe(true);
      expect(shouldCacheQuery('select * from users')).toBe(true);
      expect(shouldCacheQuery('INSERT INTO users VALUES (1)')).toBe(false);
      expect(shouldCacheQuery('UPDATE users SET name = "test"')).toBe(false);
      expect(shouldCacheQuery('DELETE FROM users WHERE id = 1')).toBe(false);
    });

    it('should respect skipCache option', () => {
      expect(shouldCacheQuery('SELECT * FROM users', { skipCache: true })).toBe(false);
      expect(shouldCacheQuery('SELECT * FROM users', { skipCache: false })).toBe(true);
    });

    it('should return correct TTL', () => {
      expect(getCacheTtl()).toBe(21600); // default
      expect(getCacheTtl({ ttlSeconds: 3600 })).toBe(3600);
    });
  });
});
