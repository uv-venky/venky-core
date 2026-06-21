/**
 * RequestContext provides a framework-agnostic interface for accessing
 * HTTP request/response primitives (cookies, headers).
 *
 * This allows core auth and server logic to work across different frameworks
 * (Next.js, TanStack Start, etc.) by injecting framework-specific adapters.
 *
 * Usage:
 *   - Next.js projects: Defaults to `nextjsRequestContext` (set automatically by initializeServer)
 *   - TanStack Start projects: Pass a Vinxi-based adapter via `requestContextProvider` in ServerConfig
 */
export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    expires?: Date;
    path?: string;
}
export interface RequestContextProvider {
    /** Get a cookie value by name */
    getCookie(name: string): Promise<string | undefined>;
    /** Set a cookie */
    setCookie(name: string, value: string, options?: CookieOptions): Promise<void>;
    /** Delete a cookie */
    deleteCookie(name: string): Promise<void>;
    /** Get a header value by name */
    getHeader(name: string): Promise<string | null>;
    /** Get all headers as a Web Standard Headers object */
    getHeaders(): Promise<Headers>;
}
declare global {
    var _$venkyRequestContextProvider: RequestContextProvider | null | undefined;
}
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
export declare function setRequestContextProvider(provider: RequestContextProvider): void;
/**
 * Get the current request context provider.
 * Throws if no provider has been set.
 */
export declare function getRequestContext(name: string): RequestContextProvider;
//# sourceMappingURL=request-context.d.ts.map