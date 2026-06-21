export declare function setHashParams(key: string, value: string | null | undefined): void;
export declare function useHashParams(): {
    current: {
        readonly size: number;
        readonly append: (name: string, value: string) => void;
        readonly delete: (name: string, value?: string) => void;
        readonly get: (name: string) => string | null;
        readonly getAll: (name: string) => string[];
        readonly has: (name: string, value?: string) => boolean;
        readonly set: (name: string, value: string) => void;
        readonly sort: () => void;
        readonly toString: () => string;
        readonly forEach: (callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any) => void;
        readonly entries: () => URLSearchParamsIterator<[string, string]>;
        readonly keys: () => URLSearchParamsIterator<string>;
        readonly values: () => URLSearchParamsIterator<string>;
        readonly [Symbol.iterator]: () => URLSearchParamsIterator<[string, string]>;
    };
    previous: {
        readonly size: number;
        readonly append: (name: string, value: string) => void;
        readonly delete: (name: string, value?: string) => void;
        readonly get: (name: string) => string | null;
        readonly getAll: (name: string) => string[];
        readonly has: (name: string, value?: string) => boolean;
        readonly set: (name: string, value: string) => void;
        readonly sort: () => void;
        readonly toString: () => string;
        readonly forEach: (callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any) => void;
        readonly entries: () => URLSearchParamsIterator<[string, string]>;
        readonly keys: () => URLSearchParamsIterator<string>;
        readonly values: () => URLSearchParamsIterator<string>;
        readonly [Symbol.iterator]: () => URLSearchParamsIterator<[string, string]>;
    };
};
export declare function useHashParam(key: string, onChange: (value: string | null) => void): [string | null, (value: string | null) => void];
//# sourceMappingURL=useHashParams.d.ts.map