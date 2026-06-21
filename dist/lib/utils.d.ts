import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Extract a meaningful error message from various error types.
 * Handles Error instances, objects with message/error properties, strings,
 * and nested error structures common in AI SDKs.
 * Note: This is synchronous - use getErrorMessageAsync for Promise errors.
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Async version that handles Promise errors by awaiting them first.
 * Use this in catch blocks where the error might be a Promise.
 */
export declare function getErrorMessageAsync(error: unknown): Promise<string>;
//# sourceMappingURL=utils.d.ts.map
