export declare function getErrorMessage(e: unknown): string;
export declare class AbortError extends Error {
    constructor();
}
/** Stable across bundles/realms so instanceof still works when duplicate venky-core copies are loaded. */
export declare const USER_ERROR_BRAND: unique symbol;
export declare class UserError extends Error {
    readonly [USER_ERROR_BRAND] = true;
    constructor(message: string);
}
/** Detect UserError even when instanceof fails (e.g. Next.js duplicate module instances). */
export declare function isUserError(error: unknown): error is UserError;
/**
 * Checks if an error is due to an aborted/cancelled request.
 * This commonly happens during Playwright tests when navigating between pages
 * before API requests complete.
 */
export declare function isAbortedRequestError(error: unknown): boolean;
export interface ErrorResponse {
    status: 'ERROR';
    message: string;
}
export declare function isErrorResponse(value: unknown): value is ErrorResponse;
export type APIResponse<T> = T | ErrorResponse;
//# sourceMappingURL=error.d.ts.map