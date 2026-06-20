import type { PgPoolClient } from '@/lib/core/server/db';
import type { Session } from '@/auth';
import { PREFIX } from '@/lib/server/constants';
import { getConfig } from '@/lib/core/server/config';

export interface FunnelStepCount {
  step: string;
  users: number;
}

/**
 * Calculate funnel counts for the provided sequence of event types.
 * Each step represents the number of unique users who completed all
 * previous steps in the sequence within the given time range.
 */
export async function queryUserActivityFunnel({
  client,
  start,
  end,
  steps,
}: {
  client: PgPoolClient;
  session: Session;
  start: string;
  end: string;
  steps: string[];
}): Promise<FunnelStepCount[]> {
  if (steps.length === 0) {
    return [];
  }

  const appId = getConfig('queryUserActivityFunnel').appId;
  const params: string[] = [start, end, appId];
  const cte: string[] = [];
  const selects: string[] = [];

  steps.forEach((step, idx) => {
    params.push(step);
    const i = idx + 1;
    if (idx === 0) {
      cte.push(
        `step${i} AS (SELECT DISTINCT user_name FROM ${PREFIX}user_activity WHERE event_type = $${params.length} AND created_at >= $1 AND created_at < $2 AND app_id = $3)`,
      );
    } else {
      cte.push(
        `step${i} AS (SELECT DISTINCT e.user_name FROM step${i - 1} s JOIN ${PREFIX}user_activity e ON e.user_name = s.user_name AND e.event_type = $${params.length} AND e.created_at >= $1 AND e.created_at < $2 AND e.app_id = $3)`,
      );
    }
    selects.push(`(SELECT COUNT(*) FROM step${i}) AS step${i}`);
  });

  const sql = `WITH ${cte.join(', ')} SELECT ${selects.join(', ')}`;
  const { rows } = await client.query(sql, params);
  const row = rows[0] ?? {};
  return steps.map((s, i) => ({
    step: s,
    users: Number(row[`step${i + 1}`]) || 0,
  }));
}
