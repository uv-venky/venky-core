/* Copyright (c) 2023-present Venky Corp. */

import type { UserSessions } from '@/lib/common/ds/types/core/UserSessions';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import { beforeEach, describe, expect, it as test } from 'vitest';
import { UserSessionsDataSource } from '../UserSessionsDataSource';
import { PREFIX } from '@/lib/server/constants';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import { getConfig } from '@/lib/core/server/config';

describe('UserSessionsDataSource', () => {
  let queryBuilder: QueryBuilder<UserSessions>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(UserSessionsDataSource, TEST_SESSION);
  });

  test('should be able to build a query', () => {
    queryBuilder.applyQuery({});

    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."csrf_token" "csrfToken", x."expires_at" "expiresAt", x."ip_address" "ipAddress", x."last_accessed_at" "lastAccessedAt", x."session_id" "sessionId", x."signed_in_at" "signedInAt", x."signed_out_at" "signedOutAt", x."user_agent" "userAgent", x."user_id" "userId", x."user_name" "userName", x."app_id" "appId" FROM "${PREFIX}user_sessions" AS x WHERE x."app_id" = $1 LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual([getConfig('TEST').appId, 20, 0]);
  });
});
