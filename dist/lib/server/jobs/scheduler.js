import { getAllJobs } from './registry';
import logger from '../../../lib/core/server/logger';
import { CronExpressionParser } from 'cron-parser';
import { hashJobName, transaction, withAdvisoryLock, withBlockingAdvisoryLock } from '../../../lib/core/server/db';
import { getErrorMessage, UserError } from '../../../lib/core/common/error';
import { getNodeRunId, PREFIX } from '../../../lib/server/constants';
const MAX_DELAY = 2_147_483_647; // 2^31-1 ms — max safe setTimeout value
import { getConfig } from '../../../lib/core/server/config';
import { sseRegistry } from '../../../lib/sse/server/registry';
import { startHeartbeat, incrementRunningJobs, decrementRunningJobs, incrementJobsExecuted } from './heartbeat';
export function computeNextRun(expression, from = new Date()) {
  const interval = CronExpressionParser.parse(expression, {
    currentDate: from,
    strict: true,
  });
  return interval.next().toDate();
}
async function executeJobRun({ client, job, appId, node, logContext, trackHeartbeat = false }) {
  const { rows: runRows } = await client.query(
    `INSERT INTO ${PREFIX}job_history(job_name, node, started_at, app_id) VALUES ($1, $2, statement_timestamp(), $3) RETURNING job_run_id`,
    [job.name, node, appId],
  );
  const runId = runRows[0].job_run_id;
  sseRegistry.broadcast('job:status', { type: 'job_update', jobName: job.name, event: 'started', runId });
  let success = true;
  let errMsg = null;
  if (trackHeartbeat) {
    incrementRunningJobs();
  }
  try {
    await job.handler();
  } catch (err) {
    success = false;
    errMsg = getErrorMessage(err);
    logger.error(`${logContext} job ${job.name} failed: ${errMsg}`);
    logger.error(err);
  } finally {
    if (trackHeartbeat) {
      decrementRunningJobs();
      incrementJobsExecuted();
    }
  }
  sseRegistry.broadcast('job:status', {
    type: 'job_update',
    jobName: job.name,
    event: success ? 'completed' : 'failed',
    runId,
  });
  await client.query(
    `UPDATE ${PREFIX}job_history SET finished_at = statement_timestamp(), success = $2, error = $3 WHERE job_run_id = $1 AND app_id = $4`,
    [runId, success, errMsg, appId],
  );
  return { success, jobRunId: runId, error: errMsg };
}
async function scheduleJob(job) {
  const lockKey = hashJobName(job.name);
  const scheduleNext = async () => {
    await transaction(async (client) => {
      const config = getConfig('scheduleJob');
      const { appId, schedulerId } = config;
      const res = await client.query(
        `SELECT next_run FROM ${PREFIX}job_schedule WHERE job_name = $1 AND app_id = $2 AND scheduler_id = $3`,
        [job.name, appId, schedulerId],
      );
      let next;
      if (res.rowCount === 0) {
        next = computeNextRun(job.schedule);
        await client.query(
          `INSERT INTO ${PREFIX}job_schedule(job_name, schedule, next_run, app_id, scheduler_id) VALUES ($1, $2, $3, $4, $5)`,
          [job.name, job.schedule, next, appId, schedulerId],
        );
      } else {
        next = res.rows[0].next_run;
      }
      const delay = Math.max(next.getTime() - Date.now(), 0);
      if (delay > MAX_DELAY) {
        setTimeout(scheduleNext, MAX_DELAY);
      } else {
        setTimeout(runJob, delay);
      }
    });
  };
  const runJob = async () => {
    const nextRun = await withAdvisoryLock(lockKey, async (client) => {
      const config = getConfig('runJob');
      const { appId, schedulerId } = config;
      const { rows } = await client.query(
        `SELECT next_run FROM ${PREFIX}job_schedule WHERE job_name = $1 AND app_id = $2 AND scheduler_id = $3 FOR UPDATE`,
        [job.name, appId, schedulerId],
      );
      let due = rows[0].next_run;
      if (due.getTime() > Date.now()) {
        return due;
      }
      await executeJobRun({
        client,
        job,
        appId,
        node: getNodeRunId(),
        logContext: 'Scheduled',
        trackHeartbeat: true,
      });
      due = computeNextRun(job.schedule);
      await client.query(
        `UPDATE ${PREFIX}job_schedule SET next_run = $2, schedule = $3, last_run = statement_timestamp(), updated_at = statement_timestamp() WHERE job_name = $1 AND app_id = $4 AND scheduler_id = $5`,
        [job.name, due, job.schedule, appId, schedulerId],
      );
      return due;
    });
    if (nextRun) {
      await scheduleNext();
    } else {
      setTimeout(scheduleNext, 1000);
    }
  };
  await scheduleNext();
}
export async function startScheduler() {
  const jobs = await getAllJobs();
  logger.info(`Scheduling ${jobs.length} jobs`);
  for (const job of jobs) {
    scheduleJob(job);
  }
  startHeartbeat();
}
/** Run a registered job on demand. Waits on the job advisory lock if already running. */
export async function runJobByName(jobName, options) {
  const registeredJobs = await getAllJobs();
  const job = registeredJobs.find((j) => j.name === jobName);
  if (!job) {
    throw new UserError(`Job "${jobName}" not found in registry`);
  }
  const triggeredBy = options?.triggeredBy ?? `manual:${getNodeRunId()}`;
  return withBlockingAdvisoryLock(hashJobName(jobName), async (client) => {
    const config = getConfig('runJobByName');
    const { appId } = config;
    return executeJobRun({
      client,
      job,
      appId,
      node: triggeredBy,
      logContext: 'On-demand',
    });
  });
}
//# sourceMappingURL=scheduler.js.map
