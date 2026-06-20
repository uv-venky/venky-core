/* Copyright (c) 2024-present Venky Corp. */

import { beforeEach, describe, expect, it as test } from 'vitest';
import { QueryBuilder } from '../QueryBuilder';
import type { DataSource, ISODateString } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '@/lib/server/ds/defs/defaults';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import { UserError } from '@/lib/core/common/error';

// Test DataSource with new joins array format
interface ProjectWithJoinsArray {
  id: string;
  customerId: string;
  customerName?: string | null;
  customerTypeId?: string | null;
  customerTypeName?: string | null;
  projectManager?: string | null;
  projectManagerName?: string | null;
  createdAt: ISODateString;
  createdBy: string;
}

const ProjectWithJoinsArrayDS: DataSource<ProjectWithJoinsArray> = {
  ...DefaultDataSource,
  id: 'ProjectWithJoinsArray',
  tableName: 'projects',
  joins: [
    {
      alias: 'cust',
      tableName: 'customers',
      joinType: 'INNER',
      on: 'cust.customer_id = x.customer_id',
    },
    {
      alias: 'custType',
      tableName: 'customer_types',
      joinType: 'LEFT',
      on: 'custType.id = cust.type_id',
      dependsOn: 'cust', // Explicit dependency
    },
    {
      alias: 'pm',
      tableName: 'users',
      joinType: 'LEFT',
      on: 'pm.user_name = x.project_manager',
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
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      joinAlias: 'cust',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'customerTypeId',
      name: 'Customer Type Id',
      type: 'Reference',
      column: 'cust.type_id',
      optional: true,
      ref: { type: 'UUID' },
      joinAlias: 'custType',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'customerTypeName',
      name: 'Customer Type Name',
      type: 'Text',
      column: 'custType.name',
      maxLength: 100,
      optional: true,
      joinAlias: 'custType',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'projectManager',
      name: 'Project Manager',
      type: 'Reference',
      column: 'project_manager',
      optional: true,
      ref: { type: 'Text' },
      joinAlias: 'pm',
    },
    {
      ...DefaultAttribute,
      code: 'projectManagerName',
      name: 'Project Manager Name',
      type: 'Text',
      column: 'pm.display_name',
      maxLength: 240,
      optional: true,
      joinAlias: 'pm',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      column: 'created_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'createdBy',
      name: 'Created By',
      type: 'Text',
      column: 'created_by',
      maxLength: 128,
      optional: false,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

// Test DataSource with function-based on clause
interface FunctionOnJoinType {
  id: string;
  customerId: string;
  customerName?: string | null;
}

const FunctionOnJoinDS: DataSource<FunctionOnJoinType> = {
  ...DefaultDataSource,
  id: 'FunctionOnJoin',
  tableName: 'projects',
  joins: [
    {
      alias: 'cust',
      tableName: 'customers',
      joinType: 'INNER',
      on: () => 'cust.customer_id = x.customer_id',
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
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      joinAlias: 'cust',
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

/** Like deploy instances: main row → app → customer (nested join depends on `app`, not `x`). */
interface InstanceChainJoinRow {
  instanceId: string;
  appId: string;
  customerName?: string | null;
  createdAt: ISODateString;
  createdBy: string;
}

const InstanceChainJoinsDS: DataSource<InstanceChainJoinRow> = {
  ...DefaultDataSource,
  id: 'InstanceChainJoins',
  tableName: 'dp_instances',
  joins: [
    {
      alias: 'app',
      tableName: 'dp_apps',
      joinType: 'LEFT',
      on: 'app.app_id = x.app_id',
    },
    {
      alias: 'cust',
      tableName: 'wk_customers',
      joinType: 'LEFT',
      on: 'cust.customer_id = app.customer_id',
      dependsOn: 'app',
    },
  ],
  attributes: [
    {
      ...DefaultAttribute,
      code: 'instanceId',
      name: 'Instance ID',
      type: 'UUID',
      column: 'instance_id',
      primary: true,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'appId',
      name: 'App',
      type: 'UUID',
      column: 'app_id',
      optional: false,
      joinAlias: 'app',
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      joinAlias: 'cust',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'createdAt',
      name: 'Created At',
      type: 'Date',
      column: 'created_at',
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'createdBy',
      name: 'Created By',
      type: 'Text',
      column: 'created_by',
      maxLength: 128,
      optional: false,
    },
  ],
  access: [
    {
      ...DefaultFullAccess,
      roleCode: 'admin',
    },
  ],
};

// Test DataSource with circular dependency (should fail)
interface CircularJoinType {
  id: string;
  name: string;
  refAName?: string | null;
  refBName?: string | null;
}

const CircularJoinDS: DataSource<CircularJoinType> = {
  ...DefaultDataSource,
  id: 'CircularJoin',
  tableName: 'test_table',
  joins: [
    {
      alias: 'a',
      tableName: 'table_a',
      joinType: 'LEFT',
      on: 'a.id = b.ref_id',
      dependsOn: 'b', // Depends on 'b'
    },
    {
      alias: 'b',
      tableName: 'table_b',
      joinType: 'LEFT',
      on: 'b.id = a.ref_id',
      dependsOn: 'a', // Depends on 'a' (circular!)
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
      code: 'name',
      name: 'Name',
      type: 'Text',
      column: 'name',
      maxLength: 100,
      optional: false,
    },
    {
      ...DefaultAttribute,
      code: 'refAName',
      name: 'Ref A Name',
      type: 'Text',
      column: 'a.name',
      maxLength: 100,
      optional: true,
      joinAlias: 'a',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'refBName',
      name: 'Ref B Name',
      type: 'Text',
      column: 'b.name',
      maxLength: 100,
      optional: true,
      joinAlias: 'b',
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

describe('QueryBuilder - Joins Array Format', () => {
  describe('Simple joins', () => {
    let queryBuilder: QueryBuilder<ProjectWithJoinsArray>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(ProjectWithJoinsArrayDS, TEST_SESSION);
    });

    test('should generate correct SQL for simple join', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerName'],
      });

      const query = queryBuilder.getQuery();

      expect(query).toContain('INNER JOIN customers AS cust ON (cust.customer_id = x.customer_id)');
    });

    test('should handle multiple simple joins', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerName', 'projectManagerName'],
      });

      const query = queryBuilder.getQuery();

      expect(query).toContain('customers AS cust');
      expect(query).toContain('users AS pm');
    });
  });

  describe('Nested joins with explicit dependsOn', () => {
    let queryBuilder: QueryBuilder<ProjectWithJoinsArray>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(ProjectWithJoinsArrayDS, TEST_SESSION);
    });

    test('should order joins correctly - parent before nested', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerTypeName'],
      });

      const query = queryBuilder.getQuery();

      // 'cust' should be joined before 'custType'
      const custIndex = query.indexOf('customers AS cust');
      const custTypeIndex = query.indexOf('customer_types AS custType');

      expect(custIndex).toBeGreaterThan(-1);
      expect(custTypeIndex).toBeGreaterThan(-1);
      expect(custIndex).toBeLessThan(custTypeIndex);
    });

    test('should generate correct SQL for nested join', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerTypeName'],
      });

      const query = queryBuilder.getQuery();

      expect(query).toContain('INNER JOIN customers AS cust ON (cust.customer_id = x.customer_id)');
      expect(query).toContain('LEFT JOIN customer_types AS custType ON (custType.id = cust.type_id)');
    });

    test('should handle multiple joins including nested', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerTypeName', 'projectManagerName'],
      });

      const query = queryBuilder.getQuery();

      // All three joins should be present
      expect(query).toContain('customers AS cust');
      expect(query).toContain('customer_types AS custType');
      expect(query).toContain('users AS pm');

      // 'cust' should come before 'custType'
      const custIndex = query.indexOf('customers AS cust');
      const custTypeIndex = query.indexOf('customer_types AS custType');
      expect(custIndex).toBeLessThan(custTypeIndex);
    });
  });

  describe('Join ordering with dependencies', () => {
    let queryBuilder: QueryBuilder<ProjectWithJoinsArray>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(ProjectWithJoinsArrayDS, TEST_SESSION);
    });

    test('should order joins correctly regardless of attribute order', () => {
      queryBuilder.applyQuery({
        select: ['customerTypeName', 'customerName'],
      });

      const query = queryBuilder.getQuery();

      // 'cust' must come before 'custType' even though customerTypeName was selected first
      const custIndex = query.indexOf('customers AS cust');
      const custTypeIndex = query.indexOf('customer_types AS custType');

      expect(custIndex).toBeLessThan(custTypeIndex);
    });

    test('should handle joins in WHERE clause with correct ordering', () => {
      queryBuilder.applyQuery({
        filter: [{ customerTypeName: { is: 'Premium' } }],
      });

      const query = queryBuilder.getQuery();

      // Both joins should be present
      expect(query).toContain('customers AS cust');
      expect(query).toContain('customer_types AS custType');

      // Correct order
      const custIndex = query.indexOf('customers AS cust');
      const custTypeIndex = query.indexOf('customer_types AS custType');
      expect(custIndex).toBeLessThan(custTypeIndex);
    });

    test('should handle joins in ORDER BY with correct ordering', () => {
      queryBuilder.applyQuery({
        sort: { customerTypeName: 1 },
      });

      const query = queryBuilder.getQuery();

      // Both joins should be present
      expect(query).toContain('customers AS cust');
      expect(query).toContain('customer_types AS custType');

      // Correct order
      const custIndex = query.indexOf('customers AS cust');
      const custTypeIndex = query.indexOf('customer_types AS custType');
      expect(custIndex).toBeLessThan(custTypeIndex);
    });
  });

  describe('Chain join main → app → customer (deploy instances pattern)', () => {
    test('should include wk_customers join and cust.customer_name when selecting customerName', () => {
      const queryBuilder = new QueryBuilder(InstanceChainJoinsDS, TEST_SESSION);
      queryBuilder.applyQuery({
        select: ['instanceId', 'customerName'],
      });
      const query = queryBuilder.getQuery();
      expect(query).toContain('dp_apps AS app');
      expect(query).toContain('wk_customers AS cust');
      expect(query).toContain('cust.customer_id = app.customer_id');
      expect(query).toContain('cust.customer_name');
      const appIndex = query.indexOf('dp_apps AS app');
      const custIndex = query.indexOf('wk_customers AS cust');
      expect(appIndex).toBeGreaterThan(-1);
      expect(custIndex).toBeGreaterThan(-1);
      expect(appIndex).toBeLessThan(custIndex);
    });

    test('should expand cust dependency when only customerName is selected', () => {
      const queryBuilder = new QueryBuilder(InstanceChainJoinsDS, TEST_SESSION);
      queryBuilder.applyQuery({
        select: ['instanceId', 'appId', 'customerName'],
      });
      const query = queryBuilder.getQuery();
      expect(query).toContain('wk_customers AS cust');
      expect(query).toContain('cust.customer_name');
    });
  });

  describe('Circular dependency detection', () => {
    test('should throw error for circular dependencies', () => {
      const queryBuilder = new QueryBuilder(CircularJoinDS, TEST_SESSION);

      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'refAName', 'refBName'],
        });
      }).toThrow(UserError);

      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'refAName', 'refBName'],
        });
      }).toThrow(/Circular dependency detected/);
    });
  });

  describe('Function-based on clause', () => {
    let queryBuilder: QueryBuilder<FunctionOnJoinType>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(FunctionOnJoinDS, TEST_SESSION);
    });

    test('should handle function-based on clause', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerName'],
      });

      const query = queryBuilder.getQuery();

      expect(query).toContain('INNER JOIN customers AS cust ON (cust.customer_id = x.customer_id)');
    });
  });

  describe('Edge cases', () => {
    let queryBuilder: QueryBuilder<ProjectWithJoinsArray>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(ProjectWithJoinsArrayDS, TEST_SESSION);
    });

    test('should handle empty query with no joins selected', () => {
      queryBuilder.applyQuery({
        select: ['id'],
      });

      const query = queryBuilder.getQuery();

      expect(query).not.toContain('JOIN');
    });

    test('should handle query with only main table fields', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerId'],
      });

      const query = queryBuilder.getQuery();

      // customerId is a Reference type (FK column), not a calculated field
      // Reference types don't automatically trigger joins - only calculated fields with joinAlias do
      // So the join should NOT be present when selecting only the FK column
      expect(query).not.toContain('JOIN');
    });

    test('should handle complex query with filters on nested join fields', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerTypeName', 'projectManagerName'],
        filter: [{ customerTypeName: { is: 'Premium' } }, { projectManagerName: { is: 'John' } }],
      });

      const query = queryBuilder.getQuery();

      // All three joins should be present
      expect(query).toContain('customers AS cust');
      expect(query).toContain('customer_types AS custType');
      expect(query).toContain('users AS pm');

      // Correct order: cust before custType
      const custIndex = query.indexOf('customers AS cust');
      const custTypeIndex = query.indexOf('customer_types AS custType');
      expect(custIndex).toBeLessThan(custTypeIndex);
    });
  });
});
