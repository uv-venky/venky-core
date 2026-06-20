/* Copyright (c) 2023-present Venky Corp. */

import { beforeEach, describe, expect, it as test } from 'vitest';
import { QueryBuilder } from '../QueryBuilder';
import { BASE_QUERY, TestDS, type TestDataSourceType } from './sample-ds';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder<TestDataSourceType>;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(TestDS, TEST_SESSION);
  });

  test('should be able to build a query with a filter', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'ADMIN' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 20, 0]);
  });

  test('should be able to build a query with a filter with a not equal operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { not: 'ADMIN' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" != $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 20, 0]);
  });

  test('should be able to build a query with a filter with an empty operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { empty: '' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" IS NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter with a notempty operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { notempty: '' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" IS NOT NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter with a nct (not contains) operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { nct: 'ADMIN' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" NOT LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', 20, 0]);
  });

  test('should be able to build a query with a filter with a like operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { like: 'ADMIN' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', 20, 0]);
  });

  test('should be able to build a query with a filter with a sw (starts with) operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { sw: 'ADMIN' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN%', 20, 0]);
  });

  test('should be able to build a query with a filter with an ew (ends with) operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { ew: 'Admin' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."role_code" LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['%Admin', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for is operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { is: 'admin', ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for not operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { not: 'Admin', ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") != $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for nct operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { nct: 'admin', ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") NOT LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for like operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { like: 'Admin', ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for sw operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { sw: 'admin', ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN%', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for ew operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { ew: 'ADMIN', ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") LIKE $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['%ADMIN', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for hasall operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { hasall: ['admin', 'user'], ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((UPPER(x."role_code") LIKE $1 AND UPPER(x."role_code") LIKE $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', '%USER%', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for hasany operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { hasany: ['admin', 'user'], ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((UPPER(x."role_code") LIKE $1 OR UPPER(x."role_code") LIKE $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', '%USER%', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for notany operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { notany: ['admin', 'user'], ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE (NOT(UPPER(x."role_code") LIKE $1 OR UPPER(x."role_code") LIKE $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['%ADMIN%', '%USER%', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for in operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { in: ['admin', 'user'], ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (UPPER(x."role_code") IN ($1, $2)) LIMIT $3 OFFSET $4`);
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 'USER', 20, 0]);
  });

  test('should be able to build a query with a filter with ignoreCase option for nin operator', () => {
    queryBuilder.applyQuery({
      filter: [{ roleCode: { nin: ['admin', 'user'], ignoreCase: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE (UPPER(x."role_code") NOT IN ($1, $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual(['ADMIN', 'USER', 20, 0]);
  });
});
