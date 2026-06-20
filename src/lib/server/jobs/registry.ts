export interface JobEntry {
  name: string;
  schedule: string;
  handler: () => Promise<void> | void;
}

function lazyJobHandler<const K extends string>(
  loadModule: () => Promise<Record<K, () => void | Promise<void>>>,
  exportName: K,
): () => Promise<void> {
  return async () => {
    const mod = await loadModule();
    await Promise.resolve(mod[exportName]());
  };
}

/*
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └─ day of week (0-7, 1L-7L) (0 or 7 is Sun)
│    │    │    │    └────── month (1-12, JAN-DEC)
│    │    │    └─────────── day of month (1-31, L)
│    │    └──────────────── hour (0-23)
│    └───────────────────── minute (0-59)
└────────────────────────── second (0-59, optional)
*/

declare global {
  var _$venkyJobs: JobEntry[] | undefined;
}

let registryInitPromise: Promise<void> | undefined;

function buildDefaultJobs(): JobEntry[] {
  const jobs: JobEntry[] = [
    {
      name: 'logCleanup',
      schedule: '10 5 2 * * *',
      handler: lazyJobHandler(() => import('./handlers/log-cleanup'), 'cleanOldLogs'),
    }, // 2:05 AM every day
    {
      name: 'sendEmails',
      schedule: '1 * * * * *',
      handler: lazyJobHandler(() => import('./handlers/send-email'), 'sendQueuedEmails'),
    }, // every minute
    {
      name: 'archiveSessions',
      schedule: '10 15 2 * * *',
      handler: lazyJobHandler(() => import('./handlers/archive-sessions'), 'archiveSessions'),
    }, // 2:15 AM every day
    {
      name: 'cleanUserActivity',
      schedule: '15 10 2 * * *',
      handler: lazyJobHandler(() => import('./handlers/user-activity-cleanup'), 'cleanUserActivity'),
    }, // 2:10 AM every day
    {
      name: 'cleanupRateLimiterData',
      schedule: '5 */5 * * * *',
      handler: lazyJobHandler(() => import('./handlers/rate-limiter-cleanup'), 'cleanupRateLimiterData'),
    }, // every 5 minutes
    {
      name: 'cleanupTtlStore',
      schedule: '5 */5 * * * *',
      handler: lazyJobHandler(() => import('./handlers/ttl-store-cleanup'), 'cleanupTtlStore'),
    }, // every 5 minutes
    {
      name: 'monitorSystem',
      schedule: '1 * * * * *',
      handler: lazyJobHandler(() => import('./handlers/system-monitor'), 'monitorSystemUsage'),
    }, // every minute
  ];
  return jobs;
}

/** Loads config + logger and builds the default job list on first use. */
async function ensureJobsRegistryInitialized(): Promise<void> {
  if (globalThis._$venkyJobs) {
    return;
  }
  registryInitPromise ??= (async () => {
    globalThis._$venkyJobs = buildDefaultJobs();
  })().catch((err) => {
    registryInitPromise = undefined;
    throw err;
  });
  await registryInitPromise;
}

export async function getAllJobs(): Promise<JobEntry[]> {
  await ensureJobsRegistryInitialized();
  return globalThis._$venkyJobs ?? [];
}

export async function addJobs(jobs: JobEntry[]): Promise<void> {
  await ensureJobsRegistryInitialized();
  const existingJobs = globalThis._$venkyJobs ?? [];
  const overrideByName = new Map(jobs.map((j) => [j.name, j]));
  const overridden = existingJobs.map((j) => overrideByName.get(j.name) ?? j);
  const existingNames = new Set(existingJobs.map((j) => j.name));
  const appended = jobs.filter((j) => !existingNames.has(j.name));
  globalThis._$venkyJobs = [...overridden, ...appended];
}
