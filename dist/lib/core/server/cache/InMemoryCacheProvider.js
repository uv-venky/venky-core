import logger from '../../../../lib/core/server/logger';
function cleanup(cache) {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.options.ttlMs) {
      cache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0 && logger.debugEnabled) {
    logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
  }
}
export class InMemoryCacheProvider {
  cache = new Map();
  config;
  hits = 0;
  misses = 0;
  constructor(config) {
    this.config = config;
    // Clean up expired entries every 5 minutes
    setInterval(() => cleanup(this.cache), 5 * 60 * 1000);
  }
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      // logger.info(`Cache miss: ${key}`);
      this.misses++;
      return null;
    }
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.misses++;
      // logger.info(`Cache miss: ${key} (expired)`);
      return null;
    }
    // Update hit count and LRU
    entry.hits++;
    this.hits++;
    // Move to end for LRU (Map maintains insertion order)
    this.cache.delete(key);
    if (entry.options.autoRefreshTTL) {
      entry.timestamp = Date.now();
    }
    this.cache.set(key, entry);
    // logger.info(`Cache hit: ${key}`);
    return entry.data;
  }
  async set(key, value, options) {
    const ttl = options?.ttlSeconds ?? this.config.defaultTtlSeconds;
    const autoRefreshTTL = options?.autoRefreshTTL ?? false;
    const entry = {
      data: value,
      timestamp: Date.now(),
      options: {
        ttlMs: ttl * 1000,
        autoRefreshTTL,
      },
      hits: 0,
    };
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.config.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, entry);
  }
  async delete(key) {
    if (key.endsWith('*')) {
      const prefix = key.slice(0, -1);
      for (const k of this.cache.keys()) {
        if (k.startsWith(prefix)) {
          logger.info(`Deleting cache entry: ${k}`);
          this.cache.delete(k);
        }
      }
    }
    this.cache.delete(key);
  }
  async clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
  async getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      entries: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }
  isExpired(entry) {
    return Date.now() - entry.timestamp > entry.options.ttlMs;
  }
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // Rough estimate for string
      totalSize += JSON.stringify(entry.data).length * 2; // Rough estimate
      totalSize += 32; // Entry overhead
    }
    return totalSize;
  }
}
//# sourceMappingURL=InMemoryCacheProvider.js.map
