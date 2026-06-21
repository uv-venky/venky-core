/* Copyright (c) 2024-present Venky Corp. */
import logger from './logger';
function defaultRedirect(url) {
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
export function setRedirectImplementation(impl) {
  logger.info('Setting redirect implementation');
  globalThis._$venkyRedirectImplementation = impl;
}
/**
 * Get the current redirect implementation (or default that throws if not set).
 * Prefer calling redirect(url) which uses this internally.
 */
export function getRedirect() {
  const impl = globalThis._$venkyRedirectImplementation;
  return impl ?? defaultRedirect;
}
/**
 * Redirect to the given URL. Never returns; the implementation throws.
 * Requires setRedirectImplementation() (or redirectImplementation in ServerConfig) to have been called.
 */
export function redirect(url) {
  return getRedirect()(url);
}
//# sourceMappingURL=redirect.js.map
