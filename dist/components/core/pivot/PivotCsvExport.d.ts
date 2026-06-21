import type { PivotData } from '../../../components/core/pivot/PivotData';
import type { PivotIntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
import type { PivotColumn } from '../../../components/core/pivot/PivotTypes';
interface BuildPivotCsvParams<TColumnKey extends string, TItem> {
    pivot: PivotData<TColumnKey, TItem>;
    columns: ReadonlyArray<PivotColumn<TColumnKey>>;
    rowTree: PivotIntervalTree;
    columnTree: PivotIntervalTree;
}
/**
 * Builds the CSV string for the visible pivot layout (header + body + footer),
 * honouring row/column collapse state, `showRowTotals`, `showColumnTotals`,
 * `showGrandTotal`, and both `valuesPosition` ('rows' | 'columns') modes.
 */
export declare function buildPivotCsv<TColumnKey extends string, TItem>({ pivot, columns, rowTree, columnTree, }: BuildPivotCsvParams<TColumnKey, TItem>): string;
export declare function downloadCsv(csv: string, filename: string): void;
export {};
//# sourceMappingURL=PivotCsvExport.d.ts.map