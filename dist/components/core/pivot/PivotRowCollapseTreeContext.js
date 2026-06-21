import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { PivotIntervalTree as IntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
const PivotRowCollapseTreeContext = createContext(new IntervalTree(0));
export function usePivotRowCollapseTree() {
    return useContext(PivotRowCollapseTreeContext);
}
const PivotTotalRowsContext = createContext(0);
export function usePivotTotalRows() {
    return useContext(PivotTotalRowsContext);
}
export function PivotRowCollapseTreeContextProvider({ children, totalRows, tree, }) {
    return (_jsx(PivotRowCollapseTreeContext, { value: tree, children: _jsx(PivotTotalRowsContext, { value: totalRows, children: children }) }));
}
//# sourceMappingURL=PivotRowCollapseTreeContext.js.map