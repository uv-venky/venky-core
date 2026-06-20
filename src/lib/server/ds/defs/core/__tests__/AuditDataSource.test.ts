/* Copyright (c) 2023-present Venky Corp. */

import type { Audit } from '@/lib/common/ds/types/core/Audit';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import { beforeEach, describe, expect, it as test } from 'vitest';
import { AuditDataSource } from '../AuditDataSource';
import { PREFIX } from '@/lib/server/constants';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import { getConfig } from '@/lib/core/server/config';

describe('AuditDataSource', () => {
  let queryBuilder: QueryBuilder<Audit>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(AuditDataSource, TEST_SESSION);
  });

  test('should be able to build a query', () => {
    queryBuilder.applyQuery({});

    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."attribute_code" "attributeCode", x."audit_id" "auditId", x."datasource_id" "datasourceId", x."new_clob_value" "newClobValue", x."new_datetime_value" "newDatetimeValue", x."new_double_value" "newDoubleValue", x."new_string_value" "newStringValue", x."old_clob_value" "oldClobValue", x."old_datetime_value" "oldDatetimeValue", x."old_double_value" "oldDoubleValue", x."old_string_value" "oldStringValue", x."pk_value" "pkValue", x."updated_at" "updatedAt", x."updated_by" "updatedBy", x."value_type" "valueType", x."app_id" "appId" FROM "${PREFIX}audit" AS x WHERE x."app_id" = $1 LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual([getConfig('TEST').appId, 20, 0]);
  });
});
