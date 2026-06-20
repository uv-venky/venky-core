import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import type { Activity } from '@/lib/core/common/types/Activity';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';

export interface ActivityFilters {
  fromDate: string;
  toDate: string;
  eventType?: string;
  user?: string;
}

export async function getActivityEvents({
  client,
  _session,
  filters,
}: {
  client: PgPoolClient;
  _session: Session;
  filters: ActivityFilters;
}): Promise<Activity[]> {
  const appId = getConfig('getActivityEvents').appId;
  const sql = `
    SELECT user_name as "userName",
           event_type as "eventType",
           created_at as "createdAt"
      FROM ${PREFIX}user_activity
     WHERE created_at >= $1 AND created_at < $2 AND app_id = $3
     ORDER BY created_at DESC
  `;
  const { rows } = await client.query<Activity>(sql, [filters.fromDate, filters.toDate, appId]);
  return rows;
}

export async function getActivityEventsAll({
  client,
  _session,
  filters,
}: {
  client: PgPoolClient;
  _session: Session;
  filters: ActivityFilters;
}): Promise<Activity[]> {
  const appId = getConfig('getActivityEventsAll').appId;
  const sql = `
    SELECT user_name as "userName",
           event_type as "eventType",
           description,
           metadata,
           page_url as "pageUrl",
           data_source as "dataSource",
           elapsed_time_ms as "elapsedTimeMs",
           session_id as "sessionId",
           row_count as "rowCount",
           api_name as "apiName",
           track_id as "trackId",
           created_at as "createdAt"
      FROM ${PREFIX}user_activity
     WHERE created_at >= $1 AND created_at < $2 AND app_id = $3
     ORDER BY created_at DESC
  `;
  const { rows } = await client.query<Activity>(sql, [filters.fromDate, filters.toDate, appId]);
  return rows;
}
