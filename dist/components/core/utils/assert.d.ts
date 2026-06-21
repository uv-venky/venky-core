export declare class AssertionError extends Error {
    name: string;
}
export default function assert(condition: boolean, message: string): void;
export declare function assertExists<T>(actual: T, msg: string | (() => string)): asserts actual is NonNullable<T>;
//# sourceMappingURL=assert.d.ts.map