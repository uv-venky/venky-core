export declare function computeNextRun(expression: string, from?: Date): Date;
export declare function startScheduler(): Promise<void>;
export interface RunJobByNameResult {
    success: boolean;
    jobRunId: number | null;
    error: string | null;
}
export interface RunJobByNameOptions {
    /** Stored in job_history.node for audit. Default: `manual:${getNodeRunId()}` */
    triggeredBy?: string;
}
/** Run a registered job on demand. Waits on the job advisory lock if already running. */
export declare function runJobByName(jobName: string, options?: RunJobByNameOptions): Promise<RunJobByNameResult>;
//# sourceMappingURL=scheduler.d.ts.map