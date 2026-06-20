'use client';
/* Copyright (c) 2024-present Venky Corp. */

import type { FeedbackCaptureContext, FeedbackConfig, FeedbackStoreSnapshot } from '../common/types';
import { STORE_CACHE, storeState } from '@/lib/core/client/state';
import { collectDiagnostics } from './diagnostics';

// Re-export for backward compat (LazyFeedbackProvider imports initConsoleCapture)
export { initErrorCapture as initConsoleCapture } from './diagnostics';

export function collectActiveStores(): FeedbackStoreSnapshot[] {
  try {
    const snapshots: FeedbackStoreSnapshot[] = [];

    for (const [key, store] of STORE_CACHE) {
      const state = storeState.data[key];
      if (!state) continue;

      snapshots.push({
        datasourceId: store.datasourceId,
        alias: store.alias,
        page: store.page,
        rowCount: state.rowIds?.length ?? 0,
        totalRowCount: state.totalRowCount,
        isLoading: state.isLoading ?? false,
        isDirty: store.isStoreDirty?.() ?? false,
        dirtyRowCount: state._childDirtyCount ?? 0,
        storeFilters: safeArray(state.storeFilters),
        smartSearchFilters: safeArray(state.smartSearchFilters),
        headerFilters: safeObject(state.headerFilters),
        sort: state.sort,
      });
    }

    return snapshots;
  } catch {
    return [];
  }
}

export function collectFeedbackContext(
  configContext?: FeedbackConfig['context'],
  includeDiagnostics = true,
): FeedbackCaptureContext {
  const context: FeedbackCaptureContext = {
    routePath: window.location.pathname,
    fullUrl: window.location.href,
    browser: {
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      language: navigator.language,
    },
    appVersion: configContext?.appVersion,
    featureFlags: configContext?.featureFlags,
    recentErrors: [],
    occurredAt: new Date().toISOString(),
  };

  if (includeDiagnostics) {
    const diagnostics = safeCall(collectDiagnostics, { logs: [], network: [], errors: [] });
    context.activeStores = safeCall(collectActiveStores, []);
    context.recentLogs = diagnostics.logs;
    context.recentErrors = diagnostics.errors;
    context.recentNetwork = diagnostics.network;
  }

  return context;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeCall<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function safeArray(val: unknown): unknown[] {
  return Array.isArray(val) ? val : [];
}

function safeObject(val: unknown): unknown[] {
  if (!val || typeof val !== 'object') return [];
  try {
    return Object.entries(val)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => ({ [k]: v }));
  } catch {
    return [];
  }
}
