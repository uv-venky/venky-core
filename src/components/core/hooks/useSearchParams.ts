/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { useSyncExternalStore } from 'react';

/**
 * Framework-agnostic useSearchParams hook.
 * Returns a URLSearchParams instance built from window.location.search.
 * Subscribes to popstate events so changes via back/forward are detected.
 *
 * This replaces `useSearchParams` from `next/navigation` so core components
 * work in any React framework (Next.js, TanStack Start, etc.).
 *
 * Consuming apps can call `setSearchParamsImplementation()` to provide a
 * framework-specific hook (e.g., TanStack Router's useSearch).
 */

function useDefaultSearchParams(): URLSearchParams {
  const search = useSyncExternalStore(subscribeToSearch, getSearch, getServerSearch);
  return new URLSearchParams(search);
}

let activeHook: () => URLSearchParams = useDefaultSearchParams;

/**
 * Set a custom useSearchParams implementation.
 * Call this once during app initialization before the first render.
 */
export function setSearchParamsImplementation(hook: () => URLSearchParams): void {
  activeHook = hook;
}

export function useSearchParams(): URLSearchParams {
  return activeHook();
}

function getSearch(): string {
  return window.location.search;
}

function getServerSearch(): string {
  return '';
}

function subscribeToSearch(callback: () => void): () => void {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}
