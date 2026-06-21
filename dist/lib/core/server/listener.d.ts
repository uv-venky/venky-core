export declare const RETRY_ATTEMPTS = 30;
export declare const RETRY_BASE_DELAY = 1;
export declare const RETRY_MAX_DELAY = 120;
/**
 * Calculates a timeout in seconds based on the retry attempt number.
 * Uses exponential back-off and caps the delay at a specified maximum.
 *
 * @param attempt - The current retry attempt number (starting from 0)
 * @param baseDelay - The starting delay in seconds (default is 1 second)
 * @param maxDelay - The maximum delay in seconds (default is 60 seconds)
 * @returns The calculated timeout in seconds.
 */
export declare function getRetryTimeout(attempt: number): number;
export declare function startListener(): Promise<void>;
export declare function shutdownListener(): Promise<void>;
//# sourceMappingURL=listener.d.ts.map
