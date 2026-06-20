'use client';

import { proxy, useSnapshot } from 'valtio';

// ============================================================================
// Loading Tracker - Centralized tracking for initial page load
// ============================================================================

/** Debounce delay before signaling ready (handles master-child query patterns) */
const READY_DEBOUNCE_MS = 3000;

/** Bound how many source strings we retain (DataLoadingTracker resets only on initial layout mount). */
const MAX_METADATA_SOURCES = 3000;

/** Max source strings embedded in data-venky-data-load-meta JSON (keeps DOM attr small). */
const MAX_SOURCES_IN_DOM_META = 500;

let readyTimeoutId: ReturnType<typeof setTimeout> | null = null;
let mountTime = Date.now();

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

export const loadingTracker = proxy<LoadingTrackerState>({
  pendingCount: 0,
  hasTracked: false,
  isReady: false,
  metadata: {
    firstQueryAt: 0,
    lastQueryAt: 0,
    totalQueries: 0,
    sources: [],
  },
});

/**
 * Call when a query/store starts loading.
 * @param source - Optional identifier for debugging (e.g., 'store:Users' or 'query:getUser')
 */
export function incrementPending(source?: string) {
  // Once ready, ignore all subsequent queries (initial load complete)
  if (loadingTracker.isReady) return;

  const msSinceMount = Date.now() - mountTime;

  if (!loadingTracker.hasTracked) {
    loadingTracker.metadata.firstQueryAt = msSinceMount;
  }
  loadingTracker.metadata.lastQueryAt = msSinceMount;
  loadingTracker.metadata.totalQueries++;
  loadingTracker.pendingCount++;
  loadingTracker.hasTracked = true;

  // Cancel any pending ready signal (new query started)
  if (readyTimeoutId) {
    clearTimeout(readyTimeoutId);
    readyTimeoutId = null;
  }

  // Track source for debugging (allows duplicates to detect repeated calls)
  if (source && loadingTracker.metadata.sources.length < MAX_METADATA_SOURCES) {
    loadingTracker.metadata.sources.push(source);
  }

  // Update window for debugging
  if (typeof window !== 'undefined') {
    window.__VENKY_LOADING_COUNT__ = loadingTracker.pendingCount;
  }
}

/**
 * Call when a query/store finishes loading (success or error).
 */
export function decrementPending() {
  // Once ready, ignore all subsequent queries (initial load complete)
  if (loadingTracker.isReady) return;

  loadingTracker.pendingCount = Math.max(0, loadingTracker.pendingCount - 1);

  // Update window for debugging
  if (typeof window !== 'undefined') {
    window.__VENKY_LOADING_COUNT__ = loadingTracker.pendingCount;
  }

  checkReady();
}

/**
 * Manually signal that the page is ready.
 * Use this for pages with complex loading patterns that can't be auto-detected.
 */
export function signalManualReady() {
  loadingTracker.isReady = true;
  loadingTracker.hasTracked = true;
  updateDOMDeferred();
}

/**
 * Reset the tracker state. Called when DataLoadingTracker mounts (initial secure layout load).
 */
export function resetLoadingTracker() {
  // Cancel any pending ready signal
  if (readyTimeoutId) {
    clearTimeout(readyTimeoutId);
    readyTimeoutId = null;
  }

  // Reset mount time for relative timestamps
  mountTime = Date.now();

  loadingTracker.pendingCount = 0;
  loadingTracker.hasTracked = false;
  loadingTracker.isReady = false;
  loadingTracker.metadata = {
    firstQueryAt: 0,
    lastQueryAt: 0,
    totalQueries: 0,
    sources: [],
  };

  if (typeof window !== 'undefined') {
    window.__VENKY_DATA_READY__ = false;
    window.__VENKY_LOADING_COUNT__ = 0;
    delete document.body.dataset.storesLoaded;
    delete document.body.dataset.venkyDataLoadMeta;
  }
}

function checkReady() {
  if (loadingTracker.pendingCount === 0 && loadingTracker.hasTracked) {
    // Debounce to handle master-child patterns where children start loading
    // after master completes and for the UI to update.
    if (readyTimeoutId) {
      clearTimeout(readyTimeoutId);
    }
    readyTimeoutId = setTimeout(() => {
      // Re-check: new queries may have started during the debounce
      if (loadingTracker.pendingCount === 0 && loadingTracker.hasTracked) {
        loadingTracker.isReady = true;
        updateDOM();
      }
      readyTimeoutId = null;
    }, READY_DEBOUNCE_MS);
  }
}

function updateDOMDeferred() {
  setTimeout(() => {
    updateDOM();
  }, 500);
}

function updateDOM() {
  if (typeof window === 'undefined') return;

  window.__VENKY_DATA_READY__ = loadingTracker.isReady;

  if (loadingTracker.isReady) {
    document.body.dataset.storesLoaded = 'true';

    // Set metadata for Playwright tests (times are ms since mount)
    try {
      document.body.dataset.venkyDataLoadMeta = JSON.stringify({
        totalCount: loadingTracker.metadata.totalQueries,
        firstQueryAt: loadingTracker.metadata.firstQueryAt,
        lastQueryAt: loadingTracker.metadata.lastQueryAt,
        elapsedMs: Date.now() - mountTime,
        sources: loadingTracker.metadata.sources.slice(-MAX_SOURCES_IN_DOM_META),
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[venky loading-tracker] venkyDataLoadMeta JSON.stringify failed; using minimal fallback',
          e instanceof Error ? e.message : e,
          {
            sourceCount: loadingTracker.metadata.sources.length,
            totalQueries: loadingTracker.metadata.totalQueries,
          },
        );
      }
      document.body.dataset.venkyDataLoadMeta = JSON.stringify({
        totalCount: loadingTracker.metadata.totalQueries,
        elapsedMs: Date.now() - mountTime,
        sourcesTruncated: true,
      });
    }
  } else {
    delete document.body.dataset.storesLoaded;
  }
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook to get the current loading tracker state.
 * Useful for components that need to react to loading state changes.
 */
export function useLoadingTracker() {
  return useSnapshot(loadingTracker) as Readonly<LoadingTrackerState>;
}

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
export function useLoadingControl() {
  return {
    increment: incrementPending,
    decrement: decrementPending,
  };
}

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
export function useManualReadySignal() {
  return signalManualReady;
}
