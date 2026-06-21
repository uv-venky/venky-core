/**
 * DataLoadingTracker initializes the loading tracker for Playwright tests.
 * It sets window.__VENKY_DATA_READY__ to true when all initial data has
 * finished loading.
 *
 * Intended for **initial app load** only: reset runs once when the secure layout mounts,
 * not on every client navigation. Oversized `venkyDataLoadMeta` JSON is prevented in
 * `loading-tracker.ts` (capped sources + bounded DOM payload), not by resetting per route.
 *
 * Add this component to your layout to enable data loading detection:
 * ```tsx
 * <DataLoadingTracker />
 * ```
 */
export declare function DataLoadingTracker(): null;
//# sourceMappingURL=DataLoadingTracker.d.ts.map