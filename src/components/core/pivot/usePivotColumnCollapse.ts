/* Copyright (c) 2024-present VENKY Corp. */

import { useCallback } from 'react';
import { usePivotState } from '@/components/core/pivot/PivotContext';
import { makeKey } from '@/components/core/pivot/PivotUtils';

export default function usePivotColumnCollapse(): {
  getActualColumnIndex: (columnIndex: number) => number;
  isColumnCollapsed: (rowIndex: number, columnIndex: number) => boolean;
} {
  const { headerCollapseState, columnTree, totalColumns } = usePivotState<string, unknown>();

  const isColumnCollapsed = useCallback(
    (rowIndex: number, columnIndex: number) => {
      return headerCollapseState[makeKey({ rowIndex, columnIndex })] !== undefined;
    },
    [headerCollapseState],
  );

  const getActualColumnIndex = useCallback(
    (columnIndex: number) => {
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
