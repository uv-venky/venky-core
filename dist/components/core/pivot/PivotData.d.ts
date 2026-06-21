import { type Sort } from '../../../components/core/pivot/PivotTypes';
import type { Aggregator, AggregatorNames } from '../../../components/core/pivot/PivotUtils';
import { type SorterConfig } from '../../../components/core/pivot/PivotUtils';
import type { CalculatedColumn, ValuesPosition } from '../../../components/core/pivot/PivotTypes';
export type Sorters<TColumnKey extends string> = Partial<Record<TColumnKey, SorterConfig>>;
type Props<TColumnKey extends string, TItem> = {
    data: ReadonlyArray<Readonly<TItem>>;
    aggregatorName: AggregatorNames;
    /** Per-value aggregator overrides. When set, each value column can use its own aggregation. */
    valueAggregators?: Partial<Record<TColumnKey, AggregatorNames>>;
    cols: Array<TColumnKey>;
    rows: Array<TColumnKey>;
    measure?: TColumnKey;
    values: Array<TColumnKey>;
    sorters: Sorters<TColumnKey>;
    getTextValue: (item: Readonly<TItem>, attr: TColumnKey) => string;
    getNumberValue: (item: Readonly<TItem>, attr: TColumnKey) => number;
    /** Optional per-value decimal behavior; when false, format aggregated values with 0 decimals. */
    getAllowDecimals?: (field: TColumnKey) => boolean | undefined;
    showRowTotals: boolean;
    showColumnTotals: boolean;
    /** When false, hides the grand total cell (bottom-right). Default true. */
    showGrandTotal?: boolean;
    filters?: Partial<Record<TColumnKey, string[]>>;
    hideZeroValues: boolean;
    sort?: Sort;
    getTotalLabel?: (props: {
        aggregatorName: AggregatorNames;
        defaultLabel: string;
        values: Array<TColumnKey>;
        location: 'header' | 'footer';
    }) => string;
    flattenLayout?: boolean;
    calculatedColumns?: Array<CalculatedColumn<TColumnKey>>;
    /** Position of values - 'columns' (default) or 'rows' */
    valuesPosition?: ValuesPosition;
    /** Optional callback to get display label for a value key */
    getValueLabel?: (valueKey: TColumnKey) => string;
    /** When true (default), column dimensions appear before values in header. When false, values before columns. */
    columnsBeforeValues?: boolean;
};
declare class PivotData<TColumnKey extends string, TItem> {
    config: Props<TColumnKey, TItem>;
    rowKeys: Array<Array<string>>;
    colKeys: Array<Array<string>>;
    rowTotals: Record<string, Aggregator<Readonly<TItem>>>;
    colTotals: Record<string, Aggregator<Readonly<TItem>>>;
    allTotal: Aggregator<Readonly<TItem>>;
    sorted: boolean;
    tree: Record<string, Record<string, Aggregator<Readonly<TItem>>>>;
    recordsTree: Record<string, Record<string, Array<Readonly<TItem>>>>;
    aggregator: () => Aggregator<Readonly<TItem>>;
    constructor(inputProps: Props<TColumnKey, TItem>);
    init(inputProps: Props<TColumnKey, TItem>): void;
    doSort: (sort?: Sort) => boolean;
    removeHeaderTotalsWithSingleColumn(): void;
    removeRowTotalsWithSingleRow(): void;
    /** Returns indices to collapse so only the first row dimension is visible (e.g. Region only). */
    getIndicesToCollapseAllRows(): Array<[number, number]>;
    /** Returns indices to collapse so only the first column dimension is visible (e.g. channel only). */
    getIndicesToCollapseAllColumns(): Array<[number, number]>;
    arrSort(attrs: Array<TColumnKey>, sort?: Sort): (a: Array<string>, b: Array<string>) => number;
    sortKeys(sort?: Sort): boolean;
    getColKeys(): Array<Array<string>>;
    /** Header when values/calcs are outermost, column dimensions nested (Excel-style "values before columns"). */
    getHeaderValuesBeforeCols(colKeys: Array<Array<string>>, values: Array<TColumnKey>, calcCols: Array<CalculatedColumn<TColumnKey>>, len: number): ReadonlyArray<ReadonlyArray<string>>;
    /**
     * Header when columnsBeforeValues is false: one column per (colKey, value/calc) in the same
     * order as getDataColumnSequence() so header and data column indices align.
     */
    getHeaderColsBeforeValues(colKeys: Array<Array<string>>, values: Array<TColumnKey>, calcCols: Array<CalculatedColumn<TColumnKey>>, len: number): ReadonlyArray<ReadonlyArray<string>>;
    /**
     * Returns the sequence of data columns (colKeyIdx, valueIdx or calcIdx) for iteration.
     * When columnsBeforeValues: for each colKey, all values then all calcs.
     * When valuesBeforeColumns: for each value/calc, all colKeys.
     */
    getDataColumnSequence(): Array<{
        colKeyIdx: number;
        valueIdx?: number;
        calcIdx?: number;
    }>;
    getRowKeys(): Array<Array<string>>;
    getAllRecordsForCalculatedColumn(): Array<Readonly<TItem>>;
    getAllRecordsForColumnKey(colKey: Array<string>): Array<Readonly<TItem>>;
    processRecord: (record: Readonly<TItem>) => void;
    getAggregator: (rowKey: Array<string>, colKey: Array<string>) => Aggregator<Readonly<TItem>>;
    getHeader(): ReadonlyArray<ReadonlyArray<string>>;
    getCellData(rowIndex: number, columnIndex: number): Partial<Record<TColumnKey, string>>;
    private formatCalcResult;
    private computeCalcForRecords;
    private resolvedTotalLabel;
    /**
     * Returns the footer row(s) that mirror what `SimplePivotTableFooterCell` renders.
     * Each row uses the same cell layout as `getTableData()`: row-dimension labels first,
     * then per-column data cells (single-element arrays when values are exploded into
     * individual columns, multi-element arrays for bundled cells), followed by row totals.
     *
     * - Returns an empty array when `showColumnTotals` is disabled.
     * - Returns N rows when `valuesPosition: 'rows'` with multiple metrics (one per metric).
     * - Returns 1 row otherwise.
     */
    getFooter(): Array<Array<string | Array<string>>>;
    getTableData(): Array<Array<string | Array<string>>>;
}
export { PivotData };
//# sourceMappingURL=PivotData.d.ts.map