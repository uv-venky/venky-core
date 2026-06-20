/* Copyright (c) 2023-present Venky Corp. */

import { beforeEach, describe, expect, it as test } from 'vitest';
import type { DataSource } from '@/lib/core/common/ds/types/DataSource';
import type { FilterEntry, SchemaMember } from '@/lib/core/common/ds/types/filter';
import { DefaultAttribute, DefaultDataSource } from '@/lib/server/ds/defs/defaults';
import { QueryBuilder } from '../QueryBuilder';
import { BASE_QUERY, TestDS, type TestDataSourceType } from './sample-ds';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder<TestDataSourceType>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(TestDS, TEST_SESSION);
  });

  test('should be a function', () => {
    expect(QueryBuilder).toBeInstanceOf(Function);
  });

  test('should be able to build a query', () => {
    expect(queryBuilder).toBeInstanceOf(QueryBuilder);
  });

  test('should be able to build a query with a empty query', () => {
    queryBuilder.applyQuery({});
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a sort', () => {
    queryBuilder.applyQuery({
      sort: { roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} ORDER BY x."role_code" ASC LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a descending sort', () => {
    queryBuilder.applyQuery({
      sort: { roleCode: -1 },
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} ORDER BY x."role_code" DESC LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a multiple sort', () => {
    queryBuilder.applyQuery({
      sort: { roleName: -1, roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} ORDER BY x."role_name" DESC, x."role_code" ASC LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a multiple sort with correct order', () => {
    queryBuilder.applyQuery({
      sort: { roleName: -2, roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} ORDER BY x."role_code" ASC, x."role_name" DESC LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter and a limit', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      limit: 10,
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 10, 0]);
  });

  test('should be able to build a query with a filter and a limit and an offset', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      limit: 10,
      offset: 10,
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 10, 10]);
  });

  test('should be able to build a query with a filter and a limit and an offset and a sort', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      limit: 10,
      offset: 10,
      sort: { roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE (x."role_code" = $1) ORDER BY x."role_code" ASC LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 10, 10]);
  });

  test('should be able to build a query with a filter and a limit and an offset and a sort and a select', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      select: ['roleCode', 'roleName'],
      limit: 10,
      offset: 10,
      sort: { roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_code" "roleCode", x."role_name" "roleName" FROM "test_data_source_table" AS x WHERE (x."role_code" = $1) ORDER BY x."role_code" ASC LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 10, 10]);
  });

  test('should be able to build a query with a select with a calculated field', () => {
    queryBuilder.applyQuery({
      select: ['calcField'],
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x.seq_no * 2 "calcField" FROM "test_data_source_table" AS x LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should throw an error if both groupBy and select are specified', () => {
    expect(() => {
      queryBuilder.applyQuery({
        filter: [{ roleCode: { is: 'ADMIN' } }],
        select: ['roleCode', 'roleName'],
        groupBy: ['roleCode'],
        limit: 10,
        offset: 10,
        sort: { roleCode: 1 },
      });
    }).toThrow('Cannot specify both groupBy/aggregate and select');
  });

  test('should be able to build a query with a groupBy', () => {
    queryBuilder.applyQuery({
      groupBy: ['roleCode'],
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_code" "roleCode" FROM "test_data_source_table" AS x GROUP BY x."role_code" LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter and a limit and an offset and a sort and a groupBy', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      groupBy: ['roleCode'],
      limit: 10,
      offset: 10,
      sort: { roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_code" "roleCode" FROM "test_data_source_table" AS x WHERE (x."role_code" = $1) GROUP BY x."role_code" ORDER BY x."role_code" ASC LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 10, 10]);
  });

  test('should be able to build a query with groupBy and aggregate function', () => {
    queryBuilder.applyQuery({
      groupBy: ['roleName'],
      aggregate: [{ code: 'roleCode', func: 'Count', intoCode: 'roleCode' }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_name" "roleName", COUNT(x."role_code") "roleCode" FROM "test_data_source_table" AS x GROUP BY x."role_name" LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with groupBy and multiple aggregate functions', () => {
    queryBuilder.applyQuery({
      groupBy: ['roleName'],
      aggregate: [
        { code: 'roleCode', func: 'Count', intoCode: 'roleCode' },
        { code: 'seqNo', func: 'Sum', intoCode: 'seqNo' },
      ],
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_name" "roleName", COUNT(x."role_code") "roleCode", SUM(x."seq_no") "seqNo" FROM "test_data_source_table" AS x GROUP BY x."role_name" LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with groupBy and aggregate function and filter', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      groupBy: ['roleName'],
      aggregate: [{ code: 'roleCode', func: 'Count', intoCode: 'roleCode' }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_name" "roleName", COUNT(x."role_code") "roleCode" FROM "test_data_source_table" AS x WHERE (x."role_code" = $1) GROUP BY x."role_name" LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 20, 0]);
  });

  test('should be able to build a query with groupBy and aggregate function and filter and sort', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
      groupBy: ['roleName'],
      aggregate: [{ code: 'roleCode', func: 'Count', intoCode: 'roleCode' }],
      sort: { roleName: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_name" "roleName", COUNT(x."role_code") "roleCode" FROM "test_data_source_table" AS x WHERE (x."role_code" = $1) GROUP BY x."role_name" ORDER BY x."role_name" ASC LIMIT $2 OFFSET $3`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 20, 0]);
  });

  test('should be able to build a query with a data', () => {
    const date = new Date();
    queryBuilder.applyQuery({
      data: {
        roleCode: 'ADMIN',
        seqNo: 10,
        startDate: date.toISOString(),
        ynFlag: 'Y',
        tfFlag: 'T',
        isActive: true,
      },
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE x."role_code" = $1 AND x."seq_no" = $2 AND x."start_date" = $3 AND x."yn_flag" = $4 AND x."tf_flag" = $5 AND x."is_active" = $6 LIMIT $7 OFFSET $8`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 10, date, 'Y', 'T', true, 20, 0]);
  });

  test('should reject fullSQL in client queries', () => {
    expect(() => {
      queryBuilder.applyQuery({
        fullSQL: 'SELECT * FROM "test_data_source_table" AS x WHERE x."role_code" = $1',
        whereClauseParamList: ['ADMIN'],
      });
    }).toThrow('fullSQL is not allowed in client queries');
  });

  // with projection
  test('should be able to build a query with a projection', () => {
    queryBuilder.applyQuery({
      projection: { roleCode: 1 },
    });
    expect(queryBuilder.getQuery()).toBe(
      `SELECT x."role_code" "roleCode" FROM "test_data_source_table" AS x LIMIT $1 OFFSET $2`,
    );
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should throw an error if projection is used along with select', () => {
    expect(() => {
      queryBuilder.applyQuery({
        projection: { roleCode: 1 },
        select: ['roleCode', 'roleName'],
      });
    }).toThrow('Cannot specify both projection and select');
  });

  test('should be able to build a query with a anyof', () => {
    queryBuilder.applyQuery({
      filter: [
        {
          anyof: [{ roleCode: { is: 'ADMIN' } }, { roleCode: { is: 'USER' } }],
        },
      ],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."role_code" = $1 OR x."role_code" = $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 'USER', 20, 0]);
  });

  test('should be able to build a query with a allof', () => {
    queryBuilder.applyQuery({
      filter: [
        {
          allof: [{ roleCode: { sw: 'ADMIN' } }, { roleCode: { ew: 'USER' } }],
        },
      ],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."role_code" LIKE $1 AND x."role_code" LIKE $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN%', '%USER', 20, 0]);
  });

  test('should be able to build a query with a noneof', () => {
    queryBuilder.applyQuery({
      filter: [
        {
          noneof: [{ roleCode: { sw: 'ADMIN' } }, { roleCode: { ew: 'USER' } }],
        },
      ],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE (NOT (x."role_code" LIKE $1 OR x."role_code" LIKE $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN%', '%USER', 20, 0]);
  });

  describe('ORDER BY JSONB column key', () => {
    interface JsonSortRow {
      roleCode: string;
      attributes: Record<string, unknown>;
    }
    const JsonSortDS: DataSource<JsonSortRow> = {
      ...DefaultDataSource,
      id: 'JsonSortDS',
      tableName: 'json_sort_table',
      rowType: [] as JsonSortRow[],
      attributes: [
        {
          ...DefaultAttribute,
          code: 'roleCode',
          name: 'Role Code',
          type: 'Text',
          column: 'role_code',
          primary: true,
        },
        {
          ...DefaultAttribute,
          code: 'attributes',
          name: 'Attributes',
          type: 'JSON',
          column: 'attributes',
        },
      ],
      access: TestDS.access,
    };

    let jsonSortBuilder: QueryBuilder<JsonSortRow>;

    beforeEach(() => {
      jsonSortBuilder = new QueryBuilder(JsonSortDS, TEST_SESSION);
    });

    test('should ORDER BY JSONB key ascending when sort is "attributes.key": 1', () => {
      jsonSortBuilder.applyQuery({
        sort: { 'attributes.key': 1 } as SchemaMember<JsonSortRow, number>,
      });
      const sql = jsonSortBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' ASC');
    });

    test('should ORDER BY JSONB key descending when sort is "attributes.key": -1', () => {
      jsonSortBuilder.applyQuery({
        sort: { 'attributes.key': -1 } as SchemaMember<JsonSortRow, number>,
      });
      const sql = jsonSortBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' DESC');
    });

    test('should throw when sorting by whole JSON attribute (no key)', () => {
      expect(() => jsonSortBuilder.applyQuery({ sort: { attributes: 1 } })).toThrow(
        'JSON type attributes are not supported for sorting',
      );
    });

    test('should throw when JSON key is empty (trailing dot)', () => {
      expect(() =>
        jsonSortBuilder.applyQuery({ sort: { 'attributes.': 1 } as SchemaMember<JsonSortRow, number> }),
      ).toThrow('JSON key cannot be empty');
    });

    test('should throw when JSON key contains invalid characters', () => {
      // Key "invalid-key" contains hyphen, not allowed by safe identifier pattern
      expect(() =>
        jsonSortBuilder.applyQuery({
          sort: { 'attributes.invalid-key': 1 } as SchemaMember<JsonSortRow, number>,
        }),
      ).toThrow('JSON key must be a simple identifier');
    });

    test('should throw when base attribute is not JSON', () => {
      expect(() =>
        jsonSortBuilder.applyQuery({ sort: { 'roleCode.name': 1 } as SchemaMember<JsonSortRow, number> }),
      ).toThrow('is not a JSON attribute');
    });
  });

  describe('Filters by JSONB column key', () => {
    interface JsonFilterRow {
      roleCode: string;
      attributes: Record<string, unknown>;
    }
    const JsonFilterDS: DataSource<JsonFilterRow> = {
      ...DefaultDataSource,
      id: 'JsonFilterDS',
      tableName: 'json_filter_table',
      rowType: [] as JsonFilterRow[],
      attributes: [
        {
          ...DefaultAttribute,
          code: 'roleCode',
          name: 'Role Code',
          type: 'Text',
          column: 'role_code',
          primary: true,
        },
        {
          ...DefaultAttribute,
          code: 'attributes',
          name: 'Attributes',
          type: 'JSON',
          column: 'attributes',
        },
      ],
      access: TestDS.access,
    };

    let jsonFilterBuilder: QueryBuilder<JsonFilterRow>;

    beforeEach(() => {
      jsonFilterBuilder = new QueryBuilder(JsonFilterDS, TEST_SESSION);
    });

    test('should select JSONB key when select contains "attributes.key"', () => {
      jsonFilterBuilder.applyQuery({
        select: ['roleCode', 'attributes.key' as keyof JsonFilterRow],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' "attributes.key"');
      expect(sql).toContain('x."role_code" "roleCode"');
    });

    test('should filter by JSONB key with is operator', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.key': { is: 'value' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' = $1');
      expect(jsonFilterBuilder.getParams()).toContain('value');
    });

    test('should filter by JSONB key with not operator', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.key': { not: 'value' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' != $1');
      expect(jsonFilterBuilder.getParams()).toContain('value');
    });

    test('should filter by JSONB key with empty', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.key': { empty: true } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' IS NULL');
    });

    test('should filter by JSONB key with notempty', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.key': { notempty: true } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' IS NOT NULL');
    });

    test('should filter by JSONB key with like operator', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.key': { like: 'x' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'key\' LIKE $1');
      expect(jsonFilterBuilder.getParams()).toContain('%x%');
    });

    test('should filter by JSONB key with number value (gt)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.count': { gt: 5 } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'count\')::numeric > $1');
      expect(jsonFilterBuilder.getParams()).toContain(5);
    });

    test('should filter by JSONB key with number value (is)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.count': { is: 10 } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'count\')::numeric = $1');
      expect(jsonFilterBuilder.getParams()).toContain(10);
    });

    test('should filter by JSONB key with boolean value (istrue)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.flag': { istrue: true } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'flag\')::boolean = $1');
      expect(jsonFilterBuilder.getParams()).toContain(true);
    });

    test('should filter by JSONB key with date value (on)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.created': { on: '2024-01-15' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'created\')::date >= $1');
      expect(sql).toContain('(x."attributes"->>\'created\')::date < $2');
      const params = jsonFilterBuilder.getParams();
      expect(params.length).toBeGreaterThanOrEqual(2);
      expect(params[0]).toBeInstanceOf(Date);
      expect((params[0] as Date).toISOString()).toContain('2024-01-15');
    });

    test('should filter by JSONB key with date empty', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.created': { empty: true } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('x."attributes"->>\'created\' IS NULL');
    });

    test('should filter by JSONB key with date value (tomorrow)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.dueDate': { tomorrow: '2024-01-01' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'dueDate\')::date >= $1');
      expect(sql).toContain('(x."attributes"->>\'dueDate\')::date < $2');
    });

    test('should filter by JSONB key with date value (next7days)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.dueDate': { next7days: '2024-01-01' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'dueDate\')::date >= $1');
      expect(sql).toContain('(x."attributes"->>\'dueDate\')::date < $2');
    });

    test('should filter by JSONB key with date value (next14days)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.dueDate': { next14days: '2024-01-01' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'dueDate\')::date');
    });

    test('should filter by JSONB key with date value (next28days)', () => {
      jsonFilterBuilder.applyQuery({
        filters: [{ 'attributes.dueDate': { next28days: '2024-01-01' } } as FilterEntry<JsonFilterRow>],
      });
      const sql = jsonFilterBuilder.getQuery();
      expect(sql).toContain('(x."attributes"->>\'dueDate\')::date');
    });

    test('should throw when JSON key is empty in filter', () => {
      expect(() =>
        jsonFilterBuilder.applyQuery({
          filters: [{ 'attributes.': { is: 'x' } } as FilterEntry<JsonFilterRow>],
        }),
      ).toThrow('JSON key cannot be empty');
    });

    test('should throw when JSON key contains invalid characters in filter', () => {
      expect(() =>
        jsonFilterBuilder.applyQuery({
          filters: [{ 'attributes.invalid-key': { is: 'x' } } as FilterEntry<JsonFilterRow>],
        }),
      ).toThrow('JSON key must be a simple identifier');
    });

    test('should throw when base attribute is not JSON in filter', () => {
      expect(() =>
        jsonFilterBuilder.applyQuery({
          filters: [{ 'roleCode.name': { is: 'x' } } as FilterEntry<JsonFilterRow>],
        }),
      ).toThrow('is not a JSON attribute');
    });
  });
});
