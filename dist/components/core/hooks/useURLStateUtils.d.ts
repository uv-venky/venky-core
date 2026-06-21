export type Serializer<T> = (val: T) => string;
export type Deserializer<T> = (val: string | null) => T | null;
export type Validator<T> = (val: T) => boolean;
export declare function defaultDeserialize<T>(v: string | null): T | null;
export declare function defaultSerialize<T>(v: T): string;
export declare function defaultValidator(): boolean;
export declare function jsonSerialize<T>(v: T): string;
export declare function jsonDeserialize<T>(v: string | null): T | null;
export declare function base64Serialize(v: string): string;
export declare function base64Deserialize(v: string | null): string | null;
export declare function stringSerialize<T extends string>(v: T): string;
export declare function stringDeserialize<T extends string>(v: string | null): T | null;
export declare function intSerialize(v: number): string;
export declare function intDeserialize(v: string | null): number | null;
//# sourceMappingURL=useURLStateUtils.d.ts.map