import type React from 'react';
import type { Sorters } from '../../../components/core/pivot/PivotData';
import type { CellProps, CellXStyleCallback, Density } from '../../../components/core/pivot/PivotTypes';
import type { AggregatorNames } from '../../../components/core/pivot/PivotUtils';
export type SimplePivotTableProps<Item, ColumnKey extends string> = {
    CellRenderer?: React.ComponentType<CellProps<Item, ColumnKey>>;
    data: ReadonlyArray<Readonly<Item>>;
    disableSort?: boolean;
    emptyStateSubtitle?: string;
    emptyStateTitle?: string;
    getCellStyle?: CellXStyleCallback<ColumnKey, Item>;
    getNumberValue: (item: Readonly<Item>, field: ColumnKey) => number;
    getTextValue: (item: Readonly<Item>, field: ColumnKey) => string;
    grayedOutSummaryCells?: boolean;
    hideBorders?: boolean;
    hideExpandCollapseIcons?: boolean;
    hideFilters?: boolean;
    hideZeroValues?: boolean;
    initialCollapsed: boolean;
    initialColumnCollapsed?: boolean;
    initialRowCollapsed?: boolean;
    /** Maximum footer height in pixels. Defaults to 40% of total height. When the footer overflows, a scrollbar and resize handle appear. */
    maxFooterHeight?: number;
    onFooterCellClick?: (formattedValue: string | Array<string>, context: Partial<Record<ColumnKey, string>>) => void;
    onValueCellClick?: (formattedValue: string | Array<string>, context: Partial<Record<ColumnKey, string>>) => void;
    onRowCellClick?: (columnKey: ColumnKey, value: string, context: Partial<Record<ColumnKey, string>>) => void;
    removeColumnLines?: boolean;
    removeRowLines?: boolean;
    rowHeight?: (density: Density) => number;
    showColumnTotals?: boolean;
    showRowTotals?: boolean;
    /** When false, hides the grand total cell (default true). */
    showGrandTotal?: boolean;
    /**
     * Per-field sort configuration.
     * - function: fully custom comparator
     * - 1: ascending (date-like values sort chronologically)
     * - -1: descending (date-like values sort chronologically)
     */
    sorters?: Sorters<ColumnKey>;
    getTotalLabel?: (props: {
        aggregatorName: AggregatorNames;
        defaultLabel: string;
        values: Array<ColumnKey>;
        location: 'header' | 'footer';
    }) => string;
};
export declare function SimplePivotTable<Item, ColumnKey extends string>(props: SimplePivotTableProps<Item, ColumnKey>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SimplePivotTable.d.ts.map