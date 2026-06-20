/* Copyright (c) 2024-present VENKY Corp. */

import { List } from 'immutable';
import type { PivotData } from '@/components/core/pivot/PivotData';
import { PivotIntervalTree as IntervalTree } from '@/components/core/pivot/PivotIntervalTree';
import type { CollapsedRange, PivotState } from '@/components/core/pivot/PivotTypes';
import { BOTH_SPAN, COL_SPAN, ROW_SPAN } from '@/components/core/pivot/PivotTypes';
import { getCollapsedIndices, makeKey, parseKey } from '@/components/core/pivot/PivotUtils';

/** Resolve ROW_SPAN by reading the value from the previous row. */
function resolveRowSpan(
  rows: ReadonlyArray<ReadonlyArray<string | Array<string>>>,
  rowIndex: number,
  colIndex: number,
): string {
  let val = rows[rowIndex]?.[colIndex];
  if (val === ROW_SPAN || val === BOTH_SPAN) {
    let k = rowIndex;
    while (k >= 0 && (rows[k]?.[colIndex] === ROW_SPAN || rows[k]?.[colIndex] === BOTH_SPAN)) {
      k--;
    }
    val = k >= 0 ? rows[k]?.[colIndex] : ROW_SPAN;
  }
  return typeof val === 'string' ? val : ROW_SPAN;
}

export const INITIAL_STATE = <TColumnKey extends string, TItem>(): PivotState<TColumnKey, TItem> => ({
  pivot: null,
  rowCollapseState: {},
  rowTree: new IntervalTree(0),
  totalRows: 0,
  headerCollapseState: {},
  columnTree: new IntervalTree(0),
  totalColumns: 0,
  rows: [],
  header: [],
  rawData: [],
  draftPowerSearchFilters: List(),
});

export function isHeaderEqual(
  a: ReadonlyArray<ReadonlyArray<string>>,
  b: ReadonlyArray<ReadonlyArray<string>>,
): boolean {
  return (
    a.length === b.length &&
    a.every(
      (rowA, index) =>
        rowA.length === b[index].length && rowA.every((cellA, cellIndex) => cellA === b[index][cellIndex]),
    )
  );
}

export function collapseColumn({
  columnTree,
  rowIndex,
  columnIndex,
  header,
  headerCollapseState,
  pivot,
}: {
  header: ReadonlyArray<ReadonlyArray<string>>;
  rowIndex: number;
  columnIndex: number;
  columnTree: IntervalTree;
  headerCollapseState: Record<string, CollapsedRange>;
  pivot?: PivotData<string, unknown> | null;
}) {
  // In colsBeforeVals mode, each column dimension group contains valueCount sub-columns
  // per lowest-level key (one per value + calculated column). When collapsing a non-deepest
  // dimension group, keep the first valueCount columns visible (analogous to how collapseRow
  // keeps the first rowMetricCount rows in valuesInRows mode).
  let keepCount = 1;
  if (pivot) {
    const cfg = pivot.config;
    const valuesInRows = cfg.valuesPosition === 'rows' && (cfg.values?.length ?? 0) > 1;
    const colKeys = pivot.getColKeys();
    const calcCols = cfg.calculatedColumns ?? [];
    const colsBeforeVals =
      !valuesInRows &&
      cfg.columnsBeforeValues === false &&
      colKeys.length > 0 &&
      (colKeys.length > 1 || colKeys[0].length > 0) &&
      (cfg.values.length > 1 || calcCols.length > 0);
    if (colsBeforeVals) {
      const colDepth = cfg.cols?.length ?? 0;
      if (rowIndex < colDepth - 1) {
        keepCount = cfg.values.length + calcCols.length;
      }
    }
  }

  const startIndex = columnIndex + keepCount;
  let endIndex = startIndex;
  for (let i = startIndex; i < header[rowIndex].length; i++) {
    const r = header[rowIndex][i];
    if (r === COL_SPAN) {
      endIndex = i;
    } else {
      break;
    }
  }
  if (startIndex > endIndex) return;
  columnTree.removeRange(startIndex, endIndex);
  const nested: Array<CollapsedRange> = [];
  Object.keys(headerCollapseState).forEach((key) => {
    const [row, col] = parseKey(key);
    if (row >= rowIndex && col >= startIndex && col <= endIndex) {
      nested.push(headerCollapseState[key]);
      delete headerCollapseState[key];
    }
  });
  const key = makeKey({ rowIndex, columnIndex });
  headerCollapseState[key] = {
    key,
    start: startIndex,
    end: endIndex,
    nested,
  };
}

const ROW_COLLAPSE_SIBLING_KEY_PREFIX = '_block:';

