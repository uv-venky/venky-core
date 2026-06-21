import type { CacheProvider, CacheConfig, CacheStats, CacheSetOptions } from './types';
export declare class InMemoryCacheProvider implements CacheProvider {
    private cache;
    private config;
    private hits;
    private misses;
    constructor(config: CacheConfig);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    getStats(): Promise<CacheStats>;
    private isExpired;
    private estimateMemoryUsage;
}
//# sourceMappingURL=InMemoryCacheProvider.d.ts.map