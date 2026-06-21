export interface CrashDump {
    ts: string;
    pid: number;
    uptimeSec: number;
    reason: 'uncaughtException' | 'unhandledRejection' | 'exit';
    error?: {
        message: string;
        stack?: string;
    } | {
        code: number;
    };
    mem: NodeJS.MemoryUsage;
}
export declare function getOomDir(): string;
export declare function installOomRecorder(): void;
/** Read and delete all crash dumps. Returns the parsed dumps. */
export declare function drainCrashDumps(): CrashDump[];
//# sourceMappingURL=oom-recorder.d.ts.map