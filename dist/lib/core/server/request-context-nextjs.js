/* Copyright (c) 2024-present Venky Corp. */
import { cookies, headers } from 'next/headers';
/**
 * Next.js implementation of RequestContextProvider.
 * Uses `next/headers` for cookie and header access.
 *
 * @example
 * import { nextjsRequestContext } from '../../../venky-exports/core/server/index.js';
 * import { setRequestContextProvider } from '../../../venky-exports/core/server/index.js';
 * setRequestContextProvider(nextjsRequestContext);
 */
export const nextjsRequestContext = {
    async getCookie(name) {
        const cookieStore = await cookies();
        return cookieStore.get(name)?.value;
    },
    async setCookie(name, value, options) {
        const cookieStore = await cookies();
        cookieStore.set(name, value, options);
    },
    async deleteCookie(name) {
        const cookieStore = await cookies();
        cookieStore.delete(name);
    },
    async getHeader(name) {
        const headersList = await headers();
        return headersList.get(name);
    },
    async getHeaders() {
        return await headers();
    },
};
//# sourceMappingURL=request-context-nextjs.js.map