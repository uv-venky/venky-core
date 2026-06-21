/* Copyright (c) 2024-present Venky Corp. */
/**
 * Instrumentation hook that runs when the server starts.
 * OOM recorder and ping helpers use separate dynamic imports to stay Edge-safe.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { installCoreOomRecorder } = await import('./lib/core/server/boot/oom-recorder');
        await installCoreOomRecorder();
        const { registerCoreInstrumentation } = await import('./lib/core/server/boot/instrumentation');
        await registerCoreInstrumentation();
    }
}
export async function onRequestError(err, request) {
    const { onCoreRequestError } = await import('./lib/core/server/boot/instrumentation');
    await onCoreRequestError(err, request);
}
//# sourceMappingURL=instrumentation.js.map