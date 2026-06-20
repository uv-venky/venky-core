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

  test('should be able to build a query with a filter with a number filter', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { eq: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using is operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { is: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" = $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using ne operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { ne: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" != $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using not operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { not: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" != $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using gt operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { gt: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" > $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using gte operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { gte: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" >= $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using lt operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { lt: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" < $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using lte operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { lte: 1001 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" <= $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([1001, 20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using null operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { null: 1 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" IS NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter with a number filter using notnull operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { notnull: 1 } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."seq_no" IS NOT NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter with a multi number filter using bn operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { bn: [1000, 2000] } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."seq_no" >= $1 AND x."seq_no" <= $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual([1000, 2000, 20, 0]);
  });

  test('should be able to build a query with a filter with a multi number filter using in operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { in: [1001, 1002, 1003] } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."seq_no" = $1 OR x."seq_no" = $2 OR x."seq_no" = $3)) LIMIT $4 OFFSET $5`,
    );
    expect(queryBuilder.getParams()).toEqual([1001, 1002, 1003, 20, 0]);
  });

  test('should be able to build a query with a filter with a multi number filter using nin operator', () => {
    queryBuilder.applyQuery({
      filter: [{ seqNo: { nin: [1001, 1002, 1003] } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."seq_no" != $1 AND x."seq_no" != $2 AND x."seq_no" != $3)) LIMIT $4 OFFSET $5`,
    );
    expect(queryBuilder.getParams()).toEqual([1001, 1002, 1003, 20, 0]);
  });
});
