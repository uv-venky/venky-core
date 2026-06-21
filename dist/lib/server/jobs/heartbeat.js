/* Copyright (c) 2024-present Venky Corp. */
import os from 'node:os';
import { transaction } from '../../../lib/core/server/db';
import { getConfig } from '../../../lib/core/server/config';
import { getNodeRunId, PREFIX } from '../../../lib/server/constants';
import { getAllJobs } from './registry';
import logger from '../../../lib/core/server/logger';
const nodeId = getNodeRunId();
let jobsRunning = 0;
let jobsExecuted = 0;
let _heartbeatTimer = null;
function getCpuUsage() {
  const cpus = os.cpus();
  if (cpus.length === 0) return 0;
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    const { user, nice, sys, idle, irq } = cpu.times;
    totalTick += user + nice + sys + idle + irq;
    totalIdle += idle;
  }
  if (totalTick === 0) return 0;
  return Math.round((1 - totalIdle / totalTick) * 100);
}
export async function sendHeartbeat() {
  try {
    const config = getConfig('heartbeat');
    const { appId, schedulerId } = config;
    const cpuUsage = getCpuUsage();
    const memoryMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
    const jobsScheduled = (await getAllJobs()).length;
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO ${PREFIX}scheduler_nodes
  (app_id, node_id, scheduler_id, pid, started_at, last_seen_at, os_platform, node_version, cpu_usage, memory_mb, jobs_scheduled, jobs_running, jobs_executed)
VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (app_id, node_id, pid) DO UPDATE SET
  last_seen_at = NOW(),
  scheduler_id = EXCLUDED.scheduler_id,
  cpu_usage = EXCLUDED.cpu_usage,
  memory_mb = EXCLUDED.memory_mb,
  jobs_scheduled = EXCLUDED.jobs_scheduled,
  jobs_running = EXCLUDED.jobs_running,
  jobs_executed = EXCLUDED.jobs_executed`,
        [
          appId,
          nodeId,
          schedulerId,
          process.pid,
          os.platform(),
          process.version,
          cpuUsage,
          memoryMb,
          jobsScheduled,
          jobsRunning,
          jobsExecuted,
        ],
      );
    });
  } catch (err) {
    logger.error('Heartbeat failed:', err);
  }
}
const HEARTBEAT_INTERVAL_MS = 60_000;
export function startHeartbeat() {
  if (_heartbeatTimer) return;
  sendHeartbeat();
  _heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
}
export function incrementJobsExecuted() {
  jobsExecuted++;
}
export function incrementRunningJobs() {
  jobsRunning++;
}
export function decrementRunningJobs() {
  jobsRunning = Math.max(0, jobsRunning - 1);
}
//# sourceMappingURL=heartbeat.js.map
