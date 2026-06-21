/* Copyright (c) 2024-present VENKY Corp. */
import { useCallback } from 'react';
import { usePivotState } from '../../../components/core/pivot/PivotContext';
import { makeKey } from '../../../components/core/pivot/PivotUtils';
export default function usePivotRowCollapse() {
  const { rowCollapseState, rowTree, totalRows } = usePivotState();
  const isRowCollapsed = useCallback(
    (rowIndex, columnIndex) => {
      return rowCollapseState[makeKey({ rowIndex, columnIndex })] !== undefined;
    },
    [rowCollapseState],
  );
  const getActualRowIndex = useCallback(
    (rowIndex) => {
      return rowTree.actualIndex(rowIndex);
    },
    // rowTree is mutated (same reference), so totalRows is used to invalidate when the tree changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowTree, totalRows],
  );
  return {
    getActualRowIndex,
    isRowCollapsed,
  };
}
//# sourceMappingURL=usePivotRowCollapse.js.map