export function collapseRow({
  rowTree,
  rowIndex,
  columnIndex,
  rowCollapseState,
  rows,
  pivot,
}: {
  rowIndex: number;
  columnIndex: number;
  rowTree: IntervalTree;
  rowCollapseState: Record<string, CollapsedRange>;
  rows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
  pivot?: PivotData<string, unknown> | null;
}) {
  const valuesInRows = pivot?.config?.valuesPosition === 'rows' && (pivot?.config?.values?.length ?? 0) > 1;
  const rowMetricCount =
    valuesInRows && pivot ? (pivot.config.values?.length ?? 0) + (pivot.config.calculatedColumns?.length ?? 0) : 1;
  const rowsDimensionCount = pivot?.config?.rows?.length ?? 0;
  const nextDimCol = columnIndex + 1;

  if (valuesInRows && rowMetricCount > 0 && nextDimCol < rowsDimensionCount) {
    // When values are shown as rows, each logical row is rowMetricCount table rows.
    // Only hide "detail" blocks (category level); keep "subtotal" blocks (COL_SPAN in next dimension).
    const currentGroupValue = resolveRowSpan(rows, rowIndex, columnIndex);
    const hiddenBlocks: Array<CollapsedRange> = [];
    let blockStart = rowIndex + rowMetricCount;

    while (blockStart < rows.length) {
      const blockFirstRowValue = resolveRowSpan(rows, blockStart, columnIndex);
      if (blockFirstRowValue !== currentGroupValue && blockFirstRowValue !== ROW_SPAN) {
        break;
      }
      const nextDimValue = resolveRowSpan(rows, blockStart, nextDimCol);
      const isSubtotalBlock = nextDimValue === COL_SPAN;
      const blockEnd = blockStart + rowMetricCount - 1;

      if (!isSubtotalBlock) {
        rowTree.removeRange(blockStart, blockEnd);
        hiddenBlocks.push({
          key: `${ROW_COLLAPSE_SIBLING_KEY_PREFIX}${blockStart}:${blockEnd}`,
          start: blockStart,
          end: blockEnd,
          nested: [],
        });
      }
      blockStart = blockEnd + 1;
    }

    if (hiddenBlocks.length === 0) return;

    const childNested: Array<CollapsedRange> = [];
    Object.keys(rowCollapseState).forEach((key) => {
      const [r, col] = parseKey(key);
      const inFirstBlock = r >= rowIndex + 1 && r <= rowIndex + rowMetricCount - 1;
      if (col >= columnIndex && inFirstBlock) {
        childNested.push(rowCollapseState[key]);
        delete rowCollapseState[key];
      }
    });
    const key = makeKey({ rowIndex, columnIndex });
    const siblingBlocks = hiddenBlocks.length > 1 ? hiddenBlocks.slice(1) : [];
    const first = hiddenBlocks[0];
    if (first) {
      rowCollapseState[key] = {
        key,
        start: first.start,
        end: first.end,
        nested: [...siblingBlocks, ...childNested],
      };
    }
    return;
  }

  let startIndex = rowIndex + 1;
  let endIndex = startIndex;
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (row[columnIndex] === ROW_SPAN) {
      if (row[columnIndex + 1] === BOTH_SPAN) {
        startIndex = i + 1;
        continue;
      }
      endIndex = i;
    } else {
      break;
    }
  }
  rowTree.removeRange(startIndex, endIndex);
  const nested: Array<CollapsedRange> = [];
  Object.keys(rowCollapseState).forEach((key) => {
    const [row, col] = parseKey(key);
    if (col >= columnIndex && row >= startIndex && row <= endIndex) {
      nested.push(rowCollapseState[key]);
      delete rowCollapseState[key];
    }
  });
  const key = makeKey({ rowIndex, columnIndex });
  rowCollapseState[key] = {
    key,
    start: startIndex,
    end: endIndex,
    nested,
  };
}

export function getUpdatedCollapsedIndices<TColumnKey extends string, TItem>({
  pivot,
  oldRowCollapseState,
  oldRows,
  newRows,
}: {
  oldRowCollapseState: Record<string, CollapsedRange>;
  oldRows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
  newRows: ReadonlyArray<ReadonlyArray<string | Array<string>>>;
  pivot: PivotData<TColumnKey, TItem>;
}): Array<[number, number]> {
  const dimensionColCount = pivot.config.rows.length;
  const valuesInRows = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
  const rowMetricCount = valuesInRows
    ? (pivot.config.values?.length ?? 0) + (pivot.config.calculatedColumns?.length ?? 0)
    : 1;

  let indices: Array<[number, number]> = [];
  if (Object.keys(oldRowCollapseState).length > 0) {
    const collapsedIndices = getCollapsedIndices(oldRowCollapseState);
    const collapsedRows: Record<string, number> = {};
    for (let i = 0; i < collapsedIndices.length; i++) {
      const [rowIdx, colIdx] = collapsedIndices[i];
      const row = oldRows[rowIdx].slice(0, dimensionColCount);
      for (let j = 0; j < row.length; j++) {
        let val = row[j];
        if (val === ROW_SPAN) {
          let k = rowIdx;
          while (val === ROW_SPAN && k >= 0) {
            k--;
            val = oldRows[k]?.[j];
          }
          row[j] = val;
        }
      }
      collapsedRows[row.join('.')] = colIdx;
    }
    const pushedKeys = new Set<string>();
    for (let i = 0; i < newRows.length; i++) {
      const row = newRows[i].slice(0, dimensionColCount);
      for (let j = 0; j < row.length; j++) {
        let val = row[j];
        if (val === ROW_SPAN) {
          let k = i;
          while (val === ROW_SPAN && k >= 0) {
            k--;
            val = newRows[k]?.[j];
          }
          row[j] = val;
        }
      }
      const key = row.join('.');
      const col = collapsedRows[key];
      if (col != null) {
        if (valuesInRows && rowMetricCount > 0) {
          if (!pushedKeys.has(key)) {
            pushedKeys.add(key);
            indices.push([i, col]);
          }
        } else {
          indices.push([i, col]);
        }
      }
    }
    indices = indices.sort((a, b) => b[0] - a[0]);
  }
  return indices;
}
