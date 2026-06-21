export declare class PivotSearchAsyncSource<Item, ColumnKey extends string> {
    data: ReadonlyArray<Readonly<Item>>;
    key: ColumnKey;
    getTextValue: (item: Readonly<Item>, field: ColumnKey) => string;
    values: string[];
    constructor(data: ReadonlyArray<Readonly<Item>>, key: ColumnKey, getTextValue: (item: Readonly<Item>, field: ColumnKey) => string);
    getOptions(filter: string): readonly string[];
    getOptionsForValue(value: string[]): readonly string[];
}
export declare class PivotSearchAsyncSourceMap<Item, ColumnKey extends string> {
    data: ReadonlyArray<Readonly<Item>>;
    getTextValue: (item: Readonly<Item>, field: ColumnKey) => string;
    map: Map<ColumnKey, PivotSearchAsyncSource<Item, ColumnKey>>;
    constructor(data: ReadonlyArray<Readonly<Item>>, getTextValue: (item: Readonly<Item>, field: ColumnKey) => string);
    getSearchSource(key: ColumnKey): PivotSearchAsyncSource<Item, ColumnKey>;
}
//# sourceMappingURL=PivotSearchAsyncSource.d.ts.map