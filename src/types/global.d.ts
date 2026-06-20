/* Copyright (c) 2024-present Venky Corp. */

/**
 * Global type declarations for data loading tracker.
 * These properties are used by Playwright visual regression tests
 * to determine when all data stores have finished loading.
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
     * will wait for __VENKY_SIGNAL_READY__ to be called instead
     * of using the automatic stability window.
     */
    __VENKY_EXPLICIT_MODE__?: boolean;

    /**
     * Function to call when a page in explicit mode is ready.
     * Set by usePageReadySignal() hook.
     */
    __VENKY_SIGNAL_READY__?: () => void;
  }
}

// This export is needed to make this a module
export {};
