/* Copyright (c) 2024-present Venky Corp. */

import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { getAllJobs } from '@/lib/server/jobs/registry';
import { computeNextRun, runJobByName, type RunJobByNameResult } from '@/lib/server/jobs/scheduler';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';
import os from 'node:os';

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

/** Describe a cron expression in human-readable form */
function describeCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  // 6-part = sec min hr dom mon dow, 5-part = min hr dom mon dow
  const hasSeconds = parts.length === 6;
  const sec = hasSeconds ? parts[0] : '0';
  const min = hasSeconds ? parts[1] : parts[0];
  const hr = hasSeconds ? parts[2] : parts[1];

  if (sec.startsWith('*/') && min === '*' && hr === '*') {
    return `Every ${sec.slice(2)}s`;
  }
  if (min.startsWith('*/') && hr === '*') {
    return `Every ${min.slice(2)} min`;
  }
  if (min !== '*' && hr !== '*' && !min.startsWith('*/') && !hr.startsWith('*/')) {
    return `Daily at ${hr}:${min.padStart(2, '0')}`;
  }
  if (min === '*' && hr === '*') {
    return 'Every minute';
  }
  return expression;
}

export async function getJobDashboardAction(client: PgPoolClient, _session: Session): Promise<JobDashboardResult> {
  const config = getConfig('getJobDashboard');
  const { appId, schedulerId } = config;
  const registeredJobs = await getAllJobs();

  // Get schedule data for all jobs
  const scheduleResult = await client.query<{
    job_name: string;
    next_run: Date | null;
    last_run: Date | null;
  }>(`SELECT job_name, next_run, last_run FROM ${PREFIX}job_schedule WHERE app_id = $1 AND scheduler_id = $2`, [
    appId,
    schedulerId,
  ]);
  const scheduleMap = new Map(scheduleResult.rows.map((r) => [r.job_name, r]));

  // Get latest history entry for each job (last run status)
  const lastRunResult = await client.query<{
    job_name: string;
    success: boolean | null;
    error: string | null;
    started_at: Date;
    finished_at: Date | null;
    duration_ms: number | null;
  }>(
    `SELECT DISTINCT ON (job_name)
       job_name, success, error, started_at, finished_at,
       EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000 AS duration_ms
     FROM ${PREFIX}job_history
     WHERE app_id = $1
     ORDER BY job_name, started_at DESC`,
    [appId],
  );
  const lastRunMap = new Map(lastRunResult.rows.map((r) => [r.job_name, r]));

  // Get currently running jobs (started but not finished)
  const runningResult = await client.query<{ job_name: string }>(
    `SELECT DISTINCT job_name FROM ${PREFIX}job_history WHERE finished_at IS NULL AND app_id = $1`,
    [appId],
  );
  const runningSet = new Set(runningResult.rows.map((r) => r.job_name));

  // Get 24h stats
  const stats24hResult = await client.query<{
    total_runs: number;
    failed_runs: number;
  }>(
    `SELECT
       COUNT(*)::int AS total_runs,
       COUNT(*) FILTER (WHERE success = false)::int AS failed_runs
     FROM ${PREFIX}job_history
     WHERE app_id = $1 AND started_at > NOW() - INTERVAL '24 hours' AND finished_at IS NOT NULL`,
    [appId],
  );
  const stats24h = stats24hResult.rows[0] ?? { total_runs: 0, failed_runs: 0 };

  const jobs: JobDashboardRow[] = registeredJobs.map((job) => {
    const schedule = scheduleMap.get(job.name);
    const lastRun = lastRunMap.get(job.name);
    let nextRunStr: string | null = null;
    try {
      const nextRunDate = schedule?.next_run ?? computeNextRun(job.schedule);
      nextRunStr = nextRunDate.toISOString();
    } catch {
      // invalid cron, skip
    }

    return {
      name: job.name,
      schedule: job.schedule,
      scheduleDescription: describeCron(job.schedule),
      nextRun: nextRunStr,
      lastRun: schedule?.last_run?.toISOString() ?? null,
      lastRunSuccess: lastRun?.success ?? null,
      lastRunError: lastRun?.error ?? null,
      lastRunDurationMs: lastRun?.duration_ms != null ? Math.round(lastRun.duration_ms) : null,
      isRunning: runningSet.has(job.name),
    };
  });

  const totalRuns24h = stats24h.total_runs;
  const failedRuns24h = stats24h.failed_runs;

  return {
    jobs,
    summary: {
      total: registeredJobs.length,
      running: runningSet.size,
      failed24h: failedRuns24h,
      successRate24h: totalRuns24h > 0 ? Math.round(((totalRuns24h - failedRuns24h) / totalRuns24h) * 100) : 100,
    },
  };
}

