import type { PgPoolClient } from '../../../../../lib/core/server/db';
import type { Session } from '../../../../../auth';
import { type RunJobByNameResult } from '../../../../../lib/server/jobs/scheduler';
export interface JobDashboardRow {
  name: string;
  schedule: string;
  scheduleDescription: string;
  nextRun: string | null;
  lastRun: string | null;
  lastRunSuccess: boolean | null;
  lastRunError: string | null;
  lastRunDurationMs: number | null;
  isRunning: boolean;
}
export interface JobDashboardSummary {
  total: number;
  running: number;
  failed24h: number;
  successRate24h: number;
}
export interface JobDashboardResult {
  jobs: JobDashboardRow[];
  summary: JobDashboardSummary;
}
export interface JobHistoryRow {
  jobRunId: number;
  jobName: string;
  node: string;
  startedAt: string;
  finishedAt: string | null;
  success: boolean | null;
  error: string | null;
  durationMs: number | null;
}
export interface JobHistoryResult {
  runs: JobHistoryRow[];
}
export type TriggerJobResult = RunJobByNameResult;
export interface SchedulerNodeRow {
  nodeId: string;
  schedulerId: string;
  pid: number;
  status: 'online' | 'offline' | 'stale';
  startedAt: string;
  lastSeenAt: string;
  osPlatform: string | null;
  nodeVersion: string | null;
  cpuUsage: number | null;
  memoryMb: number | null;
  jobsScheduled: number;
  jobsRunning: number;
  jobsExecuted: number;
}
export interface SchedulerNodesResult {
  nodes: SchedulerNodeRow[];
  onlineCount: number;
  offlineCount: number;
}
export declare function getJobDashboardAction(client: PgPoolClient, _session: Session): Promise<JobDashboardResult>;
export declare function getJobHistoryAction(
  client: PgPoolClient,
  _session: Session,
  jobName: string,
): Promise<JobHistoryResult>;
export declare function triggerJobAction(
  _client: PgPoolClient,
  session: Session,
  jobName: string,
): Promise<TriggerJobResult>;
export declare function getSchedulerNodesAction(client: PgPoolClient, _session: Session): Promise<SchedulerNodesResult>;
//# sourceMappingURL=action.d.ts.map
