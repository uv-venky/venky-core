/* Copyright (c) 2023-present Venky Corp. */

import { beforeEach, describe, expect, it as test } from 'vitest';
import { QueryBuilder } from '@/lib/core/server/ds/QueryBuilder';
import { BASE_QUERY, TestDS, type TestDataSourceType } from '@/lib/core/server/ds/__tests__/sample-ds';
import { addDays } from 'date-fns';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder<TestDataSourceType>;
  let date: Date;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(TestDS, TEST_SESSION);
    date = new Date('2025-01-01T12:00:00.000Z');
  });

  // Date filters
  test('should be able to build a query with a filter with a date filter', () => {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = addDays(from, 1);
    queryBuilder.applyQuery({
      filter: [{ createdAt: { on: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual([from, to, 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using noton', () => {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = addDays(from, 1);
    queryBuilder.applyQuery({
      filter: [{ createdAt: { noton: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE (NOT (x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()).toEqual([from, to, 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using empty', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { empty: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" IS NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using notempty', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { notempty: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" IS NOT NULL) LIMIT $1 OFFSET $2`);
    expect(queryBuilder.getParams()).toEqual([20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using after', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { after: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" >= $1) LIMIT $2 OFFSET $3`);
    date.setHours(0, 0, 0, 0);
    expect(queryBuilder.getParams()).toEqual([addDays(date, 1), 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using before', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { before: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" < $1) LIMIT $2 OFFSET $3`);
    date.setHours(0, 0, 0, 0);
    expect(queryBuilder.getParams()).toEqual([date, 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using beforetime', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { beforetime: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" < $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([date, 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using onorafter', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { onorafter: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" >= $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()).toEqual([date, 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using onorbefore', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { onorbefore: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" < $1) LIMIT $2 OFFSET $3`);
    date.setHours(0, 0, 0, 0);
    expect(queryBuilder.getParams()).toEqual([addDays(date, 1), 20, 0]);
  });

  test('should be able to build a query with a filter with a date filter using today', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { today: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using yesterday', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { yesterday: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using last7days', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { last7days: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using last14days', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { last14days: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using last28days', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { last28days: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using thisweek', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { thisweek: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using thismonth', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { thismonth: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using thisquarter', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { thisquarter: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using thisyear', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { thisyear: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using inthepast', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { inthepast: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" < $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBe(20);
    expect(queryBuilder.getParams()[2]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using inthefuture', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { inthefuture: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(`${BASE_QUERY} WHERE (x."created_at" > $1) LIMIT $2 OFFSET $3`);
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBe(20);
    expect(queryBuilder.getParams()[2]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using tomorrow', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { tomorrow: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using next7days', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { next7days: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using next14days', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { next14days: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using next28days', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { next28days: date.toISOString() } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });

  test('should be able to build a query with a filter with a date filter using bw', () => {
    queryBuilder.applyQuery({
      filter: [{ createdAt: { bn: [date.toISOString(), date.toISOString()] } }],
    });
    expect(queryBuilder.getQuery()).toBe(
      `${BASE_QUERY} WHERE ((x."created_at" >= $1 AND x."created_at" < $2)) LIMIT $3 OFFSET $4`,
    );
    expect(queryBuilder.getParams()[0]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[1]).toBeInstanceOf(Date);
    expect(queryBuilder.getParams()[2]).toBe(20);
    expect(queryBuilder.getParams()[3]).toBe(0);
  });
});
