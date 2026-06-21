/* Copyright (c) 2024-present Venky Corp. */
'use client';
let activeHook = () => ({});
/**
 * Set a custom useParams implementation.
 * Call this once during app initialization before the first render.
 */
export function setParamsImplementation(hook) {
    activeHook = hook;
}
export function useParams() {
    return activeHook();
}
//# sourceMappingURL=useParams.js.map