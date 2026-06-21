export interface InstrumentationPingOptions {
    firstDelayMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    fetchTimeoutMs?: number;
}
/**
 * Node-only instrumentation helpers. Call from `instrumentation.ts#register()`.
 * Uses dynamic imports only so this module stays Edge-safe when imported from instrumentation.
 */
export declare function registerCoreInstrumentation(options?: InstrumentationPingOptions): Promise<void>;
export declare function onCoreRequestError(err: Error, _request: {
    path: string;
    method: string;
}): Promise<void>;
//# sourceMappingURL=instrumentation.d.ts.map