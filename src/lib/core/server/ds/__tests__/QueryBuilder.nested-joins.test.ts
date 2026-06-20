/* Copyright (c) 2024-present Venky Corp. */

import { beforeEach, describe, expect, it as test } from 'vitest';
import { QueryBuilder } from '../QueryBuilder';
import type { DataSource, ISODateString } from '@/lib/core/common/ds/types/DataSource';
import { DefaultAttribute, DefaultDataSource, DefaultFullAccess } from '@/lib/server/ds/defs/defaults';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import { UserError } from '@/lib/core/common/error';

// Test DataSource with nested joins
interface ProjectWithNestedJoins {
  id: string;
  customerId: string;
  customerName?: string | null;
  customerTypeId?: string | null;
  customerTypeName?: string | null;
  projectManager?: string | null;
  projectManagerName?: string | null;
  projectManagerEmail?: string | null;
  createdAt: ISODateString;
  createdBy: string;
}

const ProjectWithNestedJoinsDS: DataSource<ProjectWithNestedJoins> = {
  ...DefaultDataSource,
  id: 'ProjectWithNestedJoins',
  tableName: 'projects',
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
      refAlias: 'cust',
      refTableName: 'customers',
      refWhereClause: 'cust.customer_id = x.customer_id',
      refEquiJoin: true,
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      refAlias: 'cust',
      calculated: true,
    },
    // Nested join: customers -> customer_types
    {
      ...DefaultAttribute,
      code: 'customerTypeId',
      name: 'Customer Type Id',
      type: 'Reference',
      column: 'cust.type_id',
      optional: true,
      ref: { type: 'UUID' },
      refAlias: 'custType',
      refTableName: 'customer_types',
      refWhereClause: 'custType.id = cust.type_id', // References 'cust' alias
      refEquiJoin: false,
    },
    {
      ...DefaultAttribute,
      code: 'customerTypeName',
      name: 'Customer Type Name',
      type: 'Text',
      column: 'custType.name',
      maxLength: 100,
      optional: true,
      refAlias: 'custType',
      calculated: true,
    },
    // Another join to main table
    {
      ...DefaultAttribute,
      code: 'projectManager',
      name: 'Project Manager',
      type: 'Reference',
      column: 'project_manager',
      optional: true,
      ref: { type: 'Text' },
      refAlias: 'pm',
      refTableName: 'users',
      refWhereClause: 'pm.user_name = x.project_manager',
      refEquiJoin: false,
    },
    {
      ...DefaultAttribute,
      code: 'projectManagerName',
      name: 'Project Manager Name',
      type: 'Text',
      column: 'pm.display_name',
      maxLength: 240,
      optional: true,
      refAlias: 'pm',
      calculated: true,
    },
    {
      ...DefaultAttribute,
      code: 'projectManagerEmail',
      name: 'Project Manager Email',
      type: 'Text',
      column: 'pm.email',
      maxLength: 128,
      optional: true,
      refAlias: 'pm',
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
  refA?: string | null;
  refAName?: string | null;
  refB?: string | null;
  refBName?: string | null;
}

