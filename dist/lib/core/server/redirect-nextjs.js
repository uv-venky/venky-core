/* Copyright (c) 2024-present Venky Corp. */
import { redirect as nextRedirect } from 'next/navigation';
/**
 * Next.js implementation of server redirect.
 * Uses next/navigation redirect (throws to abort render and redirect).
 *
 * Used by default when initializeServer() is called without redirectImplementation.
 * Can be passed explicitly as config.redirectImplementation in ServerConfig.
 */
export const nextjsRedirectImplementation = (url) => {
    nextRedirect(url);
};
//# sourceMappingURL=redirect-nextjs.js.map