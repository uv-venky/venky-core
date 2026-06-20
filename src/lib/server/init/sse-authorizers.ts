/* Copyright (c) 2024-present Venky Corp. */

/**
 * Registers app-level SSE channel authorizers. Call from server init (and dev re-init after initializeServer).
 * Consuming apps can add authorizers here or in their own init module.
 */
export function registerAppSSEAuthorizers(): void {
  // No default app-level SSE authorizers in venky-core.
}
