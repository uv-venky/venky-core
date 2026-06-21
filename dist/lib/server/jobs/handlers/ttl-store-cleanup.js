import { transaction } from '../../../../lib/core/server/db';
import logger from '../../../../lib/core/server/logger';
import { PREFIX } from '../../../../lib/server/constants';
import { getConfig } from '../../../../lib/core/server/config';
export async function cleanupTtlStore() {
    const appId = getConfig('cleanupTtlStore').appId;
    const rowCount = await transaction(async (client) => {
        let result = await client.query(`DELETE FROM ${PREFIX}tiny_urls WHERE expires_at IS NOT NULL AND expires_at <= now() AND app_id = $1`, [appId]);
        if (result.rowCount && result.rowCount > 0) {
            logger.info(`Cleaned up ${result.rowCount} tiny urls`);
        }
        result = await client.query(`DELETE FROM ${PREFIX}ttl_store WHERE expires_at <= now() AND app_id = $1`, [appId]);
        return result.rowCount;
    });
    if (rowCount && rowCount > 20) {
        logger.info(`Cleaned up ${rowCount} ttl entries`);
    }
}
//# sourceMappingURL=ttl-store-cleanup.js.map