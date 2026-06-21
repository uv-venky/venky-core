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
function useDefaultPathname() {
    return useSyncExternalStore(subscribeToPathname, getPathname, getServerPathname);
}
let activeHook = useDefaultPathname;
/**
 * Set a custom usePathname implementation.
 * Call this once during app initialization before the first render.
 */
export function setPathnameImplementation(hook) {
    activeHook = hook;
}
export function usePathname() {
    return activeHook();
}
function getPathname() {
    return window.location.pathname;
}
function getServerPathname() {
    return '/';
}
function subscribeToPathname(callback) {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
}
//# sourceMappingURL=usePathname.js.map