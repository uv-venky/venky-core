/* Copyright (c) 2024-present Venky Corp. */

import { redirect as nextRedirect } from 'next/navigation';
import type { RedirectImplementation } from './redirect';

/**
 * Next.js implementation of server redirect.
 * Uses next/navigation redirect (throws to abort render and redirect).
 *
 * Used by default when initializeServer() is called without redirectImplementation.
 * Can be passed explicitly as config.redirectImplementation in ServerConfig.
 */
export const nextjsRedirectImplementation: RedirectImplementation = (url: string) => {
  nextRedirect(url);
};
