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
      filter: [{ isActive: { istrue: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."is_active" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([true, 20, 0]);
  });

  test('should be able to build a query with empty boolean filter', () => {
    queryBuilder.applyQuery({
      filter: [{ isActive: { empty: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."is_active" IS NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with notempty boolean filter', () => {
    queryBuilder.applyQuery({
      filter: [{ isActive: { notempty: true } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."is_active" IS NOT NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with ynFlag filter', () => {
    queryBuilder.applyQuery({
      filter: [{ ynFlag: { is: 'Y' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."yn_flag" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['Y', 20, 0]);
  });

  test('should be able to build a query with empty ynFlag filter', () => {
    queryBuilder.applyQuery({
      filter: [{ ynFlag: { empty: 'Y' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."yn_flag" IS NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with notempty ynFlag filter', () => {
    queryBuilder.applyQuery({
      filter: [{ ynFlag: { notempty: 'Y' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."yn_flag" IS NOT NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with empty tfFlag filter', () => {
    queryBuilder.applyQuery({
      filter: [{ tfFlag: { empty: 'T' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."tf_flag" IS NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with notempty tfFlag filter', () => {
    queryBuilder.applyQuery({
      filter: [{ tfFlag: { notempty: 'T' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."tf_flag" IS NOT NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with tfFlag filter', () => {
    queryBuilder.applyQuery({
      filter: [{ tfFlag: { is: 'T' } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."tf_flag" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual(['T', 20, 0]);
  });
});
