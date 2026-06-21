import { type Key, type Path } from '../../../components/core/mutX/ImmutableTypes';
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
declare function update<C>(collection: C, key: Key, updater: (val: unknown) => unknown): C;
declare function set<C>(collection: C, key: Key, value: unknown): C;
declare function get(collection: any, key: Key): any;
declare function getIn(collection: any, path: Path, defaultValue: any): any;
declare function has(collection: any, key: Key): boolean;
declare function hasIn(collection: any, path: Path): boolean;
declare function insert<C>(collection: C, key: number, updater: (val: unknown) => unknown): C;
declare function updateIn<C>(collection: C, path: Path, updater: (val: unknown) => unknown): C;
declare function setIn<C>(collection: C, path: Path, value: unknown): C;
declare function insertIn<C>(collection: C, path: Path, value: unknown): C;
declare function remove<C>(collection: C, key: Key): C;
declare function removeIn<C>(collection: C, path: Path): C;
export { get, getIn, has, hasIn, insert, insertIn, remove, removeIn, set, setIn, update, updateIn };
//# sourceMappingURL=ImmutableUtils.d.ts.map