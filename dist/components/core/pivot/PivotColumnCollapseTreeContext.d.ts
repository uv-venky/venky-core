import type * as React from 'react';
import { PivotIntervalTree as IntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
export declare function usePivotColumnCollapseTree(): IntervalTree;
export declare function usePivotTotalColumns(): number;
export declare function PivotColumnCollapseTreeContextProvider({ children, totalColumns, tree, }: {
    children: React.ReactNode;
    totalColumns: number;
    tree: IntervalTree;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PivotColumnCollapseTreeContext.d.ts.map