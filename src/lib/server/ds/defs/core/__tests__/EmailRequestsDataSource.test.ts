import type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import { getConfig } from '@/lib/core/server/config';
import { beforeEach, describe, expect, it as test } from 'vitest';
import { EmailRequestsDataSource } from '../EmailRequestsDataSource';
import { PREFIX } from '@/lib/server/constants';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';

describe('EmailRequestsDataSource', () => {
  let queryBuilder: QueryBuilder<EmailRequests>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(EmailRequestsDataSource, TEST_SESSION);
  });

  test('should be able to build a query', () => {
    queryBuilder.applyQuery({});

    const { appId, schedulerId } = getConfig('applyQuery');
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."request_id" "requestId", x."to_address" "toAddress", x."subject" "subject", x."mail_options" "mailOptions", x."attempt_count" "attemptCount", x."last_error" "lastError", x."next_attempt_at" "nextAttemptAt", x."sent_at" "sentAt", x."created_at" "createdAt", x."app_id" "appId", x."scheduler_id" "schedulerId" FROM "${PREFIX}email_requests" AS x WHERE x."app_id" = $1 AND x."scheduler_id" = $2 LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual([appId, schedulerId, 20, 0]);
  });
});
