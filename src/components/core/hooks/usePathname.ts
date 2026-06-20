/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { useSyncExternalStore } from 'react';

/**
 * Framework-agnostic usePathname hook.
 * Returns the current pathname from window.location.
 * Subscribes to popstate events so route changes are detected.
 *
 * This replaces `usePathname` from `next/navigation` so core hooks
 * work in any React framework (Next.js, TanStack Start, etc.).
 *
 * Consuming apps can call `setPathnameImplementation()` to provide a
 * framework-specific hook (e.g., TanStack Router's useLocation).
 */

function useDefaultPathname(): string {
  return useSyncExternalStore(subscribeToPathname, getPathname, getServerPathname);
}

let activeHook: () => string = useDefaultPathname;

/**
 * Set a custom usePathname implementation.
 * Call this once during app initialization before the first render.
 */
export function setPathnameImplementation(hook: () => string): void {
  activeHook = hook;
}

export function usePathname(): string {
  return activeHook();
}

function getPathname(): string {
  return window.location.pathname;
}

function getServerPathname(): string {
  return '/';
}

function subscribeToPathname(callback: () => void): () => void {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}
