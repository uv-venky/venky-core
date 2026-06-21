/* Copyright (c) 2024-present Venky Corp. */
'use client';
const defaultRouter = {
    push(url) {
        window.location.href = url;
    },
    replace(url) {
        window.location.replace(url);
    },
};
let customRouter = null;
/**
 * Set a custom router implementation for client-side navigation.
 * Call this once during app initialization (e.g., in a root layout component).
 */
export function setRouterImplementation(router) {
    customRouter = router;
}
export function useRouter() {
    return customRouter ?? defaultRouter;
}
//# sourceMappingURL=useRouter.js.map