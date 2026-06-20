import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';

/**
 * Aggregated count of events for a specific period.
 */
export interface UserActivityCount {
  eventType: string;
  period: string; // start of day or week in ISO format
  total: number;
}

/**
 * Query aggregated counts of user events grouped by day or week.
 *
 * @param start ISO date string for start of range (inclusive)
 * @param end ISO date string for end of range (exclusive)
 * @param granularity grouping interval, either 'daily' or 'weekly'
 */
export async function queryUserActivityCounts({
  client,
  start,
  end,
  granularity = 'daily',
}: {
  client: PgPoolClient;
  session: Session;
  start: string;
  end: string;
  granularity?: 'daily' | 'weekly';
}): Promise<UserActivityCount[]> {
  const appId = getConfig('queryUserActivityCounts').appId;
  const trunc = granularity === 'weekly' ? 'week' : 'day';
  const sql = `
    SELECT event_type AS "eventType",
           to_char(date_trunc('${trunc}', created_at), 'YYYY-MM-DD') AS "period",
           COUNT(*) AS total
      FROM ${PREFIX}user_activity
     WHERE created_at >= $1 AND created_at < $2 AND app_id = $3
     GROUP BY 1,2
     ORDER BY 2,1`;
  const { rows } = await client.query<UserActivityCount>(sql, [start, end, appId]);
  return rows;
}
