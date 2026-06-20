/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it } from 'vitest';
import { isUserError } from '@/lib/core/common/error';
import { parseDsRequest, validateQuery } from '../request-schema';

describe('parseDsRequest', () => {
  it('accepts a query envelope', () => {
    const body = { ds: 'Users', query: { match: { id: '1' } } };
    expect(parseDsRequest(body)).toEqual(body);
  });

  it('accepts a rows envelope with debug', () => {
    const body = { ds: 'Users', rows: [{ id: '1', _status: 'U' }], debug: true };
    expect(parseDsRequest(body)).toEqual(body);
  });

  it('rejects an unknown top-level field, naming it', () => {
    try {
      parseDsRequest({ ds: 'Users', query: {}, fullSQL: 'DROP TABLE users' });
      throw new Error('expected parseDsRequest to throw');
    } catch (e) {
      expect(isUserError(e)).toBe(true);
      expect((e as Error).message).toContain('fullSQL');
    }
  });

  it('names every unknown field when several are present', () => {
    try {
      parseDsRequest({ ds: 'Users', rows: [], evilA: 1, evilB: 2 });
      throw new Error('expected parseDsRequest to throw');
    } catch (e) {
      expect((e as Error).message).toContain('evilA');
      expect((e as Error).message).toContain('evilB');
    }
  });

  it('rejects a non-object body', () => {
    expect(() => parseDsRequest(null)).toThrow();
    expect(() => parseDsRequest([{ ds: 'Users' }])).toThrow();
    expect(() => parseDsRequest('Users')).toThrow();
  });

  it('rejects a missing ds', () => {
    expect(() => parseDsRequest({ query: {} })).toThrow();
  });

  it('rejects a wrong-typed envelope field', () => {
    expect(() => parseDsRequest({ ds: 'Users', debug: 'yes' })).toThrow();
    expect(() => parseDsRequest({ ds: 'Users', rows: 'not-an-array' })).toThrow();
  });
});

describe('validateQuery', () => {
  it('accepts a fully-populated valid query', () => {
    expect(() =>
      validateQuery({
        match: { status: 'Active', isArchived: false },
        filters: [{ status: { in: ['Active'] } }],
        select: ['id', 'name'],
        groupBy: ['status'],
        sort: { name: 1 },
        projection: { id: 1 },
        limit: 10,
        offset: 0,
        countOnly: true,
        fetchDistinct: false,
      }),
    ).not.toThrow();
  });

  it('accepts an empty query', () => {
    expect(() => validateQuery({})).not.toThrow();
  });

  it('rejects a server-only field with the specific guard message', () => {
    try {
      validateQuery({ match: {}, fullSQL: 'DROP TABLE users' });
      throw new Error('expected validateQuery to throw');
    } catch (e) {
      expect(isUserError(e)).toBe(true);
      expect((e as Error).message).toContain('fullSQL');
      expect((e as Error).message).toContain('not allowed');
    }
  });

  it('rejects an unknown query field, naming it', () => {
    try {
      validateQuery({ match: {}, bogusProp: 1 });
      throw new Error('expected validateQuery to throw');
    } catch (e) {
      expect((e as Error).message).toContain('bogusProp');
    }
  });

  it('rejects statically-typed props of the wrong type', () => {
    expect(() => validateQuery({ limit: 'ten' })).toThrow();
    expect(() => validateQuery({ select: 'id' })).toThrow(); // not an array
    expect(() => validateQuery({ sort: { name: 'asc' } })).toThrow(); // value must be number
    expect(() => validateQuery({ countOnly: 1 })).toThrow();
  });

  it('accepts T-dependent props loosely without inspecting their contents', () => {
    expect(() => validateQuery({ match: { anyKey: { nested: true } }, filters: [42, 'x'] })).not.toThrow();
  });
});
