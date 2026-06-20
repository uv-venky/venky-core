/* Copyright (c) 2024-present Venky Corp. */
'use client';

/**
 * Framework-agnostic useParams hook.
 * Returns the current route params (e.g. dynamic segments, catch-all).
 *
 * This replaces `useParams` from `next/navigation` so core components
 * work in any React framework (Next.js, TanStack Start, etc.).
 *
 * Consuming apps can call `setParamsImplementation()` to provide a
 * framework-specific hook (e.g., TanStack Router's useParams).
 */

export type Params = Record<string, string | string[]>;

let activeHook: () => Params = () => ({});

/**
 * Set a custom useParams implementation.
 * Call this once during app initialization before the first render.
 */
export function setParamsImplementation(hook: () => Params): void {
  activeHook = hook;
}

export function useParams<T extends Params = Params>(): T {
  return activeHook() as T;
}
