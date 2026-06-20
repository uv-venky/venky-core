/* Copyright (c) 2023-present Venky Corp. */

import {
  type ArrayCollection,
  type Collection,
  type Key,
  type ObjectCollection,
  type Path,
  toCollection,
  isArrayCollection,
  isObjectCollection,
  isNull,
  isCollection,
} from '@/components/core/mutX/ImmutableTypes';

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

function shallowCopy<C>(collection: C): Mutable<C> {
  if (Array.isArray(collection)) {
    return [...collection] as unknown as Mutable<C>;
  }
  return { ...collection } as Mutable<C>;
}

function arraySet<T extends ArrayCollection>(collection: T, key: number, value: any): T {
  if (collection[key] === value) {
    return collection;
  }
  // allow empty top rows. used for errors... if the 2nd line has error
  // we should be able to set the 2nd row as the 1st row will be missing if no errors
  // if (key > collection.length) {
  //   throw new Error(`Index out of bound! Index ${key}. Size ${collection.length}.`);
  // }
  if (key === collection.length) {
    return [...collection, value] as T;
  } else {
    const copy = shallowCopy(collection);
    copy[key] = value;
    return copy;
  }
}

function objectSet<T extends ObjectCollection>(collection: T, key: Key, value: unknown): T {
  if (collection[key] === value) {
    return collection;
  }
  return { ...collection, [key]: value };
}

function update<C>(collection: C, key: Key, updater: (val: unknown) => unknown): C {
  let key2 = key;
  if (isArrayCollection(collection)) {
    if (typeof key2 === 'string' && !Number.isNaN(+key2)) {
      key2 = Number(key2);
    }
    if (typeof key2 === 'number') {
      return arraySet(collection, key2, updater(collection.length > key2 ? collection[key2] : undefined));
    } else {
      throw new Error(`Invalid key ${String(key)}. Must be of type number.`);
    }
  } else if (isObjectCollection(collection)) {
    return objectSet(collection, key2, updater(collection[key2]));
  } else if (isNull(collection)) {
    throw new Error(`Invalid collection passed! Must be an array or plain object. Passed ${collection}!`);
  }
  throw new Error(`Invalid collection passed! Must be an array or plain object. Passed ${typeof collection}!`);
}

function set<C>(collection: C, key: Key, value: unknown): C {
  return update(collection, key, () => value);
}

function get(collection: any, key: Key): any {
  let key2 = key;
  if (isArrayCollection(collection)) {
    if (typeof key2 === 'string' && !Number.isNaN(+key2)) {
      key2 = Number(key2);
    }
    if (typeof key2 === 'number') {
      if (collection.length > key2) {
        return collection[key2];
      }
      return undefined;
    } else {
      throw new Error(`Invalid key ${key2}. Must be of type number.`);
    }
  } else if (isObjectCollection(collection)) {
    return collection[key2];
  } else if (isNull(collection)) {
    return undefined;
  }
  throw new Error(`Invalid collection passed! Must be an array or plain object. Passed ${typeof collection}!`);
}

function getInInternal(collection: any, path: Path, pathIndex: number): unknown {
  if (path.length === 0 && pathIndex === 0) {
    return collection;
  }
  const key = path[pathIndex];
  if (path.length === pathIndex + 1) {
    try {
      return get(collection, key);
    } catch (e) {
      throw new Error(`${e instanceof Error ? e.message : e} Path: ${JSON.stringify(path)}.`);
    }
  }
  const oldNestedValue = get(collection, key);
  if (isNull(oldNestedValue)) {
    return undefined;
  }
  if (!isCollection(oldNestedValue)) {
    throw new Error(
      `Invalid path ${JSON.stringify(path)} at index ${pathIndex}. Must be an object. Instead found ${oldNestedValue}`,
    );
  }
  return getInInternal(oldNestedValue, path, pathIndex + 1);
}

function getIn(collection: any, path: Path, defaultValue: any): any {
  const value = getInInternal(collection, path, 0);
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}

function has(collection: any, key: Key): boolean {
  let key2 = key;
  if (isArrayCollection(collection)) {
    if (typeof key2 === 'string' && !Number.isNaN(+key2)) {
      key2 = Number(key2);
    }
    if (typeof key2 === 'number') {
      return key2 in collection;
    } else {
      throw new Error(`Invalid key ${key2}. Must be of type number.`);
    }
  } else if (isObjectCollection(collection)) {
    return key2 in collection;
  } else if (isNull(collection)) {
    return false;
  }
  throw new Error(`Invalid collection passed! Must be an array or plain object. Passed ${typeof collection}!`);
}

function hasInInternal(collection: any, path: Path, pathIndex: number): boolean {
  if (path.length === 0 && pathIndex === 0) {
    return !isNull(collection);
  }
  const key = path[pathIndex];
  if (path.length === pathIndex + 1) {
    try {
      return has(collection, key);
    } catch (e) {
      throw new Error(`${e instanceof Error ? e.message : e} Path: ${JSON.stringify(path)}.`);
    }
  }
  const oldNestedValue = get(collection, key);
  if (isNull(oldNestedValue)) {
    return false;
  }
  if (!isCollection(oldNestedValue)) {
    throw new Error(
      `Invalid path ${JSON.stringify(path)} at index ${pathIndex}. Must be an object. Instead found ${oldNestedValue}.`,
    );
  }
  return hasInInternal(oldNestedValue, path, pathIndex + 1);
}

