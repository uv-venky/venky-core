/* Copyright (c) 2024-present VENKY Corp. */

import type * as React from 'react';
import { createContext, useContext } from 'react';
import { PivotIntervalTree as IntervalTree } from '@/components/core/pivot/PivotIntervalTree';

const PivotRowCollapseTreeContext = createContext<IntervalTree>(new IntervalTree(0));

export function usePivotRowCollapseTree(): IntervalTree {
  return useContext(PivotRowCollapseTreeContext);
}

const PivotTotalRowsContext = createContext(0);

export function usePivotTotalRows(): number {
  return useContext(PivotTotalRowsContext);
}

export function PivotRowCollapseTreeContextProvider({
  children,
  totalRows,
  tree,
}: {
  children: React.ReactNode;
  totalRows: number;
  tree: IntervalTree;
}) {
  return (
    <PivotRowCollapseTreeContext value={tree}>
      <PivotTotalRowsContext value={totalRows}>{children}</PivotTotalRowsContext>
    </PivotRowCollapseTreeContext>
  );
}
