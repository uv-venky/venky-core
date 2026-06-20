/* Copyright (c) 2023-present Venky Corp. */

import { describe, expect, it as test } from 'vitest';
import {
  get,
  getIn,
  has,
  hasIn,
  insert,
  insertIn,
  isPath,
  isChildPath,
  remove,
  removeIn,
  set,
  setIn,
  toCollection,
  update,
  updateIn,
} from '@/components/core/mutX';

describe('ImmutableUtils', () => {
  test('get', () => {
    const collection = { key: 'value' };
    expect(get(collection, 'key')).toEqual('value');
  });

  test('get number key', () => {
    const key = 1;
    const collection = { [key]: 'value' };
    expect(get(collection, key)).toEqual('value');
  });

  test('get null', () => {
    const key = 1;
    const collection = { [key]: null };
    expect(get(collection, key)).toEqual(null);
  });

  test('has', () => {
    const collection = { key: 'value' };
    expect(has(collection, 'key')).toEqual(true);
  });

  test('has null', () => {
    const collection = { key: null };
    expect(has(collection, 'key')).toEqual(true);
  });

  test('has array', () => {
    const collection = [null, null];
    expect(has(collection, 0)).toEqual(true);
  });

  test('has array size', () => {
    const collection = [null, null];
    expect(has(collection, 3)).toEqual(false);
  });

  test('has 1', () => {
    const key = 1;
    const collection = { [key]: 'value' };
    expect(has(collection, key)).toEqual(true);
  });

  test('set same value should not mutate', () => {
    const collection = { key: 'value' };
    const result = set(collection, 'key', 'value');
    expect(result === collection).toEqual(true);
  });

  test('set different value should not mutate', () => {
    const collection = { key: 'value' };
    const result = set(collection, 'key', 'value1');
    expect(result !== collection).toEqual(true);
  });

  test('set', () => {
    const collection = { key: 'value' };
    const result = set(collection, 'key', 'value1');
    expect(collection.key).toEqual('value');
    expect(result.key).toEqual('value1');
  });

  test('set array', () => {
    const collection = ['a', 'b'];
    const result = set(collection, 0, 'value');
    expect(collection[0]).toEqual('a');
    expect(result[0]).toEqual('value');
  });

  test('set array size', () => {
    const collection: string[] = [];
    const result = set(collection, 0, 'value');
    expect(result[0]).toEqual('value');
  });

  test('set array > size', () => {
    expect(() => set([], 1, 'value')).not.toThrow();
  });

  test('setIn array > size', () => {
    expect(() => setIn({ key: { key2: [[]] } }, ['key', 'key2', 2, 1], 'value')).not.toThrow();
  });

  test('set 1', () => {
    const key = 1;
    const collection: any = { key0: 'value' };
    const result = set(collection, key, 'value1');
    expect(collection[key]).toEqual(undefined);
    expect(result[key]).toEqual('value1');
  });

  test('update', () => {
    const collection = { key: 'value' };
    const result = update(collection, 'key', () => 'value1');
    expect(collection.key).toEqual('value');
    expect(result.key).toEqual('value1');
  });

  test('update non collection - null', () => {
    const collection = null;
    expect(() => update(collection, 'a', () => 'value')).toThrowError(
      'Invalid collection passed! Must be an array or plain object. Passed null!',
    );
  });

  test('update non collection - string', () => {
    const collection = 'x';
    expect(() => update(collection, 'a', () => 'value')).toThrowError(
      'Invalid collection passed! Must be an array or plain object. Passed string!',
    );
  });

  test('remove', () => {
    const collection = { key: 'value' };
    const result = remove(collection, 'key');
    expect(collection.key).toEqual('value');
    expect(result.key).toEqual(undefined);
  });

  test('setIn child1 no change', () => {
    const collection = {
      child1: { key: 'value' },
      child2: { key: 'value' },
    };
    const result = setIn(collection, ['child2', 'key'], 'value1');
    expect(collection.child1 === result.child1).toEqual(true);
  });

  test('setIn null', () => {
    const collection = { child: { key: null } };
    const result = setIn(collection, ['child', 'key', 'childkey'], 'value');
    expect(collection.child === result.child).toEqual(false);
    expect(getIn(result, ['child', 'key', 'childkey'], '')).toEqual('value');
  });

  test('setIn 2', () => {
    const collection = {
      child1: { key: 'value' },
      child2: { key: 'value' },
    };
    const result = setIn(collection, ['child2', 'key'], 'value');
    expect(collection.child2.key).toEqual('value');
    expect(collection.child2 === result.child2).toEqual(true);
    expect(collection === result).toEqual(true);
  });

  test('setIn number key', () => {
    const key = 1;
    const collection = {
      child1: { key1: 'value' },
      child2: { [key]: 'value' },
    };
    const result = setIn(collection, ['child2', key], 'value');
    expect(collection.child2[key]).toEqual('value');
    expect(collection.child2 === result.child2).toEqual(true);
    expect(collection === result).toEqual(true);
  });

  test('setIn number key 2', () => {
    const key = 1;
    const collection = {
      child1: { key1: 'value' },
      child2: { [key]: 'value' },
    };
    const result = setIn(collection, ['child2', key], 'value1');
    expect(collection.child2[key]).toEqual('value');
    expect(result.child2[key]).toEqual('value1');
  });

  test('setIn 3', () => {
    const collection = {
      child1: [{ key: 'value' }],
      child2: [{ key: 'value' }],
    };
    const result = setIn(collection, ['child2', 0], collection.child2[0]);
    expect(collection.child2 === result.child2).toEqual(true);
    expect(collection === result).toEqual(true);
  });

  test('setIn 4', () => {
    const collection = {
      child1: [{ key: 'value' }],
      child2: [{ key: 'value' }],
    };
    const result = setIn(collection, ['child2', 0, 'key'], 'value');
    expect(collection.child2 === result.child2).toEqual(true);
    expect(collection.child2[0] === result.child2[0]).toEqual(true);
    expect(collection === result).toEqual(true);
  });

  test('setIn array', () => {
    const collection = {
      child1: [{ key: 'value' }],
      child2: [{ key: 'value' }],
    };
    const result = setIn(collection, ['child2', 0, 'key'], 'value1');
    expect(collection.child2[0].key).toEqual('value');
    expect(result.child2[0].key).toEqual('value1');
  });

  test('setIn array 2', () => {
    const collection = { a: { b: {} } };
    const arr = ['a', 'b', 'c'];
    const result = setIn(collection, ['a', 'b'], arr);
    expect(Array.isArray(result.a.b)).toBe(true);
    expect(result).toStrictEqual({ a: { b: arr } });
  });

  test('updateIn array', () => {
    const collection = {
      child1: [{ key: 'value' }],
      child2: [{ key: 'value' }],
    };
    const result = updateIn(collection, ['child2', 0, 'key'], () => 'value1');
    expect(collection.child2[0].key).toEqual('value');
    expect(result.child2[0].key).toEqual('value1');
  });

  test('updateIn child2 no change', () => {
    const collection = {
      child1: { key: 'value' },
      child2: { key: 'value' },
    };
    const result = updateIn(collection, ['child2', 'key'], () => 'value1');
    expect(collection.child2.key).toEqual('value');
    expect(result.child2.key).toEqual('value1');
  });

  test('removeIn child2', () => {
    const collection = {
      child1: { key: 'value' },
      child2: { key: 'value' },
    };
    const result = removeIn(collection, ['child2', 'key']);
    expect(collection.child2.key).toEqual('value');
    expect(result.child2.key).toEqual(undefined);
  });

  test('removeIn non existing child', () => {
    const collection = { a: {} };
    const result = removeIn(collection, ['a', 'b', 'c']);
    expect(result).toStrictEqual(collection);
  });

  test('removeIn [] Invalid key', () => {
    const collection = { a: [] };
    expect(() => removeIn(collection, ['a', 'b', 'c'])).toThrowError(
      'Invalid key b. Must be of type number. Path: ["a","b","c"] at index 1.',
    );
  });

  test('updateIn [] Invalid key', () => {
    const collection = { a: [] };
    expect(() => updateIn(collection, ['a', 'b', 'c'], () => 1)).toThrowError(
      'Invalid key b. Must be of type number. Path: ["a","b","c"] at index 1.',
    );
  });

  test('removeIn [] Invalid key nested', () => {
    const collection = { a: { b: [] } };
    expect(() => removeIn(collection, ['a', 'b', 'c'])).toThrowError(
      'Invalid key c. Must be of type number. Path: ["a","b","c"] at index 2.',
    );
  });

  test('remove non existing key', () => {
    const collection = { a: 'A' };
    expect(remove(collection, 'b')).toStrictEqual(collection);
  });

  test('remove [] Invalid key', () => {
    const collection = [0];
    expect(() => remove(collection, 'a')).toThrowError('Invalid key a. Must be of type number.');
  });

  test('remove 1', () => {
    const collection = [1, 2, 3];
    const result = remove(collection, 0);
    expect(result.length).toEqual(2);
  });

  test('remove a', () => {
    const collection = { a: 'A' };
    expect(remove(collection, 'a')).toEqual({});
  });

  test('remove null', () => {
    const collection: any = [1, null, 3];
    const result = remove(collection, 1);
    expect(get(collection, 1)).toEqual(null);
    expect(result.length).toEqual(2);
    expect(result[1]).toEqual(3);
  });

  test('getIn []', () => {
    const collection = { name: 'Steve' };
    expect(getIn(collection, [], undefined)).toMatchObject({
      name: 'Steve',
    });
  });

  test('removeIn [] obj', () => {
    const collection = { name: 'Steve' };
    expect(removeIn(collection, [])).toMatchObject({});
  });

  test('removeIn [] array', () => {
    const collection = ['a', 'b'];
    expect(removeIn(collection, [])).toMatchObject([]);
  });

  test('getIn default value', () => {
    expect(getIn({}, ['x', 'y'], 'dv')).toBe('dv');
  });

  test('setIn []', () => {
    const collection = { name: 'Steve' };
    const updatedCollection = setIn(collection, [], { name: 'Jobs' });
    expect(getIn(updatedCollection, [], undefined)).toMatchObject({
      name: 'Jobs',
    });
  });

  test('setIn [] Invalid key', () => {
    const collection = { arr: [] };
    expect(() => setIn(collection, ['arr', 'a'], 1)).toThrowError(
      'Invalid key a. Must be of type number. Path: ["arr","a"] at index 1.',
    );
  });

  test('setIn [] same value', () => {
    const collection = { arr: ['a'] };
    const newCollection = setIn(collection, ['arr', 0], 'a');
    expect(newCollection).toBe(collection);
  });

  test('setIn empty object', () => {
    const collection = { a: { b: { c: 'val' } } };
    const newCollection = setIn(collection, ['a', 'b'], {});
    expect(newCollection).toStrictEqual({ a: { b: {} } });
  });

  test('setIn [] add value', () => {
    const collection = { arr: ['a'] };
    const newCollection = setIn(collection, ['arr', 1], 'b');
    expect(newCollection).toStrictEqual({ arr: ['a', 'b'] });
  });

  test('updateIn [] Invalid key 2', () => {
    const collection = { arr: [] };
    expect(() => updateIn(collection, ['arr', 'a'], () => 1)).toThrowError(
      'Invalid key a. Must be of type number. Path: ["arr","a"] at index 1.',
    );
  });

  test('getIn [] Invalid key', () => {
    const collection = { arr: [] };
    expect(() => getIn(collection, ['arr', 'a'], 1)).toThrowError(
      `Invalid key a. Must be of type number. Path: ["arr","a"].`,
    );
  });

  test('getIn [] Invalid key 3', () => {
    const collection = { arr: 'a' };
    expect(() => getIn(collection, ['arr', 'a'], 1)).toThrowError(
      'Invalid path ["arr","a"] at index 0. Must be an object. Instead found a',
    );
  });

  test('getIn [] string index', () => {
    const collection = { arr: ['a', 'b', 'c'] };
    expect(getIn(collection, ['arr', '2'], 'x')).toEqual('c');
  });

  test('hasIn [] string index', () => {
    const collection = { arr: ['a', 'b', 'c'] };
    expect(hasIn(collection, ['arr', '2'])).toEqual(true);
  });

  test('updateIn [] string index', () => {
    const collection = { arr: ['a', 'b', 'c'] };
    expect(
      getIn(
        updateIn(collection, ['arr', '2'], () => 'x'),
        ['arr', '2'],
        'y',
      ),
    ).toEqual('x');
  });

  test('updateIn [] Invalid key must be an object', () => {
    const collection = { arr: 'a' };
    expect(() => updateIn(collection, ['arr', 'a'], () => 1)).toThrowError(
      'Invalid path ["arr","a"] at index 0. Must be an object. Instead found a',
    );
  });

  test('updateIn [] array out of range set', () => {
    const collection = { a: { b: [] } };
    expect(updateIn(collection, ['a', 'b', 1], () => 1)).toEqual({
      a: { b: [undefined, 1] },
    });
  });

  test("updateIn ['a', 'b', 0, 'c']", () => {
    const collection = { a: { b: [{ c: 'x' }] } };
    expect(updateIn(collection, ['a', 'b', 0, 'c'], () => 'y')).toEqual({
      a: { b: [{ c: 'y' }] },
    });
  });

  test("updateIn ['a', 'b', 0, 'c'] nested", () => {
    const collection = { a: { b: [[{ c: 'x' }]] } };
    expect(updateIn(collection, ['a', 'b', 0, 0, 'c'], () => 'y')).toEqual({
      a: { b: [[{ c: 'y' }]] },
    });
  });

  test(`has in null collection`, () => {
    const collection = null;
    expect(has(collection, 'a')).toBe(false);
  });

  test(`has in string`, () => {
    const collection = 'a';
    expect(() => has(collection, 'a')).toThrowError(
      'Invalid collection passed! Must be an array or plain object. Passed string!',
    );
  });

  test(`get in null collection`, () => {
    const collection = null;
    expect(get(collection, 'a')).toBe(undefined);
  });

  test(`get in string`, () => {
    const collection = 'a';
    expect(() => get(collection, 'a')).toThrowError(
      'Invalid collection passed! Must be an array or plain object. Passed string!',
    );
  });

  test(`hasIn ['name'] true`, () => {
    const collection = { name: 'Steve' };
    expect(hasIn(collection, ['name'])).toBe(true);
  });

  test(`hasIn ['a', 'b'] false`, () => {
    const collection = { a: {} };
    expect(hasIn(collection, ['a', 'b', 'c'])).toBe(false);
  });

  test(`hasIn ['a', 'b', 'c'] false`, () => {
    const collection = { a: {} };
    expect(hasIn(collection, ['a', 'b', 'c'])).toBe(false);
  });

  test(`hasIn [] true`, () => {
    const collection = { name: 'Steve' };
    expect(hasIn(collection, [])).toBe(true);
  });

  test(`hasIn ['name'] false`, () => {
    const collection = { value: 'Steve' };
    expect(hasIn(collection, ['name'])).toBe(false);
  });

  test('hasIn [] Invalid key', () => {
    const collection = { arr: [] };
    expect(() => hasIn(collection, ['arr', 'a'])).toThrowError(
      `Invalid key a. Must be of type number. Path: ["arr","a"].`,
    );
  });

  test('hasIn [] Invalid key 3', () => {
    const collection = { arr: 'a' };
    expect(() => hasIn(collection, ['arr', 'a'])).toThrowError(
      'Invalid path ["arr","a"] at index 0. Must be an object. Instead found a.',
    );
  });

  test('insert array middle', () => {
    const collection = [1, 3];
    const result = insertIn(collection, [1], 2);
    expect(result).toStrictEqual([1, 2, 3]);
  });

  test('insert array end', () => {
    const collection = [1, 2];
    const result = insertIn(collection, [2], 3);
    expect(result).toStrictEqual([1, 2, 3]);
  });

  test('insert Index out of bound', () => {
    const collection = [1, 2];
    expect(() => insert(collection, 3, () => 3)).toThrowError(`Index out of bound! Index 3. Size 2.`);
  });

  test('insertIn Index out of bound', () => {
    const collection = [1, 2];
    expect(() => insertIn(collection, [3], 3)).toThrowError(
      'Index out of bound! Index 3. Size 2. Path: [3] at index 0.',
    );
  });

  test('insert Index out of bound 2', () => {
    const collection = {};
    expect(() => insert(collection, 3, () => 3)).toThrowError(
      `insert called on invalid collection. collection must be of type Array`,
    );
  });

  test('insertIn Index out of bound 3', () => {
    const collection = {};
    expect(() => insertIn(collection, [3], 3)).toThrowError(
      'insertIn called on invalid collection. leaf collection must be of type Array & leaf path must be a number. Path: [3] at index 0.',
    );
  });

  test('insertIn array middle', () => {
    const collection = { a: { b: [1, 3] } };
    const result = insertIn(collection, ['a', 'b', 1], 2);
    expect(result).toStrictEqual({ a: { b: [1, 2, 3] } });
  });

  test('insertIn array end', () => {
    const collection = { a: { b: [1, 2] } };
    const result = insertIn(collection, ['a', 'b', 2], 3);
    expect(result).toStrictEqual({ a: { b: [1, 2, 3] } });
  });

  test('toCollection', () => {
    const collection = 'a';
    expect(() => toCollection(collection, 'Error')).toThrowError('Error');
  });

  test('isPath', () => {
    expect(isPath([])).toBe(true);
    expect(isPath({})).toBe(false);
  });

  test('isChildPath child', () => {
    expect(isChildPath(['a', 'b'], ['a'])).toBe(false);
  });

  test('isChildPath not child', () => {
    expect(isChildPath(['a'], ['a', 'b'])).toBe(true);
  });
});
