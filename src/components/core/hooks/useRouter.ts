/* Copyright (c) 2024-present Venky Corp. */
'use client';

/**
 * Framework-agnostic useRouter hook.
 * Provides push() and replace() for navigation using window.location / history API.
 *
 * This replaces `useRouter` from `next/navigation` so core components
 * work in any React framework (Next.js, TanStack Start, etc.).
 *
 * Only push() and replace() are implemented — these are the only
 * methods used throughout the core codebase.
 *
 * Consuming apps can call `setRouterImplementation()` to provide a
 * framework-specific router (e.g., TanStack Router's navigate).
 */

export interface AppRouter {
  push(url: string): void;
  replace(url: string): void;
}

const defaultRouter: AppRouter = {
  push(url: string) {
    window.location.href = url;
  },
  replace(url: string) {
    window.location.replace(url);
  },
};

let customRouter: AppRouter | null = null;

/**
 * Set a custom router implementation for client-side navigation.
 * Call this once during app initialization (e.g., in a root layout component).
 */
export function setRouterImplementation(router: AppRouter): void {
  customRouter = router;
}

export function useRouter(): AppRouter {
  return customRouter ?? defaultRouter;
}
