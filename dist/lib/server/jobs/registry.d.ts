export interface JobEntry {
    name: string;
    schedule: string;
    handler: () => Promise<void> | void;
}
declare global {
    var _$venkyJobs: JobEntry[] | undefined;
}
export declare function getAllJobs(): Promise<JobEntry[]>;
export declare function addJobs(jobs: JobEntry[]): Promise<void>;
//# sourceMappingURL=registry.d.ts.map