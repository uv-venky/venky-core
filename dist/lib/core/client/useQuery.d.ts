import type { ActionName, ActionOutput, ActionParams } from '../../../lib/server/actions';
import { type PrefetchOptions, type QueryOptions, type QueryResult, type SuspenseQueryOptions, type MutationOptionsBase, type MutationCallOptions } from '../../../lib/core/client/useQueryBase';
/**
 * Simple query hook for fetching action data.
 * For advanced options (staleTime, refetchOnWindowFocus), use useQueryWithOptions.
 */
export declare function useQuery<T extends ActionName>(name: T, ...params: ActionParams<T>): QueryResult<Awaited<ActionOutput<T>>>;
/**
 * Query hook with React Query-like options.
 *
 * @example
 * const result = useQueryWithOptions('getChartData', {
 *   staleTime: 60_000,           // Data fresh for 1 minute
 *   refetchOnWindowFocus: true,  // Refetch when tab becomes active
 *   enabled: !!startDate,        // Only fetch when startDate exists
 *   retry: 3,                    // Retry 3 times on failure
 *   retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
 *   refetchInterval: 30_000,     // Auto-refresh every 30 seconds
 * }, startDate, endDate);
 */
export declare function useQueryWithOptions<T extends ActionName>(name: T, options: QueryOptions, ...params: ActionParams<T>): QueryResult<Awaited<ActionOutput<T>>>;
/**
 * Suspense-enabled query hook. Suspends until data is ready.
 * Must be used within a React Suspense boundary.
 *
 * @example
 * function ChartComponent({ startDate, endDate }) {
 *   // Simple usage - suspends until data is ready
 *   const data = useSuspenseQuery('getChartData', {}, startDate, endDate);
 *   return <Chart data={data} />;
 * }
 *
 * @example
 * // With options
 * const data = useSuspenseQuery('getChartData', {
 *   retry: 3,
 *   retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
 *   staleTime: 60_000,
 * }, startDate, endDate);
 *
 * // Wrap with Suspense
 * <Suspense fallback={<Loader />}>
 *   <ChartComponent startDate={startDate} endDate={endDate} />
 * </Suspense>
 */
export declare function useSuspenseQuery<T extends ActionName>(name: T, options: SuspenseQueryOptions, ...params: ActionParams<T>): Awaited<ActionOutput<T>>;
/**
 * Mutation hook with cache invalidation and callbacks.
 *
 * @example
 * // Simple usage
 * const createEntity = useMutation('createEntity');
 * await createEntity({ name: 'New Entity' });
 *
 * @example
 * // With options
 * const createEntity = useMutation('createEntity', {
 *   invalidateOnSuccess: ['getEntities', 'getEntityCount'],
 *   onSuccess: (result) => console.info('Created:', result),
 * });
 */
export declare function useMutation<T extends ActionName>(name: T, options?: MutationOptionsBase<Awaited<ActionOutput<T>>>): (...args: [...ActionParams<T>] | [...ActionParams<T>, MutationCallOptions]) => Promise<Awaited<ActionOutput<T>>>;
/**
 * Prefetch data into the cache without triggering a component render.
 * Useful for prefetching on hover before navigating to a page.
 *
 * @example
 * // Prefetch on hover
 * <button
 *   onMouseEnter={() => prefetchQuery('getChartData', {}, chartId)}
 *   onClick={() => navigate(`/charts/${chartId}`)}
 * >
 *   View Chart
 * </button>
 *
 * @example
 * // Prefetch with options
 * await prefetchQuery('getChartData', { retry: 2 }, chartId);
 */
export declare function prefetchQuery<T extends ActionName>(name: T, options: PrefetchOptions, ...params: ActionParams<T>): Promise<void>;
export type { QueryOptions, SuspenseQueryOptions, MutationOptionsBase, MutationCallOptions, QueryResult };
//# sourceMappingURL=useQuery.d.ts.map