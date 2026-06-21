export type QueryStatus = 'loading' | 'success' | 'error';
export interface CacheEntry<T> {
    status: QueryStatus;
    data?: T;
    error?: string;
    promise?: Promise<void>;
    initialQueryFiredAt: number;
    /** Timestamp when data was last fetched successfully */
    dataUpdatedAt?: number;
    invalidated?: boolean;
}
export declare const queryStore: Record<string, CacheEntry<unknown>>;
export declare function updateUsage(key: string): void;
export declare function getCacheKey<TParams extends unknown[]>(name: string, args: TParams): string;
/**
 * Invalidate a specific query cache entry.
 * Next useQuery call with same key will refetch.
 *
 * @example
 * invalidateQuery('getEntities'); // Invalidates all getEntities queries
 * invalidateQuery('getEntity', '123'); // Invalidates specific entity query
 */
export declare function invalidateQuery(actionName: string, ...params: unknown[]): void;
/**
 * Invalidate multiple queries by action names.
 *
 * @example
 * invalidateQueries(['getEntities', 'getEntityCount']);
 */
export declare function invalidateQueries(actionNames: string[]): void;
/**
 * Invalidate all cached queries.
 * Use sparingly - typically after logout or major state changes.
 */
export declare function invalidateAllQueries(): void;
/**
 * Check if a query is currently cached and successful.
 */
export declare function isQueryCached(actionName: string, ...params: unknown[]): boolean;
//# sourceMappingURL=valtioQueryStore.d.ts.map