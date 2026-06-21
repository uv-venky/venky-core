import type { List } from 'immutable';
import type { CellComponentProps } from 'react-window';
import type { PivotData } from '../../../components/core/pivot/PivotData';
import type { PivotIntervalTree as IntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
import type { PivotSearchAsyncSourceMap } from '../../../components/core/pivot/PivotSearchAsyncSource';
import type { AggregatorNames } from '../../../components/core/pivot/PivotUtils';
import type { DataType, TableVariant } from '../../../components/core/common/types';
type AlignmentType = 'start' | 'center' | 'end';
export type Filter = {
    key: string;
    value: string;
};
export type PivotColumn<TColumnKey extends string> = {
    alignment?: AlignmentType;
    canBeColumn?: boolean;
    canBeMeasure?: boolean;
    canBeRow?: boolean;
    canBeValue?: boolean;
    dataType: DataType;
    /** When false, aggregated value cells should render with 0 decimals (e.g. 10 not 10.00). */
    allowDecimals?: boolean;
    group?: string;
    key: TColumnKey;
    label: string;
    tooltip?: string;
    width?: number;
};
export type Density = TableVariant;
export type SortDirection = 'ascending' | 'descending';
export type Sort = {
    colKeys: Array<string>;
    direction: SortDirection;
};
export type FormulaOperation = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'uniqueCount';
export type MathOperator = '+' | '-' | '*' | '/' | '%';
export type CalculatedColumn<TColumnKey extends string> = {
    id: string;
    name: string;
    width?: number;
    formula: {
        type: 'aggregation';
        numerator: {
            operation: FormulaOperation;
            column: TColumnKey;
        };
        denominator: {
            operation: FormulaOperation;
            column: TColumnKey;
        };
        mathOperator?: MathOperator;
        multiplier?: number;
    };
};
export type ValuesPosition = 'columns' | 'rows';
export type PivotSetting<TColumnKey extends string> = {
    rows: Array<TColumnKey>;
    cols: Array<TColumnKey>;
    measure?: TColumnKey;
    values: Array<TColumnKey>;
    aggregatorName: AggregatorNames;
    /** Per-value aggregator overrides. When set, each value column uses its own aggregation (e.g. Sum for revenue, Count for recordCount). */
    valueAggregators?: Partial<Record<TColumnKey, AggregatorNames>>;
    density?: Density;
    sort?: Sort;
    flattenLayout?: boolean;
    calculatedColumns?: Array<CalculatedColumn<TColumnKey>>;
    /** Position of values/measures - 'columns' (default) shows values as columns, 'rows' shows values as rows */
    valuesPosition?: ValuesPosition;
    /**
     * Column header order when both cols and values exist:
     * - true (default): for each value measure, show column dimensions (e.g. Quantity|Jan,Feb then Revenue|Jan,Feb)
     * - false: for each column dimension, show all values (e.g. Jan|qty,rev then Feb|qty,rev)
     * Treats calculated columns like value columns.
     */
    columnsBeforeValues?: boolean;
    /** Per-column width overrides (row columns and value/aggregated columns). Keyed by column key. */
    columnWidths?: Partial<Record<TColumnKey, number>>;
    /** Show row totals column (default true). */
    showRowTotals?: boolean;
    /** Show column totals footer row (default true). */
    showColumnTotals?: boolean;
    /** Show grand total cell in bottom-right corner (default true). Only applies when both row and column totals are shown. */
    showGrandTotal?: boolean;
};
export interface CollapsedRange {
    key: string;
    start: number;
    end: number;
    nested: Array<CollapsedRange>;
}
export type SortFn = (a: unknown, b: unknown) => number;
export type CellXStyleCallback<TColumnKey extends string, TItem> = (props: {
    columnIndex: number;
    isScrolling?: boolean;
    rowIndex: number;
    data: ItemData<PivotItemData<TColumnKey, TItem>>;
    type: 'header' | 'body' | 'footer';
    formattedValue?: string | Array<string>;
    numberValue?: number | Array<number>;
}) => string | undefined;
export interface PivotItemData<TColumnKey extends string, TItem> {
    columns: ReadonlyArray<PivotColumn<TColumnKey>>;
    density: Density;
    getActualColumnIndex: (columnIndex: number) => number;
    getActualRowIndex: (rowIndex: number) => number;
    header: ReadonlyArray<ReadonlyArray<string>>;
    pivot: PivotData<TColumnKey, TItem>;
    rows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
    isRowCollapsed: (rowIndex: number, columnIndex: number) => boolean;
}
export interface PivotItemDataInternal<TColumnKey extends string, TItem> extends PivotItemData<TColumnKey, TItem> {
    CellRenderer?: React.ComponentType<CellProps<TItem, TColumnKey>>;
    disableSort: boolean;
    getCellStyle?: CellXStyleCallback<TColumnKey, TItem>;
    grayedOutSummaryCells: boolean;
    hideBodyBottomBorder: boolean;
    hideBorders: boolean;
    hideExpandCollapseIcons: boolean;
    hideFilters: boolean;
    isColumnCollapsed: (rowIndex: number, columnIndex: number) => boolean;
    isRowCollapsed: (rowIndex: number, columnIndex: number) => boolean;
    onFooterCellClick?: (formattedValue: string | Array<string>, context: Partial<Record<TColumnKey, string>>) => void;
    onValueCellClick?: (formattedValue: string | Array<string>, context: Partial<Record<TColumnKey, string>>) => void;
    onRowCellClick?: (columnKey: TColumnKey, value: string, context: Partial<Record<TColumnKey, string>>) => void;
    removeColumnLines?: boolean;
    removeRowLines?: boolean;
    searchSourceMap: PivotSearchAsyncSourceMap<TItem, TColumnKey>;
    filters: Partial<Record<TColumnKey, Array<string>>>;
    setFilters: React.Dispatch<React.SetStateAction<Partial<Record<TColumnKey, Array<string>>>>>;
    dispatch: DispatchFn<TColumnKey, TItem>;
}
export interface ItemData<T> {
    startColumnIndex: number;
    endColumnIndex: number;
    startRowIndex: number;
    endRowIndex: number;
    data: T;
}
export type GridRenderComponent<T> = (props: CellComponentProps<ItemData<T>>) => React.ReactNode;
export type CellProps<TItem, TColumnKey extends string> = Readonly<{
    children: React.ReactNode;
    columnIndex: number;
    context: Partial<Record<TColumnKey, string>>;
    data: ItemData<PivotItemData<TColumnKey, TItem>>;
    density: Density;
    formattedValue: string | Array<string>;
    numberValue?: number | Array<number>;
    isScrolling?: boolean;
    rowIndex: number;
}>;
export declare const DENSITY_PROPS: {
    roomy: {
        rowHeight: number;
        headerHeight: number;
        columnWidthPercent: number;
        label: string;
    };
    compact: {
        rowHeight: number;
        headerHeight: number;
        columnWidthPercent: number;
        label: string;
    };
    default: {
        rowHeight: number;
        headerHeight: number;
        columnWidthPercent: number;
        label: string;
    };
    spacious: {
        rowHeight: number;
        headerHeight: number;
        columnWidthPercent: number;
        label: string;
    };
};
export declare const ROW_SPAN = "$row-span$";
export declare const COL_SPAN = "$col-span$";
export declare const COL_VALUE_SPAN = "$col-value-span$";
export declare const BOTH_SPAN = "$both-span$";
export declare const SPANS: string[];
export type PivotState<TColumnKey extends string, TItem> = Readonly<{
    pivot: PivotData<TColumnKey, TItem> | null;
    rowCollapseState: Record<string, CollapsedRange>;
    rowTree: IntervalTree;
    totalRows: number;
    headerCollapseState: Record<string, CollapsedRange>;
    columnTree: IntervalTree;
    totalColumns: number;
    rows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
    header: ReadonlyArray<ReadonlyArray<string>>;
    rawData: ReadonlyArray<Readonly<TItem>>;
    draftPowerSearchFilters: List<Filter>;
}>;
export type Action<TColumnKey extends string, TItem> = Readonly<{
    type: 'collapseRow';
    rowIndex: number;
    columnIndex: number;
} | {
    type: 'expandRow';
    rowIndex: number;
    columnIndex: number;
} | {
    type: 'collapseColumn';
    columnIndex: number;
    rowIndex: number;
} | {
    type: 'expandColumn';
    columnIndex: number;
    rowIndex: number;
} | {
    type: 'expandAll';
} | {
    type: 'collapseAll';
} | {
    type: 'setPivot';
    pivot: PivotData<TColumnKey, TItem>;
    initialCollapsed: boolean;
    initialColumnCollapsed: boolean;
    initialRowCollapsed: boolean;
    sortChanged: boolean;
} | {
    type: 'setDraftPowerSearchFilters';
    filters: List<Filter>;
}>;
export type DispatchFn<TColumnKey extends string, TItem> = (action: Action<TColumnKey, TItem>) => void;
export {};
//# sourceMappingURL=PivotTypes.d.ts.map