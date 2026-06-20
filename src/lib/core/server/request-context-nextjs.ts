/* Copyright (c) 2024-present Venky Corp. */

import { cookies, headers } from 'next/headers';
import type { CookieOptions, RequestContextProvider } from './request-context';

/**
 * Next.js implementation of RequestContextProvider.
 * Uses `next/headers` for cookie and header access.
 *
 * @example
 * import { nextjsRequestContext } from 'venky-core/server';
 * import { setRequestContextProvider } from 'venky-core/server';
 * setRequestContextProvider(nextjsRequestContext);
 */
export const nextjsRequestContext: RequestContextProvider = {
  async getCookie(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  },

  async setCookie(name: string, value: string, options?: CookieOptions): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(name, value, options);
  },

  async deleteCookie(name: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(name);
  },

  async getHeader(name: string): Promise<string | null> {
    const headersList = await headers();
    return headersList.get(name);
  },

  async getHeaders(): Promise<Headers> {
    return await headers();
  },
};
