'use server';

import { executeQuery } from '@/lib/core/server/db';
import logger from '@/lib/core/server/logger';
import { PREFIX } from '@/lib/server/constants';
import { APP_VERSION } from '@/lib/app-info';
import { getConfig } from '@/lib/core/server/config';
import type { Activity } from '../common/types/Activity';
import type { AccessDeniedResourceType } from '../common/types/AccessDenied';

const FLUSH_INTERVAL_MS = process.env.NODE_ENV === 'development' ? 1000 : 10_000;

// Use a global variable to ensure the buffer is shared across all instances
declare global {
  var _$activityBuffer: Activity[];
  var _$activityFlushInterval: NodeJS.Timeout | undefined;
  var _$activityFirstLog: boolean;
}

function truncateString(str?: string | null, maxLength = 40): string | null {
  if (str == null) return null;
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

async function flushBuffer(): Promise<void> {
  if (global._$activityBuffer.length === 0) return;

  const batch = global._$activityBuffer;
  global._$activityBuffer = [];
  global._$activityFirstLog = false;

  const values: unknown[] = [];
  const placeholders: string[] = [];

  if (batch.length > 200) {
    logger.warn(`Flushing ${batch.length} activities.`);
  }

  const appId = getConfig('logActivity').appId;
  const MAX_METADATA_JSON_LENGTH = 500_000;

  batch.forEach((activity, i) => {
    const base = i * 14;
    placeholders.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14})`,
    );
    let meta: string | null = null;
    if (activity.metadata) {
      try {
        const s = JSON.stringify(activity.metadata);
        if (s.length > MAX_METADATA_JSON_LENGTH) {
          logger.warn('Activity metadata JSON too large; truncating for DB', { length: s.length });
          meta = `${s.slice(0, MAX_METADATA_JSON_LENGTH)}\n…[truncated]`;
        } else {
          meta = s;
        }
      } catch (e) {
        logger.warn('Activity metadata JSON.stringify failed; using placeholder', { error: String(e) });
        meta = '{"error":"metadata_serialization_failed"}';
      }
    }
    values.push(
      activity.userName,
      truncateString(activity.eventType, 40),
      truncateString(activity.eventId, 128),
      meta,
      truncateString(activity.pageUrl, 128),
      truncateString(activity.dataSource, 40),
      activity.elapsedTimeMs ?? null,
      activity.sessionId ?? null,
      activity.rowCount ?? null,
      activity.apiName ?? null,
      activity.trackId ?? logger.context.getStore()?.trackId ?? null,
      activity.appVersion ?? APP_VERSION,
      appId,
      activity.domainId ?? null,
    );
  });

  const sql = `
    INSERT INTO ${PREFIX}user_activity (
      user_name,
      event_type,
      event_id,
      metadata,
      page_url,
      data_source,
      elapsed_time_ms,
      session_id,
      row_count,
      api_name,
      track_id,
      app_version,
      app_id,
      domain_id
    ) VALUES ${placeholders.join(', ')}
  `;

  let retries = 3;
  while (retries > 0) {
    try {
      await executeQuery(sql, values);
      break;
    } catch (err) {
      console.error('[Activity] Error inserting activities to DB:', err);
      retries--;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}

export async function shutdownActivityBuffer() {
  logger.info('Cleaning up activity buffer', process.pid);
  if (global._$activityFlushInterval) {
    clearInterval(global._$activityFlushInterval);
    global._$activityFlushInterval = undefined;
    // Ensure we flush any remaining activities before exit with timeout
    try {
      const flushPromise = flushBuffer();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Activity flush timeout')), 3000),
      );

      await Promise.race([flushPromise, timeoutPromise]);
    } catch (err) {
      console.error('[Activity] Error flushing activities on process exit:', err);
    }
  }
}

export async function initActivityBuffer() {
  // Initialize globals if they don't exist
  if (!global._$activityBuffer) {
    logger.info('Initializing activity buffer.', `PID: ${process.pid}`);
    global._$activityBuffer = [];
    global._$activityFirstLog = true;
    global._$activityFlushInterval = setInterval(flushBuffer, global._$activityFirstLog ? 10000 : FLUSH_INTERVAL_MS);

    // Ensure cleanup on process exit
    // if (typeof process !== 'undefined') {
    //   process.on('SIGTERM', shutdownActivityBuffer);
    //   process.on('SIGINT', shutdownActivityBuffer);
    // }
  }
}

const MAX_EVENT_ID_LENGTH = 128;
const MAX_PAGE_URL_LENGTH = 128;
const MAX_EVENT_ID_JSON_LIKE = 200;

/** True if the string looks like stringified JSON or a Node object (e.g. pg Client). */
function looksLikeStringifiedValue(s: string): boolean {
  if (s.length < MAX_EVENT_ID_JSON_LIKE) return false;
  const trimmed = s.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return true;
  if (trimmed.includes('"_events"') || trimmed.includes('"_eventsCount"')) return true;
  return false;
}

function normalizeEventId(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    if (looksLikeStringifiedValue(value)) {
      logger.warn('Event ID looks like stringified JSON/object; using placeholder', {
        length: value.length,
        prefix: value.slice(0, 50),
      });
      return '[stringified-value]';
    }
    return value;
  }
  // Defensive: callers sometimes pass objects (e.g. pg Client) by mistake
  if (typeof value === 'object') {
    logger.warn('Event ID was an object; using placeholder', {
      type: value.constructor?.name ?? 'Object',
    });
    return '[object]';
  }
  return String(value);
}

export async function logActivity(activity: Activity): Promise<void> {
  const rawEventId = activity.eventId;
  activity.eventId = normalizeEventId(rawEventId);
  if (activity.eventId.length > MAX_EVENT_ID_LENGTH) {
    logger.warn('Event ID is too long; truncating', {
      length: activity.eventId.length,
      prefix: activity.eventId.slice(0, 40),
    });
    activity.eventId = activity.eventId.slice(0, MAX_EVENT_ID_LENGTH);
  }

  if (activity.pageUrl && activity.pageUrl.length > MAX_PAGE_URL_LENGTH) {
    logger.warn('Page URL is too long', { pageUrl: activity.pageUrl });
    activity.pageUrl = activity.pageUrl.slice(0, MAX_PAGE_URL_LENGTH);
  }
  const a: Activity = {
    ...activity,
    trackId: activity.trackId ?? logger.context.getStore()?.trackId ?? undefined,
    appVersion: activity.appVersion ?? APP_VERSION,
  };
  if (logger.traceEnabled) {
    logger.info(`${activity.eventType}: ${activity.eventId}`, {
      userName: activity.userName,
      metadata: activity.metadata,
      pageUrl: activity.pageUrl,
      dataSource: activity.dataSource,
      elapsedTimeMs: activity.elapsedTimeMs,
      sessionId: activity.sessionId,
      rowCount: activity.rowCount,
      apiName: activity.apiName,
      trackId: a.trackId,
      appVersion: a.appVersion,
    });
  }
  initActivityBuffer();
  global._$activityBuffer.push(a);
}

interface LogAccessDeniedParams {
  /** Acting user (name + roles + session id are read from it). */
  userName: string;
  roles: string[];
  sessionId: string;
  /** CC domain the attempt was scoped to, if any. */
  domainId?: string;
  /** What kind of thing was being accessed. */
  resourceType: AccessDeniedResourceType;
  /** Identifier of the attempted resource (action name, datasource id, agent id, domain id). */
  resource: string;
  /** Human-readable reason for the denial. */
  reason: string;
}

/**
 * Records an authorization denial as a `uv_user_activity` row with
 * `eventType='Access Denied'`. Best-effort: a logging failure must never mask
 * or replace the original authorization error, so callers should not await a
 * rejection from this (it swallows its own errors). Call it immediately BEFORE
 * throwing the access error at each authorization gate.
 */
export async function logAccessDenied({
  userName,
  roles,
  sessionId,
  domainId,
  resourceType,
  resource,
  reason,
}: LogAccessDeniedParams): Promise<void> {
  try {
    await logActivity({
      userName,
      eventType: 'Access Denied',
      eventId: resource,
      sessionId,
      domainId,
      createdAt: new Date().toISOString(),
      metadata: { roles, resourceType, resource, reason, outcome: 'denied' },
    });
  } catch (err) {
    logger.warn('logAccessDenied failed; original authorization error is unaffected', {
      error: String(err),
    });
  }
}
