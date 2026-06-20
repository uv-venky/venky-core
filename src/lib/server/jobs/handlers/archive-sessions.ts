import { getConfig } from '@/lib/core/server/config';
import { transaction } from '@/lib/core/server/db';
import logger from '@/lib/core/server/logger';
import { PREFIX } from '@/lib/server/constants';

/**
 * Archive sessions that have not been accessed for more than ARCHIVE_DAYS days.
 */
export async function archiveSessions(): Promise<void> {
  const appId = getConfig('archiveSessions').appId;
  const rowCount = await transaction(async (client) => {
    await client.query(
      `UPDATE ${PREFIX}user_sessions SET signed_out_at = NOW() WHERE expires_at <= now() AND app_id = $1`,
      [appId],
    );
    await client.query(
      `INSERT INTO ${PREFIX}user_sessions_arch (
                  user_name,
                  user_id,
                  session_id,
                  ip_address,
                  user_agent,
                  csrf_token,
                  expires_at,
                  signed_in_at,
                  last_accessed_at,
                  signed_out_at,
                  app_id,
                  metadata
                ) SELECT
                  user_name,
                  user_id,
                  session_id,
                  ip_address,
                  user_agent,
                  csrf_token,
                  expires_at,
                  signed_in_at,
                  last_accessed_at,
                  signed_out_at,
                  app_id,
                  metadata
                FROM ${PREFIX}user_sessions WHERE signed_out_at IS NOT NULL AND app_id = $1`,
      [appId],
    );
    const result = await client.query(
      `DELETE FROM ${PREFIX}user_sessions WHERE signed_out_at IS NOT NULL AND app_id = $1`,
      [appId],
    );
    return result.rowCount;
  });
  if (rowCount && rowCount > 0) {
    logger.info(`Archived ${rowCount} sessions`);
  }
}
