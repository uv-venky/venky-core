import type { RedirectImplementation } from './redirect';
/**
 * Next.js implementation of server redirect.
 * Uses next/navigation redirect (throws to abort render and redirect).
 *
 * Used by default when initializeServer() is called without redirectImplementation.
 * Can be passed explicitly as config.redirectImplementation in ServerConfig.
 */
export declare const nextjsRedirectImplementation: RedirectImplementation;
//# sourceMappingURL=redirect-nextjs.d.ts.map
