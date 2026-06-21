/* Copyright (c) 2024-present VENKY Corp. */
import { useCallback } from 'react';
import { usePivotState } from '../../../components/core/pivot/PivotContext';
import { makeKey } from '../../../components/core/pivot/PivotUtils';
export default function usePivotColumnCollapse() {
  const { headerCollapseState, columnTree, totalColumns } = usePivotState();
  const isColumnCollapsed = useCallback(
    (rowIndex, columnIndex) => {
      return headerCollapseState[makeKey({ rowIndex, columnIndex })] !== undefined;
    },
    [headerCollapseState],
  );
  const getActualColumnIndex = useCallback(
    (columnIndex) => {
      return columnTree.actualIndex(columnIndex);
    },
    // columnTree is mutated (same reference), so totalColumns is used to invalidate when the tree changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnTree, totalColumns],
  );
  return {
    getActualColumnIndex,
    isColumnCollapsed,
  };
}
//# sourceMappingURL=usePivotColumnCollapse.js.map