function hasIn(collection: any, path: Path): boolean {
  return hasInInternal(collection, path, 0);
}

function insert<C>(collection: C, key: number, updater: (val: unknown) => unknown): C {
  if (isArrayCollection(collection)) {
    if (key < collection.length) {
      const left = collection.slice(0, key);
      const right = collection.slice(key);
      return [...left, updater(collection[key]), ...right] as unknown as C;
    } else if (key === collection.length) {
      return [...collection, updater(undefined)] as unknown as C;
    }
    throw new Error(`Index out of bound! Index ${key}. Size ${collection.length}.`);
  }
  throw new Error(`insert called on invalid collection. collection must be of type Array.`);
}

function updateInInternal<C>(
  collection: C,
  path: Path,
  pathIndex: number,
  updater: (val: unknown) => unknown,
  performInsert: boolean,
): C {
  if (path.length === 0 && pathIndex === 0) {
    return updater(collection) as C;
  }
  const key = path[pathIndex];
  if (path.length === pathIndex + 1) {
    try {
      if (performInsert) {
        if (typeof key === 'number' && isArrayCollection(collection)) {
          return insert(collection, key, updater);
        }
        throw new Error(
          `insertIn called on invalid collection. leaf collection must be of type Array & leaf path must be a number.`,
        );
      }
      return update(collection, key, updater);
    } catch (e) {
      throw new Error(`${e instanceof Error ? e.message : e} Path: ${JSON.stringify(path)} at index ${pathIndex}.`);
    }
  }
  let oldNestedValue: Collection | null;
  try {
    oldNestedValue = get(collection, key) as Collection;
  } catch (e) {
    throw new Error(`${e instanceof Error ? e.message : e} Path: ${JSON.stringify(path)} at index ${pathIndex}.`);
  }

  let nestedValue: Collection;
  if (isNull(oldNestedValue)) {
    if (typeof path[pathIndex + 1] === 'number') {
      nestedValue = [];
    } else {
      nestedValue = {};
    }
  } else {
    if (!isCollection(oldNestedValue)) {
      throw new Error(
        `Invalid path ${JSON.stringify(
          path,
        )} at index ${pathIndex}. Must be an object. Instead found ${oldNestedValue}`,
      );
    }
    nestedValue = oldNestedValue;
  }
  nestedValue = updateInInternal(nestedValue, path, pathIndex + 1, updater, performInsert);
  if (nestedValue === oldNestedValue) {
    return collection;
  }
  return set(collection, key, nestedValue);
}

function updateIn<C>(collection: C, path: Path, updater: (val: unknown) => unknown): C {
  const copy: C = updateInInternal(collection, path, 0, updater, false);
  return copy;
}

function setIn<C>(collection: C, path: Path, value: unknown): C {
  return updateIn(collection, path, () => value);
}

function insertIn<C>(collection: C, path: Path, value: unknown): C {
  return updateInInternal(collection, path, 0, () => value, true);
}

function remove<C>(collection: C, key: Key): C {
  if (has(collection, key)) {
    if (isArrayCollection(collection)) {
      return [...collection.slice(0, key as number), ...collection.slice(+key + 1)] as unknown as C;
    }
    const copy = shallowCopy(collection);
    // @ts-expect-error key is in copy
    delete copy[key];
    return copy as C;
  }
  return collection;
}

function removeInInternal<C>(collection: C, path: Path, pathIndex: number): C {
  if (path.length === 0 && pathIndex === 0) {
    return (isArrayCollection(collection) ? [] : {}) as C;
  }
  const key = path[pathIndex];
  if (path.length === pathIndex + 1) {
    try {
      return remove(collection, key);
    } catch (e) {
      throw new Error(`${e instanceof Error ? e.message : e} Path: ${JSON.stringify(path)} at index ${pathIndex}.`);
    }
  }
  let oldNestedValue: Collection | null;
  try {
    oldNestedValue = get(collection, key);
  } catch (e) {
    throw new Error(`${e instanceof Error ? e.message : e} Path: ${JSON.stringify(path)} at index ${pathIndex}.`);
  }
  let nestedValue: Collection;
  if (isNull(oldNestedValue)) {
    return collection;
  } else {
    nestedValue = toCollection(
      oldNestedValue,
      `Invalid path ${JSON.stringify(path)} at index ${pathIndex}. Must be an object.`,
    );
  }
  nestedValue = removeInInternal(nestedValue, path, pathIndex + 1);
  if (nestedValue === oldNestedValue) {
    return collection;
  }
  return set(collection, key, nestedValue);
}

function removeIn<C>(collection: C, path: Path): C {
  return removeInInternal(collection, path, 0);
}

export { get, getIn, has, hasIn, insert, insertIn, remove, removeIn, set, setIn, update, updateIn };
