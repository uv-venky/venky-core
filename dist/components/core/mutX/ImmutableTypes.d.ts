export type Key = string | number;
export type Path = ReadonlyArray<Key>;
export type ArrayCollection = ReadonlyArray<string | number> | Collection[];
export type ObjectCollection = {
    [key: string]: Collection | string | number | null | undefined | Collection[];
};
export type Collection = ArrayCollection | ObjectCollection;
export declare function toCollection(value: unknown, msg: string): Collection;
export declare function isArrayCollection(value: unknown): value is ArrayCollection;
export declare function isObjectCollection(value: unknown): value is ObjectCollection;
export declare function isCollection(value: unknown): value is Collection;
export declare function isNull(value: unknown): value is null | undefined;
export declare function isPath(path: any): path is Path;
export declare function isSamePath(p1: Path, p2: Path): boolean;
export declare function isChildPath(parent: Path, path: Path): boolean;
//# sourceMappingURL=ImmutableTypes.d.ts.map