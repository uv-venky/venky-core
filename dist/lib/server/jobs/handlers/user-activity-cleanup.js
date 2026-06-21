import { transaction } from '../../../../lib/core/server/db';
import logger from '../../../../lib/core/server/logger';
import { PREFIX } from '../../../../lib/server/constants';
import { getConfig } from '../../../../lib/core/server/config';
/**
 * Remove user activity older than 14 days.
 */
export async function cleanUserActivity() {
    const appId = getConfig('cleanUserActivity').appId;
    const rowCount = await transaction(async (client) => {
        // First, archive Page View activity older than 14 days into the summary table.
        // We aggregate by calendar date (no time), user, event type, and page URL.
        await client.query(`
        INSERT INTO ${PREFIX}user_activity_archive (
          activity_date,
          user_name,
          event_type,
          page_url,
          activity_count,
          app_id
        )
        SELECT
          created_at::date AS activity_date,
          user_name,
          event_type,
          page_url,
          COUNT(*) AS activity_count,
          app_id
        FROM ${PREFIX}user_activity
        WHERE created_at < now() - interval '14 days'
          AND app_id = $1
          AND event_type = 'Page View'
        GROUP BY created_at::date, user_name, event_type, page_url, app_id
        ON CONFLICT (app_id, activity_date, user_name, event_type, page_url)
        DO UPDATE SET activity_count = ${PREFIX}user_activity_archive.activity_count + EXCLUDED.activity_count
      `, [appId]);
        // Audit-trail rows are evidence and must survive the 14-day purge.
        // 'Access Denied' (authorization denials) and 'CC Interaction' (per-turn
        // Command Center summaries) back the domain-filtered audit trail.
        const result = await client.query(`DELETE FROM ${PREFIX}user_activity
       WHERE created_at < now() - interval '14 days'
         AND app_id = $1
         AND event_type NOT IN ('Access Denied', 'CC Interaction')`, [appId]);
        return result.rowCount;
    });
    if (rowCount && rowCount > 0) {
        logger.info(`Cleaned up ${rowCount} user activity`);
    }
}
//# sourceMappingURL=user-activity-cleanup.js.map