export async function getJobHistoryAction(
  client: PgPoolClient,
  _session: Session,
  jobName: string,
): Promise<JobHistoryResult> {
  const config = getConfig('getJobHistory');
  const { appId } = config;

  const result = await client.query<{
    job_run_id: number;
    job_name: string;
    node: string;
    started_at: Date;
    finished_at: Date | null;
    success: boolean | null;
    error: string | null;
    duration_ms: number | null;
  }>(
    `SELECT
       job_run_id, job_name, node, started_at, finished_at, success, error,
       EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000 AS duration_ms
     FROM ${PREFIX}job_history
     WHERE job_name = $1 AND app_id = $2
     ORDER BY started_at DESC
     LIMIT 20`,
    [jobName, appId],
  );

  return {
    runs: result.rows.map((r) => ({
      jobRunId: r.job_run_id,
      jobName: r.job_name,
      node: r.node,
      startedAt: r.started_at.toISOString(),
      finishedAt: r.finished_at?.toISOString() ?? null,
      success: r.success,
      error: r.error,
      durationMs: r.duration_ms != null ? Math.round(r.duration_ms) : null,
    })),
  };
}

export async function triggerJobAction(
  _client: PgPoolClient,
  session: Session,
  jobName: string,
): Promise<TriggerJobResult> {
  return runJobByName(jobName, {
    triggeredBy: `manual:${session.user.userName}@${os.hostname()}`,
  });
}

export async function getSchedulerNodesAction(client: PgPoolClient, _session: Session): Promise<SchedulerNodesResult> {
  const config = getConfig('getSchedulerNodes');
  const { appId } = config;

  const result = await client.query<{
    node_id: string;
    scheduler_id: string;
    pid: number;
    started_at: Date;
    last_seen_at: Date;
    os_platform: string | null;
    node_version: string | null;
    cpu_usage: number | null;
    memory_mb: number | null;
    jobs_scheduled: number;
    jobs_running: number;
    jobs_executed: number;
  }>(
    `SELECT node_id, scheduler_id, pid, started_at, last_seen_at,
            os_platform, node_version, cpu_usage, memory_mb,
            jobs_scheduled, jobs_running, jobs_executed
     FROM ${PREFIX}scheduler_nodes
     WHERE app_id = $1 AND last_seen_at > NOW() - INTERVAL '24 hours'
     ORDER BY last_seen_at DESC`,
    [appId],
  );

  const nodes: SchedulerNodeRow[] = result.rows.map((r) => {
    const lastSeen = r.last_seen_at.getTime();
    const now = Date.now();
    const diffMin = (now - lastSeen) / 60_000;

    let status: 'online' | 'offline' | 'stale';
    if (diffMin <= 3) {
      status = 'online';
    } else if (diffMin <= 60) {
      status = 'offline';
    } else {
      status = 'stale';
    }

    return {
      nodeId: r.node_id,
      schedulerId: r.scheduler_id,
      pid: r.pid,
      status,
      startedAt: r.started_at.toISOString(),
      lastSeenAt: r.last_seen_at.toISOString(),
      osPlatform: r.os_platform,
      nodeVersion: r.node_version,
      cpuUsage: r.cpu_usage,
      memoryMb: r.memory_mb,
      jobsScheduled: r.jobs_scheduled,
      jobsRunning: r.jobs_running,
      jobsExecuted: r.jobs_executed,
    };
  });

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const offlineCount = nodes.filter((n) => n.status !== 'online').length;

  return { nodes, onlineCount, offlineCount };
}
