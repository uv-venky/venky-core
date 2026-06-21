export declare function deepEqualArray(a: readonly unknown[], b: readonly unknown[]): boolean;
export declare function deepEqual(a: any, b: any): boolean;
/**
 * Deep-clone JSON-like trees without `JSON.stringify` when possible.
 * Large payloads can exceed V8 max string length and throw `RangeError: Invalid string length`.
 */
export declare function deepUnwrap<T>(obj: T): T;
//# sourceMappingURL=deepUtils.d.ts.map