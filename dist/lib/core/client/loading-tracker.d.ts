export interface LoadingTrackerMetadata {
    /** Time of first query in ms since mount */
    firstQueryAt: number;
    /** Time of last query in ms since mount */
    lastQueryAt: number;
    totalQueries: number;
    sources: string[];
}
/** Metadata written to DOM for Playwright tests */
export interface DataLoadMeta {
    totalCount: number;
    firstQueryAt: number;
    lastQueryAt: number;
    elapsedMs: number;
    sources: string[];
}
export interface LoadingTrackerState {
    /** Number of queries currently in-flight */
    pendingCount: number;
    /** Whether any query has been tracked (prevents false ready on empty pages) */
    hasTracked: boolean;
    /** Whether all initial queries have completed */
    isReady: boolean;
    /** Metadata about the loading process */
    metadata: LoadingTrackerMetadata;
}
export declare const loadingTracker: LoadingTrackerState;
/**
 * Call when a query/store starts loading.
 * @param source - Optional identifier for debugging (e.g., 'store:Users' or 'query:getUser')
 */
export declare function incrementPending(source?: string): void;
/**
 * Call when a query/store finishes loading (success or error).
 */
export declare function decrementPending(): void;
/**
 * Manually signal that the page is ready.
 * Use this for pages with complex loading patterns that can't be auto-detected.
 */
export declare function signalManualReady(): void;
/**
 * Reset the tracker state. Called when DataLoadingTracker mounts (initial secure layout load).
 */
export declare function resetLoadingTracker(): void;
/**
 * Hook to get the current loading tracker state.
 * Useful for components that need to react to loading state changes.
 */
export declare function useLoadingTracker(): Readonly<LoadingTrackerState>;
/**
 * Hook for manual increment/decrement control.
 * Use this for custom loading patterns (e.g., child components that load data).
 *
 * @example
 * ```tsx
 * const { increment, decrement } = useLoadingControl();
 *
 * useEffect(() => {
 *   increment();
 *   fetchData().finally(() => decrement());
 * }, []);
 * ```
 */
export declare function useLoadingControl(): {
    increment: typeof incrementPending;
    decrement: typeof decrementPending;
};
/**
 * Hook for explicitly signaling page ready.
 * Use this for pages with complex loading that can't be auto-detected.
 *
 * @example
 * ```tsx
 * const signalReady = useManualReadySignal();
 *
 * useEffect(() => {
 *   if (allDataLoaded) signalReady();
 * }, [allDataLoaded, signalReady]);
 * ```
 */
export declare function useManualReadySignal(): typeof signalManualReady;
//# sourceMappingURL=loading-tracker.d.ts.map