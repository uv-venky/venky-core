import { invalidateQuery, invalidateQueries, invalidateAllQueries } from '../../../lib/core/client/valtioQueryStore';
import type { StoreIdentifier } from '../../../lib/core/common/types/Store';
export { invalidateQuery, invalidateQueries, invalidateAllQueries };
/**
 * Invoke a registry action from the client and return the result.
 * Use for one-off calls (e.g. plugin getOptions) where useQuery is not used.
 * Does not show error toasts; throws on error.
 */
export declare function invokeQueryAction<T>(actionName: string, ...params: unknown[]): Promise<T>;
/** Generic query result type for use in consuming projects */
export type QueryResult<TData> = {
    status: 'loading';
} | {
    status: 'error';
    error: string;
} | {
    status: 'success';
    data: TData;
};
export interface QueryOptions {
    /** Time in ms that data is considered fresh. Default: Infinity (never stale) */
    staleTime?: number;
    /** Refetch when window regains focus. Default: false */
    refetchOnWindowFocus?: boolean;
    /** Only fetch when true. Default: true */
    enabled?: boolean;
    /** Whether this is a public (unauthenticated) action */
    isPublic?: boolean;
    /** Number of retry attempts on failure. Default: 0 (no retries) */
    retry?: number;
    /** Delay between retries in ms. Default: 1000. Can be a function for exponential backoff. */
    retryDelay?: number | ((attempt: number) => number);
    /** Auto-refetch interval in ms. Default: undefined (no auto-refetch) */
    refetchInterval?: number;
}
export interface PrefetchOptions {
    /** Whether this is a public (unauthenticated) action */
    isPublic?: boolean;
    /** Number of retry attempts on failure. Default: 0 */
    retry?: number;
    /** Delay between retries in ms. Default: 1000 */
    retryDelay?: number | ((attempt: number) => number);
}
export interface SuspenseQueryOptions {
    /** Time in ms that data is considered fresh. Default: Infinity (never stale) */
    staleTime?: number;
    /** Whether this is a public (unauthenticated) action */
    isPublic?: boolean;
    /** Number of retry attempts on failure. Default: 0 (no retries) */
    retry?: number;
    /** Delay between retries in ms. Default: 1000. Can be a function for exponential backoff. */
    retryDelay?: number | ((attempt: number) => number);
}
/** Generic mutation options for consuming projects */
export interface MutationOptionsBase<TOutput> {
    /** Action names to invalidate on success */
    invalidateOnSuccess?: string[];
    /** Stores to invalidate/refresh on success (by datasourceId or precise identifier) */
    invalidateStoresOnSuccess?: StoreIdentifier[];
    /** Whether this is a public (unauthenticated) action */
    isPublic?: boolean;
    /** Callback on success */
    onSuccess?: (result: TOutput) => void;
    /** Callback on error (in addition to toast) */
    onError?: (error: string) => void;
}
/**
 * Generic query hook for consuming projects.
 * Use this when you need to query actions from your own action registry.
 *
 * @example
 * // Direct usage with manual typing
 * const result = useQueryBase<ChartData>('getChartData', {}, startDate, endDate);
 *
 * @example
 * // Create typed wrapper in your project
 * export function useQuery<T extends ActionName>(name: T, ...params: ActionParams<T>) {
 *   return useQueryBase<Awaited<ActionOutput<T>>>(name, {}, ...params);
 * }
 */
export declare function useQueryBase<TOutput = unknown>(name: string, options: QueryOptions, ...params: unknown[]): QueryResult<TOutput>;
/**
 * Generic suspense query hook for consuming projects.
 * Suspends until data is ready. Must be used within a React Suspense boundary.
 *
 * @example
 * const data = useSuspenseQueryBase<ChartData>('getChartData', {}, startDate, endDate);
 */
export declare function useSuspenseQueryBase<TOutput = unknown>(name: string, options: SuspenseQueryOptions, ...params: unknown[]): TOutput;
/**
 * Options that can be passed as the last argument to a mutation call for abort support.
 */
export interface MutationCallOptions {
    signal?: AbortSignal;
}
/**
 * Generic mutation hook for consuming projects.
 *
 * @example
 * // Direct usage
 * const mutate = useMutationBase<[{ name: string }], Entity>('createEntity', {
 *   onSuccess: (result) => console.info('Created:', result),
 * });
 * await mutate({ name: 'New Entity' });
 *
 * @example
 * // With abort signal (e.g. cancel on unmount)
 * const controller = new AbortController();
 * mutate({ name: 'New Entity' }, { signal: controller.signal });
 * // later: controller.abort();
 *
 * @example
 * // Create typed wrapper in your project
 * export function useMutation<T extends ActionName>(name: T, options?: MutationOptionsBase<ActionOutput<T>>) {
 *   return useMutationBase<ActionParams<T>, Awaited<ActionOutput<T>>>(name, options);
 * }
 */
export declare function useMutationBase<TParams extends unknown[] = unknown[], TOutput = unknown>(name: string, options?: MutationOptionsBase<TOutput>): (...args: [...TParams] | [...TParams, MutationCallOptions]) => Promise<TOutput>;
/**
 * Generic prefetch for consuming projects.
 */
export declare function prefetchQueryBase(name: string, options: PrefetchOptions, ...params: unknown[]): Promise<void>;
//# sourceMappingURL=useQueryBase.d.ts.map