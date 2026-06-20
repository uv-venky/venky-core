/* Copyright (c) 2024-present VENKY Corp. */

import type * as React from 'react';
import { createContext, useContext } from 'react';
import { PivotIntervalTree as IntervalTree } from '@/components/core/pivot/PivotIntervalTree';

const PivotColumnCollapseTreeContext = createContext<IntervalTree>(new IntervalTree(0));

export function usePivotColumnCollapseTree(): IntervalTree {
  return useContext(PivotColumnCollapseTreeContext);
}

const PivotTotalColumnsContext = createContext(0);

export function usePivotTotalColumns(): number {
  return useContext(PivotTotalColumnsContext);
}

export function PivotColumnCollapseTreeContextProvider({
  children,
  totalColumns,
  tree,
}: {
  children: React.ReactNode;
  totalColumns: number;
  tree: IntervalTree;
}) {
  return (
    <PivotColumnCollapseTreeContext value={tree}>
      <PivotTotalColumnsContext value={totalColumns}>{children}</PivotTotalColumnsContext>
    </PivotColumnCollapseTreeContext>
  );
}
