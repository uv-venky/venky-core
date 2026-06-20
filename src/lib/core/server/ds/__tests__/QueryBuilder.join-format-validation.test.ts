/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it as test } from 'vitest';
import { QueryBuilder } from '../QueryBuilder';
import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '@/lib/server/ds/defs/defaults';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import { UserError } from '@/lib/core/common/error';

// Test DataSource mixing formats: has joins array but uses refAlias (without refTableName)
interface MixedFormatType {
  id: string;
  customerName?: string | null;
}

const MixedFormatDS: DataSource<MixedFormatType> = {
  ...DefaultDataSource,
  id: 'MixedFormat',
  tableName: 'projects',
  joins: [
    {
      alias: 'cust',
      tableName: 'customers',
      joinType: 'INNER',
      on: 'cust.customer_id = x.customer_id',
    },
  ],
  attributes: [
    {
      ...DefaultAttribute,
      code: 'id',
      name: 'ID',
      type: 'Text',
      column: 'id',
      maxLength: 40,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      refAlias: 'cust', // ❌ Using refAlias when joins array exists (should use joinAlias)
      calculated: true,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

// Test DataSource: joins array but joinAlias references non-existent join
interface InvalidJoinAliasType {
  id: string;
  customerName?: string | null;
}

const InvalidJoinAliasDS: DataSource<InvalidJoinAliasType> = {
  ...DefaultDataSource,
  id: 'InvalidJoinAlias',
  tableName: 'projects',
  joins: [
    {
      alias: 'cust',
      tableName: 'customers',
      joinType: 'INNER',
      on: 'cust.customer_id = x.customer_id',
    },
  ],
  attributes: [
    {
      ...DefaultAttribute,
      code: 'id',
      name: 'ID',
      type: 'Text',
      column: 'id',
      maxLength: 40,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'invalidAlias.customer_name', // ❌ References non-existent alias
      maxLength: 240,
      optional: true,
      joinAlias: 'invalidAlias', // ❌ Join doesn't exist in joins array
      calculated: true,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

// Test DataSource: joins array but Reference attribute has refTableName
interface RefTableNameWithJoinsType {
  id: string;
  customerId: string;
}

const RefTableNameWithJoinsDS: DataSource<RefTableNameWithJoinsType> = {
  ...DefaultDataSource,
  id: 'RefTableNameWithJoins',
  tableName: 'projects',
  joins: [
    {
      alias: 'cust',
      tableName: 'customers',
      joinType: 'INNER',
      on: 'cust.customer_id = x.customer_id',
    },
  ],
  attributes: [
    {
      ...DefaultAttribute,
      code: 'id',
      name: 'ID',
      type: 'Text',
      column: 'id',
      maxLength: 40,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'customerId',
      name: 'Customer Id',
      type: 'Reference',
      column: 'customer_id',
      optional: false,
      ref: { type: 'UUID' },
      joinAlias: 'cust',
      refTableName: 'customers', // ❌ Should not have refTableName when using joins array
      refWhereClause: 'cust.customer_id = x.customer_id',
      refEquiJoin: true,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

// Test DataSource: no joins array but uses joinAlias
interface JoinAliasWithoutJoinsType {
  id: string;
  customerName?: string | null;
}

const JoinAliasWithoutJoinsDS: DataSource<JoinAliasWithoutJoinsType> = {
  ...DefaultDataSource,
  id: 'JoinAliasWithoutJoins',
  tableName: 'projects',
  // No joins array
  attributes: [
    {
      ...DefaultAttribute,
      code: 'id',
      name: 'ID',
      type: 'Text',
      column: 'id',
      maxLength: 40,
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      joinAlias: 'cust', // ❌ Using joinAlias without joins array
      calculated: true,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

describe('QueryBuilder - Join Format Validation', () => {
  describe('Mixing old and new formats', () => {
    test('should reject refAlias when joins array exists', () => {
      expect(() => {
        new QueryBuilder(MixedFormatDS, TEST_SESSION);
      }).toThrow(UserError);

      expect(() => {
        new QueryBuilder(MixedFormatDS, TEST_SESSION);
      }).toThrow(/uses refAlias 'cust' but a join with that alias exists in the joins array/);
    });

    test('should reject refTableName/refWhereClause when joins array exists', () => {
      expect(() => {
        new QueryBuilder(RefTableNameWithJoinsDS, TEST_SESSION);
      }).toThrow(UserError);

      expect(() => {
        new QueryBuilder(RefTableNameWithJoinsDS, TEST_SESSION);
      }).toThrow(/uses joinAlias.*but also has refTableName\/refWhereClause/);
    });

    test('should reject joinAlias without joins array', () => {
      expect(() => {
        new QueryBuilder(JoinAliasWithoutJoinsDS, TEST_SESSION);
      }).toThrow(UserError);

      expect(() => {
        new QueryBuilder(JoinAliasWithoutJoinsDS, TEST_SESSION);
      }).toThrow(/uses joinAlias.*but.*does not have a joins array/);
    });

    test('should reject invalid joinAlias that does not exist in joins array', () => {
      expect(() => {
        new QueryBuilder(InvalidJoinAliasDS, TEST_SESSION);
      }).toThrow(UserError);

      expect(() => {
        new QueryBuilder(InvalidJoinAliasDS, TEST_SESSION);
      }).toThrow(/uses joinAlias 'invalidAlias' but no join definition with that alias exists/);
    });
  });
});
