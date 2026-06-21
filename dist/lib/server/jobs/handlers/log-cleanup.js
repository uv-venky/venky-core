import { transaction } from '../../../../lib/core/server/db';
import logger from '../../../../lib/core/server/logger';
import { PREFIX } from '../../../../lib/server/constants';
import { getConfig } from '../../../../lib/core/server/config';
/**
 * Remove log files older than 7 days from the `logs` directory.
 */
export async function cleanOldLogs() {
    const appId = getConfig('cleanOldLogs').appId;
    await transaction(async (client) => {
        const logResult = await client.query(`DELETE FROM ${PREFIX}logs WHERE created_at < now() - interval '14 days' AND app_id = $1`, [appId]);
        if (logResult.rowCount && logResult.rowCount > 0) {
            logger.info(`Cleaned up ${logResult.rowCount} log entries`);
        }
        const nodeResult = await client.query(`DELETE FROM ${PREFIX}scheduler_nodes WHERE last_seen_at < now() - interval '24 hours' AND app_id = $1`, [appId]);
        if (nodeResult.rowCount && nodeResult.rowCount > 0) {
            logger.info(`Cleaned up ${nodeResult.rowCount} stale scheduler node entries`);
        }
    });
}
//# sourceMappingURL=log-cleanup.js.map