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
/**
 * Set a custom router implementation for client-side navigation.
 * Call this once during app initialization (e.g., in a root layout component).
 */
export declare function setRouterImplementation(router: AppRouter): void;
export declare function useRouter(): AppRouter;
//# sourceMappingURL=useRouter.d.ts.map