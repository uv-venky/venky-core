import type { PivotData } from '../../../components/core/pivot/PivotData';
import { PivotIntervalTree as IntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
import type { CollapsedRange, PivotState } from '../../../components/core/pivot/PivotTypes';
export declare const INITIAL_STATE: <TColumnKey extends string, TItem>() => PivotState<TColumnKey, TItem>;
export declare function isHeaderEqual(a: ReadonlyArray<ReadonlyArray<string>>, b: ReadonlyArray<ReadonlyArray<string>>): boolean;
export declare function collapseColumn({ columnTree, rowIndex, columnIndex, header, headerCollapseState, pivot, }: {
    header: ReadonlyArray<ReadonlyArray<string>>;
    rowIndex: number;
    columnIndex: number;
    columnTree: IntervalTree;
    headerCollapseState: Record<string, CollapsedRange>;
    pivot?: PivotData<string, unknown> | null;
}): void;
export declare function collapseRow({ rowTree, rowIndex, columnIndex, rowCollapseState, rows, pivot, }: {
    rowIndex: number;
    columnIndex: number;
    rowTree: IntervalTree;
    rowCollapseState: Record<string, CollapsedRange>;
    rows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
    pivot?: PivotData<string, unknown> | null;
}): void;
export declare function getUpdatedCollapsedIndices<TColumnKey extends string, TItem>({ pivot, oldRowCollapseState, oldRows, newRows, }: {
    oldRowCollapseState: Record<string, CollapsedRange>;
    oldRows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
    newRows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
    pivot: PivotData<TColumnKey, TItem>;
}): Array<[number, number]>;
//# sourceMappingURL=PivotStateUtils.d.ts.map