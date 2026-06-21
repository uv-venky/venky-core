/* Copyright (c) 2024-present Venky Corp. */
import { getAllJobs } from '../../../../../lib/server/jobs/registry';
import { computeNextRun, runJobByName } from '../../../../../lib/server/jobs/scheduler';
import { PREFIX } from '../../../../../lib/server/constants';
import { getConfig } from '../../../../../lib/core/server/config';
import os from 'node:os';
/** Describe a cron expression in human-readable form */
function describeCron(expression) {
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
export async function getJobDashboardAction(client, _session) {
    const config = getConfig('getJobDashboard');
    const { appId, schedulerId } = config;
    const registeredJobs = await getAllJobs();
    // Get schedule data for all jobs
    const scheduleResult = await client.query(`SELECT job_name, next_run, last_run FROM ${PREFIX}job_schedule WHERE app_id = $1 AND scheduler_id = $2`, [
        appId,
        schedulerId,
    ]);
    const scheduleMap = new Map(scheduleResult.rows.map((r) => [r.job_name, r]));
    // Get latest history entry for each job (last run status)
    const lastRunResult = await client.query(`SELECT DISTINCT ON (job_name)
       job_name, success, error, started_at, finished_at,
       EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000 AS duration_ms
     FROM ${PREFIX}job_history
     WHERE app_id = $1
     ORDER BY job_name, started_at DESC`, [appId]);
    const lastRunMap = new Map(lastRunResult.rows.map((r) => [r.job_name, r]));
    // Get currently running jobs (started but not finished)
    const runningResult = await client.query(`SELECT DISTINCT job_name FROM ${PREFIX}job_history WHERE finished_at IS NULL AND app_id = $1`, [appId]);
    const runningSet = new Set(runningResult.rows.map((r) => r.job_name));
    // Get 24h stats
    const stats24hResult = await client.query(`SELECT
       COUNT(*)::int AS total_runs,
       COUNT(*) FILTER (WHERE success = false)::int AS failed_runs
     FROM ${PREFIX}job_history
     WHERE app_id = $1 AND started_at > NOW() - INTERVAL '24 hours' AND finished_at IS NOT NULL`, [appId]);
    const stats24h = stats24hResult.rows[0] ?? { total_runs: 0, failed_runs: 0 };
    const jobs = registeredJobs.map((job) => {
        const schedule = scheduleMap.get(job.name);
        const lastRun = lastRunMap.get(job.name);
        let nextRunStr = null;
        try {
            const nextRunDate = schedule?.next_run ?? computeNextRun(job.schedule);
            nextRunStr = nextRunDate.toISOString();
        }
        catch {
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
export async function getJobHistoryAction(client, _session, jobName) {
    const config = getConfig('getJobHistory');
    const { appId } = config;
    const result = await client.query(`SELECT
       job_run_id, job_name, node, started_at, finished_at, success, error,
       EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000 AS duration_ms
     FROM ${PREFIX}job_history
     WHERE job_name = $1 AND app_id = $2
     ORDER BY started_at DESC
     LIMIT 20`, [jobName, appId]);
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
export async function triggerJobAction(_client, session, jobName) {
    return runJobByName(jobName, {
        triggeredBy: `manual:${session.user.userName}@${os.hostname()}`,
    });
}
export async function getSchedulerNodesAction(client, _session) {
    const config = getConfig('getSchedulerNodes');
    const { appId } = config;
    const result = await client.query(`SELECT node_id, scheduler_id, pid, started_at, last_seen_at,
            os_platform, node_version, cpu_usage, memory_mb,
            jobs_scheduled, jobs_running, jobs_executed
     FROM ${PREFIX}scheduler_nodes
     WHERE app_id = $1 AND last_seen_at > NOW() - INTERVAL '24 hours'
     ORDER BY last_seen_at DESC`, [appId]);
    const nodes = result.rows.map((r) => {
        const lastSeen = r.last_seen_at.getTime();
        const now = Date.now();
        const diffMin = (now - lastSeen) / 60_000;
        let status;
        if (diffMin <= 3) {
            status = 'online';
        }
        else if (diffMin <= 60) {
            status = 'offline';
        }
        else {
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
//# sourceMappingURL=action.js.map