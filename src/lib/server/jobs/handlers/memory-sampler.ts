/* Copyright (c) 2024-present Venky Corp. */

import os from 'node:os';
import { newClient, getPool, getReadOnlyPool } from '@/lib/core/server/db';
import { getConfig } from '@/lib/core/server/config';
import { getNodeRunId, PREFIX } from '@/lib/server/constants';
import logger from '@/lib/core/server/logger';
import { sseRegistry } from '@/lib/sse/server/registry';
import { drainCrashDumps, type CrashDump } from '@/lib/server/oom-recorder';

const nodeId = getNodeRunId();
const RETENTION_DAYS = 30;
const SWEEP_EVERY_N_RUNS = 12; // at the default 5-min schedule => prune ~once/hour

let runCount = 0;

function mb(bytes: number): number {
  return Math.round(bytes / 1024 / 1024);
}

function getCpuUsagePct(): number {
  const load = os.loadavg()[0];
  const count = os.cpus().length || 1;
  return Number(((load / count) * 100).toFixed(2));
}

interface SampleRow {
  appId: string;
  uptimeSec: number;
  kind: 'periodic' | 'startup' | 'crash';
  rssMb: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  arrayBuffersMb: number;
  cpuUsagePct: number | null;
  pgWritable: { total: number; idle: number; waiting: number } | null;
  pgReadonly: { total: number; idle: number; waiting: number } | null;
  sseClients: number | null;
  ts?: string;
  pidOverride?: number;
  extra?: unknown;
}

function buildCurrent(appId: string, kind: 'periodic' | 'startup' = 'periodic'): SampleRow {
  const mem = process.memoryUsage();

  let pgWritable: SampleRow['pgWritable'] = null;
  let pgReadonly: SampleRow['pgReadonly'] = null;
  try {
    const wp = getPool();
    pgWritable = { total: wp.totalCount, idle: wp.idleCount, waiting: wp.waitingCount };
  } catch {
    // pool not initialized yet
  }
  try {
    const rp = getReadOnlyPool();
    pgReadonly = { total: rp.totalCount, idle: rp.idleCount, waiting: rp.waitingCount };
  } catch {
    // pool not initialized yet
  }

  let sseClients: number | null = null;
  try {
    sseClients = sseRegistry.getDebugStats().totalClients;
  } catch {
    // registry not loaded in some entrypoints
  }

  return {
    appId,
    uptimeSec: Math.round(process.uptime()),
    kind,
    rssMb: mb(mem.rss),
    heapUsedMb: mb(mem.heapUsed),
    heapTotalMb: mb(mem.heapTotal),
    externalMb: mb(mem.external),
    arrayBuffersMb: mb(mem.arrayBuffers),
    cpuUsagePct: getCpuUsagePct(),
    pgWritable,
    pgReadonly,
    sseClients,
  };
}

function buildFromCrash(appId: string, dump: CrashDump): SampleRow {
  return {
    appId,
    uptimeSec: dump.uptimeSec,
    kind: 'crash',
    rssMb: mb(dump.mem.rss),
    heapUsedMb: mb(dump.mem.heapUsed),
    heapTotalMb: mb(dump.mem.heapTotal),
    externalMb: mb(dump.mem.external),
    arrayBuffersMb: mb(dump.mem.arrayBuffers),
    cpuUsagePct: null,
    pgWritable: null,
    pgReadonly: null,
    sseClients: null,
    ts: dump.ts,
    pidOverride: dump.pid,
    extra: { reason: dump.reason, error: dump.error },
  };
}

const INSERT_SQL = `
  INSERT INTO ${PREFIX}memory_samples (
    app_id, node_id, pid, ts, uptime_sec, sample_kind,
    rss_mb, heap_used_mb, heap_total_mb, external_mb, array_buffers_mb,
    cpu_usage_pct,
    pg_writable_total, pg_writable_idle, pg_writable_waiting,
    pg_readonly_total, pg_readonly_idle, pg_readonly_waiting,
    sse_clients, extra
  ) VALUES (
    $1, $2, $3, COALESCE($4::timestamptz, NOW()), $5, $6,
    $7, $8, $9, $10, $11,
    $12,
    $13, $14, $15,
    $16, $17, $18,
    $19, $20
  )
`;

async function insertRow(client: import('@/lib/core/server/db').PgPoolClient, row: SampleRow): Promise<void> {
  await client.query(INSERT_SQL, [
    row.appId,
    nodeId,
    row.pidOverride ?? process.pid,
    row.ts ?? null,
    row.uptimeSec,
    row.kind,
    row.rssMb,
    row.heapUsedMb,
    row.heapTotalMb,
    row.externalMb,
    row.arrayBuffersMb,
    row.cpuUsagePct,
    row.pgWritable?.total ?? null,
    row.pgWritable?.idle ?? null,
    row.pgWritable?.waiting ?? null,
    row.pgReadonly?.total ?? null,
    row.pgReadonly?.idle ?? null,
    row.pgReadonly?.waiting ?? null,
    row.sseClients,
    row.extra == null ? null : JSON.stringify(row.extra),
  ]);
}

/**
 * Job entry point: write one current sample, recover any leftover crash
 * dumps, and (every Nth run) prune rows older than RETENTION_DAYS.
 *
 * Uses a dedicated short-lived connection (newClient + finally release)
 * rather than the long-held `transaction` wrapper so a slow prune query
 * can't pin a pool slot.
 */
export async function sampleMemory(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return;

  runCount++;
  const appId = getConfig('sampleMemory').appId;
  const client = await newClient();
  try {
    await insertRow(client, buildCurrent(appId));

    const dumps = drainCrashDumps();
    for (const dump of dumps) {
      try {
        await insertRow(client, buildFromCrash(appId, dump));
      } catch (err) {
        logger.error('memory-sampler: failed to insert crash row', { err });
      }
    }
    if (dumps.length > 0) {
      logger.warn('memory-sampler: recovered crash dumps from disk', { count: dumps.length });
    }

    if (runCount % SWEEP_EVERY_N_RUNS === 0) {
      const res = await client.query(
        `DELETE FROM ${PREFIX}memory_samples
          WHERE app_id = $1 AND ts < NOW() - ($2 || ' days')::interval`,
        [appId, String(RETENTION_DAYS)],
      );
      if (res.rowCount && res.rowCount > 0) {
        logger.info('memory-sampler: pruned old rows', { deleted: res.rowCount, retentionDays: RETENTION_DAYS });
      }
    }
  } catch (err) {
    logger.error('memory-sampler: sample insert failed', { err });
  } finally {
    client.release();
  }
}

/**
 * One-shot boot sample written with sample_kind='startup'. Called from server
 * startup so every process restart leaves a marker row and the boot baseline
 * boot baseline shows up in trends immediately (the periodic job won't fire
 * for up to 5 minutes after boot). Failures are swallowed — we never want
 * sampling to block or break startup.
 */
export async function recordStartupSample(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return;

  const appId = getConfig('sampleMemory').appId;
  let client: Awaited<ReturnType<typeof newClient>> | null = null;
  try {
    client = await newClient();
    await insertRow(client, buildCurrent(appId, 'startup'));
  } catch (err) {
    logger.error('memory-sampler: startup sample failed', { err });
  } finally {
    client?.release();
  }
}
