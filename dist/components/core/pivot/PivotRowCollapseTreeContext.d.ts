import type * as React from 'react';
import { PivotIntervalTree as IntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
export declare function usePivotRowCollapseTree(): IntervalTree;
export declare function usePivotTotalRows(): number;
export declare function PivotRowCollapseTreeContextProvider({ children, totalRows, tree, }: {
    children: React.ReactNode;
    totalRows: number;
    tree: IntervalTree;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PivotRowCollapseTreeContext.d.ts.map