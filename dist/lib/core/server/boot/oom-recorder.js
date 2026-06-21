/* Copyright (c) 2024-present Venky Corp. */
/**
 * Installs the OOM crash-dump recorder as early as possible.
 * Call from `instrumentation.ts#register()` via dynamic import — keep separate
 * from registerCoreInstrumentation so Next.js Edge instrumentation bundling
 * does not pull node:fs/process.on into the ping helper module graph.
 */
export async function installCoreOomRecorder() {
    const { installOomRecorder } = await import('../../../../lib/server/oom-recorder');
    installOomRecorder();
}
//# sourceMappingURL=oom-recorder.js.map