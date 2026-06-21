import type { JobDashboardRow } from '../action';
interface JobTableProps {
    jobs: JobDashboardRow[];
    onTriggerJob: (jobName: string) => Promise<void>;
}
export declare function JobTable({ jobs, onTriggerJob }: JobTableProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=job-table.d.ts.map