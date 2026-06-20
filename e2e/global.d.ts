/**
 * Global type declarations for Playwright visual regression tests.
 * These properties are set by the DataLoadingTracker component
 * to signal when all data stores have finished loading.
 */
declare global {
  interface Window {
    /**
     * Set to true when all data stores and queries have finished loading
     * and the state has been stable for 500ms.
     */
    __VENKY_DATA_READY__?: boolean;

    /**
     * Current count of stores/queries that are still loading.
     * Used for debugging purposes.
     */
    __VENKY_LOADING_COUNT__?: number;

    /**
     * When true, the page is using explicit mode and the tracker
     * will wait for a manual signal instead of the automatic stability window.
     */
    __VENKY_EXPLICIT_MODE__?: boolean;

    /**
     * When true, enable demoMask for visual regression screenshots.
     * Transforms all text to X's and numbers to 0's for stable screenshots.
     */
    __VENKY_DEMO_MASK__?: boolean;
  }
}

// This export is needed to make this a module
export {};
