declare const isNull: <V>(value: V | null | undefined) => value is null | undefined;
declare const isEmpty: (value: unknown) => value is null | undefined;
declare const nvl: <T>(value: T | null | undefined, defaultValue: T) => T;
declare const isNotEmpty: <T>(value: T | null | undefined) => value is T;
declare const NOT_DEFINED = "_NOT_DEFINED_";
declare function isNullEqual(a: unknown, b: unknown): boolean;
declare function shrink(value?: string, len?: number): string;
declare function isStrNumEqual(left: unknown, right: unknown): boolean;
declare function entries<T>(obj: T): [keyof T, T[keyof T]][];
declare function keys<T>(obj: T): (keyof T)[];
declare const EMPTY_ARRAY: Array<any>;
declare const EMPTY_OBJECT: Readonly<{}>;
declare function isEmptyObject(obj?: unknown): boolean;
declare function areEqualShallow(a: any, b: any): boolean;
declare function emptyFunction(): any;
export { EMPTY_ARRAY, EMPTY_OBJECT, NOT_DEFINED, areEqualShallow, emptyFunction, entries, isEmpty, isEmptyObject, isNotEmpty, isNull, isNullEqual, isStrNumEqual, keys, nvl, shrink, };
//# sourceMappingURL=isEmpty.d.ts.map