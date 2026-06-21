/**
 * Installs the OOM crash-dump recorder as early as possible.
 * Call from `instrumentation.ts#register()` via dynamic import — keep separate
 * from registerCoreInstrumentation so Next.js Edge instrumentation bundling
 * does not pull node:fs/process.on into the ping helper module graph.
 */
export declare function installCoreOomRecorder(): Promise<void>;
//# sourceMappingURL=oom-recorder.d.ts.map
