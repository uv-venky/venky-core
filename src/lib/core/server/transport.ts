import { Writable } from 'node:stream';
// Lazy-loaded to break circular dep: db → logger → transport → db
const _executeQuery = () => import('@/lib/core/server/db').then((m) => m.executeQuery);
import type { LogContext } from '@/lib/core/server/logger';
import logger from '@/lib/core/server/logger';
import { PREFIX } from '@/lib/server/constants';
import { APP_VERSION } from '@/lib/app-info';
import { getConfig } from '@/lib/core/server/config';

interface LogEntry extends LogContext {
  level: number;
  msg: string;
  time: number;
  pid: string;
  hostname: string;
  sessionId?: string;
  apiName?: string;
  trackId?: string;
  dataSource?: string;
  userName?: string;
  appVersion?: string;
}

const BATCH_SIZE = 20;
const MAX_BATCH_SIZE = 200;
const FLUSH_INTERVAL_MS = 10_000;

export default async function () {
  let buffer: LogEntry[] = [];
  let firstLog = true;
  let appVersion: string | null = null;

  const flushBuffer = async () => {
    firstLog = false;
    if (buffer.length === 0) return;
    const bufferCopy = buffer;
    buffer = [];

    // Split into smaller batches if too large
    const batches = [];
    if (bufferCopy.length > MAX_BATCH_SIZE) {
      logger.warn(`Flushing ${bufferCopy.length} logs.`);
    }
    while (bufferCopy.length > 0) {
      batches.push(bufferCopy.splice(0, MAX_BATCH_SIZE));
    }

    for (const batch of batches) {
      if (batch.length > BATCH_SIZE) {
        logger.warn(`Flushing ${batch.length} logs.`);
      }

      const values: unknown[] = [];
      const placeholders: string[] = [];

      if (!appVersion) {
        appVersion = APP_VERSION;
      }
      const appId = getConfig('log').appId;
      batch.forEach((log, i) => {
        const base = i * 12;
        placeholders.push(
          `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`,
        );
        values.push(
          log.level,
          log.msg.slice(0, 1000),
          log.sessionId ?? null,
          log.apiName?.slice(0, 128) ?? null,
          log.trackId ?? null,
          log.dataSource?.slice(0, 40) ?? null,
          log.userName ?? null,
          log.hostname,
          log.pid,
          new Date(log.time),
          log.appVersion ?? appVersion,
          appId,
        );
      });

      const sql = `
        INSERT INTO ${PREFIX}logs (level, message, session_id, api_name, track_id, data_source, user_name, hostname, pid, created_at, app_version, app_id)
        VALUES ${placeholders.join(', ')}
      `;

      let retries = 3;
      while (retries > 0) {
        try {
          await (await _executeQuery())(sql, values);
          break;
        } catch (err) {
          console.error('[Pino-PG] Error inserting logs to DB:', err, values);
          retries--;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }
  };

  // Periodic flush
  setInterval(flushBuffer, firstLog ? 10000 : FLUSH_INTERVAL_MS);

  return new Writable({
    objectMode: true,
    async write(chunk: any, _enc, cb) {
      try {
        const log = JSON.parse(chunk.toString());

        if (!appVersion) {
          appVersion = APP_VERSION;
        }
        buffer.push({ ...log, appVersion: appVersion });

        if (buffer.length >= BATCH_SIZE) {
          await flushBuffer();
        }
      } catch (err) {
        console.error('[Pino-PG] Failed to process log:', err);
      }

      cb();
    },
  });
}
