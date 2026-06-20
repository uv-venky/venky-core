/* Copyright (c) 2023-present Venky Corp. */

import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import { beforeEach, describe, expect, it as test } from 'vitest';
import { SavedSearchDataSource } from '../SavedSearchDataSource';
import { PREFIX } from '@/lib/server/constants';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import { getConfig } from '@/lib/core/server/config';

describe('SavedSearchDataSource', () => {
  let queryBuilder: QueryBuilder<SavedSearch<unknown>>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(SavedSearchDataSource, TEST_SESSION);
  });

  test('should be able to build a query', () => {
    queryBuilder.applyQuery({});

    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."created_at" "createdAt", x."created_by" "createdBy", x."description" "description", x."id" "id", x."is_default" "isDefault", x."is_public" "isPublic", x."item_id" "itemId", x."name" "name", x."owner" "owner", x."page_id" "pageId", x."payload" "payload", x."updated_at" "updatedAt", x."updated_by" "updatedBy", x."app_id" "appId" FROM "${PREFIX}saved_search" AS x WHERE x."app_id" = $1 LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual([getConfig('TEST').appId, 20, 0]);
  });
});
