/* Copyright (c) 2024-present Venky Corp. */

import logger from './logger';

/**
 * Framework-agnostic server redirect.
 * Call redirect(url) to abort the current request and redirect; the implementation
 * throws (Next.js, TanStack Router) or otherwise never returns.
 *
 * Set the implementation during server init via setRedirectImplementation() or
 * via ServerConfig.redirectImplementation in initializeServer().
 */

export type RedirectImplementation = (url: string) => never;

declare global {
  var _$venkyRedirectImplementation: RedirectImplementation | null | undefined;
}

function defaultRedirect(url: string): never {
  logger.error(`Redirect not configured. Attempted redirect to: ${url}`);
  throw new Error(
    `Venky redirect not configured. Call setRedirectImplementation() during server initialization. Attempted redirect to: ${url}`,
  );
}

/**
 * Set the redirect implementation for the current framework.
 * Call this during server initialization (or pass redirectImplementation in ServerConfig).
 *
 * @example
 * // Next.js: use nextjsRedirectImplementation from venky-core/server (default in initializeServer)
 * // TanStack: setRedirectImplementation((url) => { throw redirect({ to: url }); });
 */
export function setRedirectImplementation(impl: RedirectImplementation): void {
  logger.info('Setting redirect implementation');
  globalThis._$venkyRedirectImplementation = impl;
}

/**
 * Get the current redirect implementation (or default that throws if not set).
 * Prefer calling redirect(url) which uses this internally.
 */
export function getRedirect(): RedirectImplementation {
  const impl = globalThis._$venkyRedirectImplementation;
  return impl ?? defaultRedirect;
}

/**
 * Redirect to the given URL. Never returns; the implementation throws.
 * Requires setRedirectImplementation() (or redirectImplementation in ServerConfig) to have been called.
 */
export function redirect(url: string): never {
  return getRedirect()(url);
}
