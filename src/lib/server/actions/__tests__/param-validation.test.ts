/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { isUserError } from '@/lib/core/common/error';
import type { ActionParamSchemaEntry } from '../registry-context';
import { validateActionParams } from '../param-validation';
import { ACTION_PARAM_SCHEMAS } from '../param-schemas.generated';

/** Validate against the real generated metadata + real ACTION_PARAM_OVERRIDES. */
const real = (action: keyof typeof ACTION_PARAM_SCHEMAS, args: unknown[]) =>
  validateActionParams(action, ACTION_PARAM_SCHEMAS[action], args);

const str = (name: string, optional = false): ActionParamSchemaEntry => ({
  name,
  label: name,
  type: 'string',
  optional,
});
const num = (name: string): ActionParamSchemaEntry => ({ name, label: name, type: 'number' });
const bool = (name: string): ActionParamSchemaEntry => ({ name, label: name, type: 'boolean' });
const obj = (name: string): ActionParamSchemaEntry => ({ name, label: name, type: 'object' });

describe('validateActionParams', () => {
  it('accepts well-typed primitive args', () => {
    expect(validateActionParams('a', [str('id')], ['abc'])).toEqual(['abc']);
    expect(validateActionParams('a', [num('count')], [5])).toEqual([5]);
    expect(validateActionParams('a', [bool('flag')], [true])).toEqual([true]);
  });

  it('rejects a primitive type mismatch', () => {
    expect(() => validateActionParams('a', [str('id')], [123])).toThrow();
    try {
      validateActionParams('a', [num('count')], ['5']);
    } catch (e) {
      expect(isUserError(e)).toBe(true);
      expect((e as Error).message).toContain('a');
    }
  });

  it('rejects too many args (strict arity) for a no-param action', () => {
    expect(validateActionParams('a', [], [])).toEqual([]);
    expect(() => validateActionParams('a', [], ['extra'])).toThrow();
  });

  it('rejects too few args when a param is required', () => {
    expect(() => validateActionParams('a', [str('x'), str('y')], ['only-x'])).toThrow();
  });

  it('allows omitting a trailing optional param', () => {
    const entries = [str('x'), str('y', true)];
    expect(validateActionParams('a', entries, ['x-val'])).toEqual(['x-val']);
    expect(validateActionParams('a', entries, ['x-val', 'y-val'])).toEqual(['x-val', 'y-val']);
  });

  it('accepts null for a nullable param and rejects it otherwise', () => {
    const nullableStr: ActionParamSchemaEntry = { name: 'x', label: 'x', type: 'string', nullable: true };
    expect(validateActionParams('a', [nullableStr], [null])).toEqual([null]);
    expect(validateActionParams('a', [nullableStr], ['v'])).toEqual(['v']);
    expect(() => validateActionParams('a', [str('x')], [null])).toThrow();
  });

  it('supports a param that is both nullable and optional', () => {
    const entry: ActionParamSchemaEntry = { name: 'x', label: 'x', type: 'string', nullable: true, optional: true };
    expect(validateActionParams('a', [entry], [])).toEqual([]); // omitted
    expect(validateActionParams('a', [entry], [null])).toEqual([null]); // null
    expect(validateActionParams('a', [entry], ['v'])).toEqual(['v']); // value
  });

  it('treats object params as pass-through by default', () => {
    expect(validateActionParams('a', [obj('payload')], [{ any: 1 }])).toEqual([{ any: 1 }]);
    expect(validateActionParams('a', [obj('payload')], ['still-fine'])).toEqual(['still-fine']);
  });

  it('applies a precise override for a named param when provided', () => {
    const overrides = { a: { kind: z.enum(['domain', 'skill']) } };
    expect(validateActionParams('a', [obj('kind'), str('id')], ['domain', 'x'], overrides)).toEqual(['domain', 'x']);
    expect(() => validateActionParams('a', [obj('kind'), str('id')], ['nope', 'x'], overrides)).toThrow();
  });
});

describe('real action overrides (generated metadata + ACTION_PARAM_OVERRIDES)', () => {
  it('enforces enum overrides', () => {
    expect(real('updateProfile', ['theme', 'dark'])).toEqual(['theme', 'dark']);
    expect(() => real('updateProfile', ['bogus', 'dark'])).toThrow();
  });

  it('honors a metadata-optional param without an override', () => {
    expect(real('updateAvatar', [])).toEqual([]);
    expect(real('updateAvatar', ['data:image/png;base64,abc'])).toEqual(['data:image/png;base64,abc']);
  });

  it('allows null for a nullable override', () => {
    expect(real('reactToComment', ['cm1', null, 'ctx', 'cid'])).toEqual(['cm1', null, 'ctx', 'cid']);
    expect(real('reactToComment', ['cm1', '👍', 'ctx', 'cid'])).toEqual(['cm1', '👍', 'ctx', 'cid']);
  });

  it('enforces required object fields but tolerates extra keys', () => {
    expect(real('getActivityEvents', [{ fromDate: '2024-01-01', toDate: '2024-01-31' }])).toEqual([
      { fromDate: '2024-01-01', toDate: '2024-01-31' },
    ]);
    expect(() => real('getActivityEvents', [{}])).toThrow();
    expect(() =>
      real('getActivityEvents', [{ fromDate: '2024-01-01', toDate: '2024-01-31', extra: true }]),
    ).not.toThrow();
    expect(real('getActivityEvents', [{ fromDate: '2024-01-01', toDate: '2024-01-31', extra: true }])).toEqual([
      { fromDate: '2024-01-01', toDate: '2024-01-31' },
    ]);
  });
});
