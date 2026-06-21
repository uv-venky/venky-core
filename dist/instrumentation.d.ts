/**
 * Instrumentation hook that runs when the server starts.
 * OOM recorder and ping helpers use separate dynamic imports to stay Edge-safe.
 */
export declare function register(): Promise<void>;
export declare function onRequestError(err: Error, request: {
    path: string;
    method: string;
}): Promise<void>;
//# sourceMappingURL=instrumentation.d.ts.map