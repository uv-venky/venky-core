import type { CollapsedRange, ItemData, PivotItemData, PivotItemDataInternal, SortFn } from '../../../components/core/pivot/PivotTypes';
export type SorterDirection = 1 | -1;
export type SorterConfig = SortFn | SorterDirection;
export declare function makeKey({ rowIndex, columnIndex }: {
    rowIndex: number;
    columnIndex: number;
}): string;
export declare function parseKey(key: string): [number, number];
export declare const getSort: <TColumnKey extends string>(sorters: Partial<Record<TColumnKey, SorterConfig>>, attr: TColumnKey) => ((as: unknown, bs: unknown) => number);
type Formatter = (x: number, valueIndex?: number) => string;
export interface Aggregator<TItem> {
    push: (record: Readonly<TItem>) => void;
    values: () => Array<number>;
    /** Format a value. When valueIndex is provided, per-value aggregators use the formatter for that column (e.g. integer for Count). */
    format: Formatter;
}
interface Props<TColumnKey, TItem> {
    attrs: Array<TColumnKey>;
    getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number;
    getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string;
}
/**
 * Marker displayed when an aggregated value includes suppressed/redacted data.
 * When getNumberValue returns NaN for a record, the aggregation is "tainted"
 * and this marker is shown instead of a numeric result (e.g. 22 + '*' = '*').
 */
export declare const SUPPRESSED_MARKER = "*";
export type AggregatorNames = 'Count' | 'Sum' | 'Average' | 'Minimum' | 'Maximum' | 'Unique Count' | 'Integer Sum';
/**
 * Creates a composite aggregator that applies different aggregation types per value column.
 * Use when valueAggregators is provided (e.g. Sum for revenue, Count for recordCount).
 */
export declare function createCompositeAggregator<TColumnKey extends string, TItem>(props: {
    values: Array<TColumnKey>;
    valueAggregators: Partial<Record<TColumnKey, AggregatorNames>>;
    defaultAggregator: AggregatorNames;
    getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number;
    getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string;
}): () => Aggregator<Readonly<TItem>>;
import type { FormulaOperation } from '../../../components/core/pivot/PivotTypes';
/**
 * Compute aggregation on a column. Returns NaN if any record has a suppressed
 * value (getNumberValue returns NaN), propagating the tainted state through
 * calculated columns.
 */
export declare function computeAggregation<TColumnKey extends string, TItem>(operation: FormulaOperation, column: TColumnKey, records: ReadonlyArray<Readonly<TItem>>, getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number, getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string): number;
export declare function computeCalculatedColumn<TColumnKey extends string, TItem>(formula: {
    type: 'aggregation';
    numerator: {
        operation: FormulaOperation;
        column: TColumnKey;
    };
    denominator: {
        operation: FormulaOperation;
        column: TColumnKey;
    };
    mathOperator?: '+' | '-' | '*' | '/' | '%';
    multiplier?: number;
}, records: ReadonlyArray<Readonly<TItem>>, getNumberValue: (item: Readonly<TItem>, key: TColumnKey) => number, getTextValue: (item: Readonly<TItem>, key: TColumnKey) => string): number;
export declare const aggregators: Record<AggregatorNames, <TColumnKey, TItem>(props: Props<TColumnKey, TItem>) => () => Aggregator<TItem>>;
export declare function totalLabel(aggregatorName: AggregatorNames): string;
export declare function makePivotItemData<ColumnKey extends string, Item>(data: ItemData<PivotItemDataInternal<ColumnKey, Item>>): ItemData<PivotItemData<ColumnKey, Item>>;
export declare function compareSpans(a: string, b: string): 1 | -1 | boolean;
export declare function getCollapsedIndices(state: Record<string, CollapsedRange>): Array<[number, number]>;
export declare function getScrollbarSize(recalc?: boolean): number;
export {};
//# sourceMappingURL=PivotUtils.d.ts.map