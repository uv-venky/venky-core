/* Copyright (c) 2024-present Venky Corp. */
import { UserError } from '../../../../../lib/core/common/error';
import { getConfig } from '../../../../../lib/core/server/config';
import { PREFIX } from '../../../../../lib/server/constants';
import { sendQueuedEmails } from '../../../../../lib/server/jobs/handlers/send-email';
export async function resendEmailRequest(client, _session, requestId) {
    const config = getConfig('sendEmail');
    const { appId } = config;
    const { rows } = await client.query(`SELECT sent_at FROM ${PREFIX}email_requests WHERE request_id = $1 AND app_id = $2`, [requestId, appId]);
    if (rows.length === 0) {
        throw new UserError('Email request not found');
    }
    if (rows[0].sent_at == null) {
        throw new UserError('This email is still queued or pending delivery');
    }
    await client.query(`UPDATE ${PREFIX}email_requests
        SET sent_at = NULL,
            last_error = NULL,
            attempt_count = 0,
            next_attempt_at = now()
      WHERE request_id = $1 AND app_id = $2`, [requestId, appId]);
    setTimeout(() => {
        void sendQueuedEmails();
    }, 0);
}
//# sourceMappingURL=action.js.map