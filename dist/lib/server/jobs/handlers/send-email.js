import logger from '../../../../lib/core/server/logger';
import { transaction } from '../../../../lib/core/server/db';
import { getErrorMessage } from '../../../../lib/core/common/error';
import { sendEmailNow } from '../../../../lib/core/server/email';
import { PREFIX } from '../../../../lib/server/constants';
import { getConfig } from '../../../../lib/core/server/config';
/**
 * Placeholder job to send queued emails.
 */
const MAX_RETRIES = 5;
export async function sendQueuedEmails() {
    // logger.info('Sending queued emails...');
    await transaction(async (client) => {
        const config = getConfig('sendQueuedEmails');
        const { appId, schedulerId } = config;
        const { rows } = await client.query(`SELECT request_id, mail_options, attempt_count
         FROM ${PREFIX}email_requests
        WHERE sent_at IS NULL
          AND next_attempt_at <= now()
          AND app_id = $1
          AND scheduler_id = $2
        ORDER BY request_id
        LIMIT 50
        FOR UPDATE SKIP LOCKED`, [appId, schedulerId]);
        for (const row of rows) {
            try {
                // logger.info(`Sending queued email ${row.request_id}`);
                await sendEmailNow(row.mail_options);
                await client.query(`UPDATE ${PREFIX}email_requests
              SET sent_at = statement_timestamp(),
                  attempt_count = $2,
                  last_error = NULL
            WHERE request_id = $1 AND app_id = $3`, [row.request_id, row.attempt_count + 1, appId]);
            }
            catch (e) {
                const attempts = row.attempt_count + 1;
                const msg = getErrorMessage(e);
                logger.error(`Failed to send queued email ${row.request_id} on attempt ${attempts}`, msg);
                if (attempts >= MAX_RETRIES) {
                    await client.query(`UPDATE ${PREFIX}email_requests
                SET attempt_count = $2,
                    last_error = $3,
                    sent_at = statement_timestamp()
              WHERE request_id = $1 AND app_id = $4`, [row.request_id, attempts, msg, appId]);
                }
                else {
                    await client.query(`UPDATE ${PREFIX}email_requests
                SET attempt_count = $2,
                    last_error = $3,
                    next_attempt_at = now() + (($2::integer) * interval '5 minutes')
              WHERE request_id = $1 AND app_id = $4`, [row.request_id, attempts, msg, appId]);
                }
            }
        }
    });
}
//# sourceMappingURL=send-email.js.map