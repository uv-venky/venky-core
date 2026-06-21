/* Copyright (c) 2024-present Venky Corp. */
import logger from './logger';
/**
 * Set the request context provider for the current framework.
 * Call this during server initialization.
 *
 * @example
 * // Next.js (in server-config.ts or init.ts)
 * import { nextjsRequestContext } from '../../../venky-exports/core/server/index.js';
 * setRequestContextProvider(nextjsRequestContext);
 *
 * @example
 * // TanStack Start (in init.ts)
 * import { setRequestContextProvider } from '../../../venky-exports/core/server/index.js';
 * setRequestContextProvider(vinxiRequestContext);
 */
export function setRequestContextProvider(provider) {
    logger.info('Setting request context provider');
    globalThis._$venkyRequestContextProvider = provider;
}
/**
 * Get the current request context provider.
 * Throws if no provider has been set.
 */
export function getRequestContext(name) {
    const provider = globalThis._$venkyRequestContextProvider;
    if (!provider) {
        logger.error(`RequestContext provider not set! ${name}`);
        throw new Error(`RequestContext provider not set! ${name}. Call setRequestContextProvider() during server initialization.
        For Next.js, use: setRequestContextProvider(nextjsRequestContext)`);
    }
    return provider;
}
//# sourceMappingURL=request-context.js.map