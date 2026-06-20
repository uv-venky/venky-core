/* Copyright (c) 2023-present Venky Corp. */

export type Key = string | number;

export type Path = ReadonlyArray<Key>;

export type ArrayCollection = ReadonlyArray<string | number> | Collection[];

export type ObjectCollection = {
  [key: string]: Collection | string | number | null | undefined | Collection[];
};

export type Collection = ArrayCollection | ObjectCollection;

export function toCollection(value: unknown, msg: string): Collection {
  if (value !== null && (Array.isArray(value) || typeof value === 'object')) {
    return value as Collection;
  }
  throw new Error(msg);
}

export function isArrayCollection(value: unknown): value is ArrayCollection {
  return value !== null && Array.isArray(value);
}

export function isObjectCollection(value: unknown): value is ObjectCollection {
  return !!value && !Array.isArray(value) && typeof value === 'object';
}

export function isCollection(value: unknown): value is Collection {
  return isArrayCollection(value) || isObjectCollection(value);
}

export function isNull(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isPath(path: any): path is Path {
  return Array.isArray(path);
}

export function isSamePath(p1: Path, p2: Path) {
  if (p1.length !== p2.length) {
    return false;
  }
  for (let i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i]) {
      return false;
    }
  }
  return true;
}

export function isChildPath(parent: Path, path: Path) {
  if (path.length <= parent.length) {
    return false;
  }
  for (let i = 0; i < parent.length; i++) {
    if (path[i] !== parent[i]) {
      return false;
    }
  }
  return true;
}