const CircularJoinDS: DataSource<CircularJoinType> = {
  ...DefaultDataSource,
  id: 'CircularJoin',
  tableName: 'test_table',
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
    // Join A depends on B
    {
      ...DefaultAttribute,
      code: 'refA',
      name: 'Ref A',
      type: 'Reference',
      column: 'ref_a',
      optional: true,
      ref: { type: 'UUID' },
      refAlias: 'a',
      refTableName: 'table_a',
      refWhereClause: 'a.id = b.ref_id', // Depends on 'b'
      refEquiJoin: false,
    },
    {
      ...DefaultAttribute,
      code: 'refAName',
      name: 'Ref A Name',
      type: 'Text',
      column: 'a.name',
      maxLength: 100,
      optional: true,
      refAlias: 'a',
      calculated: true,
    },
    // Join B depends on A (circular!)
    {
      ...DefaultAttribute,
      code: 'refB',
      name: 'Ref B',
      type: 'Reference',
      column: 'ref_b',
      optional: true,
      ref: { type: 'UUID' },
      refAlias: 'b',
      refTableName: 'table_b',
      refWhereClause: 'b.id = a.ref_id', // Depends on 'a'
      refEquiJoin: false,
    },
    {
      ...DefaultAttribute,
      code: 'refBName',
      name: 'Ref B Name',
      type: 'Text',
      column: 'b.name',
      maxLength: 100,
      optional: true,
      refAlias: 'b',
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

// Test DataSource with function-based refWhereClause
interface FunctionJoinType {
  id: string;
  customerId: string;
  customerName?: string | null;
}

const FunctionJoinDS: DataSource<FunctionJoinType> = {
  ...DefaultDataSource,
  id: 'FunctionJoin',
  tableName: 'projects',
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
      refAlias: 'cust',
      refTableName: 'customers',
      refWhereClause: () => 'cust.customer_id = x.customer_id',
      refEquiJoin: true,
    },
    {
      ...DefaultAttribute,
      code: 'customerName',
      name: 'Customer Name',
      type: 'Text',
      column: 'cust.customer_name',
      maxLength: 240,
      optional: true,
      refAlias: 'cust',
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

describe('QueryBuilder - Nested Joins (Old Format - Deprecated)', () => {
  describe('Nested joins rejection in old format', () => {
    let queryBuilder: QueryBuilder<ProjectWithNestedJoins>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(ProjectWithNestedJoinsDS, TEST_SESSION);
    });

    test('should reject nested joins in old format', () => {
      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'customerName', 'customerTypeName'],
        });
      }).toThrow(UserError);

      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'customerName', 'customerTypeName'],
        });
      }).toThrow(/Nested joins are not supported in the old attribute-based format/);
    });

    test('should reject nested joins when selecting nested field', () => {
      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'customerTypeName'],
        });
      }).toThrow(/Nested joins are not supported/);
    });

    test('should reject nested joins in WHERE clause', () => {
      expect(() => {
        queryBuilder.applyQuery({
          filter: [{ customerTypeName: { is: 'Premium' } }],
        });
      }).toThrow(/Nested joins are not supported/);
    });

    test('should reject nested joins in ORDER BY', () => {
      expect(() => {
        queryBuilder.applyQuery({
          sort: { customerTypeName: 1 },
        });
      }).toThrow(/Nested joins are not supported/);
    });

    test('should reject nested joins with multiple joins', () => {
      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'customerTypeName', 'projectManagerName'],
        });
      }).toThrow(/Nested joins are not supported/);
    });
  });

  describe('Circular dependency detection in old format', () => {
    test('should reject nested joins before checking circular dependencies', () => {
      const queryBuilder = new QueryBuilder(CircularJoinDS, TEST_SESSION);

      // Old format rejects nested joins before checking for circular dependencies
      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'refAName', 'refBName'],
        });
      }).toThrow(/Nested joins are not supported/);
    });
  });

  describe('Function-based refWhereClause', () => {
    let queryBuilder: QueryBuilder<FunctionJoinType>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(FunctionJoinDS, TEST_SESSION);
    });

    test('should handle function-based refWhereClause', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerName'],
      });

      const query = queryBuilder.getQuery();

      // Should include the join
      expect(query).toContain('INNER JOIN customers AS cust ON (cust.customer_id = x.customer_id)');
    });
  });

  describe('Edge cases', () => {
    let queryBuilder: QueryBuilder<ProjectWithNestedJoins>;

    beforeEach(() => {
      queryBuilder = new QueryBuilder(ProjectWithNestedJoinsDS, TEST_SESSION);
    });

    test('should handle empty query with no joins selected', () => {
      queryBuilder.applyQuery({
        select: ['id'],
      });

      const query = queryBuilder.getQuery();

      // Should not include any joins if no joined fields are selected
      expect(query).not.toContain('JOIN');
    });

    test('should handle query with only main table fields', () => {
      queryBuilder.applyQuery({
        select: ['id', 'customerId'],
      });

      const query = queryBuilder.getQuery();

      // customerId is a Reference type (FK column), not a calculated field
      // Reference types don't automatically trigger joins - only calculated fields with refAlias do
      // So the join should NOT be present when selecting only the FK column
      expect(query).not.toContain('JOIN');
    });

    test('should reject nested joins in complex queries', () => {
      expect(() => {
        queryBuilder.applyQuery({
          select: ['id', 'customerTypeName', 'projectManagerName'],
          filter: [{ customerTypeName: { is: 'Premium' } }, { projectManagerName: { is: 'John' } }],
        });
      }).toThrow(/Nested joins are not supported/);
    });
  });
});
