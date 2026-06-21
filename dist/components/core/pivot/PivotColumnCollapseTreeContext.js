import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { PivotIntervalTree as IntervalTree } from '../../../components/core/pivot/PivotIntervalTree';
const PivotColumnCollapseTreeContext = createContext(new IntervalTree(0));
export function usePivotColumnCollapseTree() {
    return useContext(PivotColumnCollapseTreeContext);
}
const PivotTotalColumnsContext = createContext(0);
export function usePivotTotalColumns() {
    return useContext(PivotTotalColumnsContext);
}
export function PivotColumnCollapseTreeContextProvider({ children, totalColumns, tree, }) {
    return (_jsx(PivotColumnCollapseTreeContext, { value: tree, children: _jsx(PivotTotalColumnsContext, { value: totalColumns, children: children }) }));
}
//# sourceMappingURL=PivotColumnCollapseTreeContext.js.map