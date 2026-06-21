/* Copyright (c) 2024-present VENKY Corp. */
import { useReducer } from 'react';
import {
  INITIAL_STATE,
  collapseColumn,
  collapseRow,
  getUpdatedCollapsedIndices,
  isHeaderEqual,
} from '../../../components/core/pivot/PivotStateUtils';
import { makeKey } from '../../../components/core/pivot/PivotUtils';
function reducer(state, action) {
  switch (action.type) {
    case 'collapseRow': {
      const { rowIndex, columnIndex } = action;
      const newState = { ...state };
      const { rowTree, rowCollapseState, rows, pivot } = newState;
      const newRowCollapseState = { ...rowCollapseState };
      collapseRow({
        rowTree,
        rowIndex,
        columnIndex,
        rowCollapseState: newRowCollapseState,
        rows,
        pivot: pivot ?? undefined,
      });
      const totalVisible = rowTree.totalVisible();
      newState.totalRows = totalVisible;
      newState.rowCollapseState = newRowCollapseState;
      return newState;
    }
    case 'expandRow': {
      const { rowIndex, columnIndex } = action;
      const newState = { ...state };
      const { rowTree, rowCollapseState, pivot } = newState;
      const newRowCollapseState = { ...rowCollapseState };
      // Primary key for the collapsed range at the exact row/column.
      const makeKeyFor = (r) => makeKey({ rowIndex: r, columnIndex });
      let key = makeKeyFor(rowIndex);
      let range = newRowCollapseState[key];
      // When values are rendered as rows, a logical row spans multiple table rows.
      // If the key isn't found for the exact rowIndex (e.g. due to metric row offsets),
      // try resolving the group header row index instead.
      if (!range && pivot && pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1) {
        const rowMetricCount = (pivot.config.values?.length ?? 0) + (pivot.config.calculatedColumns?.length ?? 0);
        if (rowMetricCount > 0) {
          const groupHeaderIndex = rowIndex - (rowIndex % rowMetricCount);
          key = makeKeyFor(groupHeaderIndex);
          range = newRowCollapseState[key];
        }
      }
      if (!range) {
        return state;
      }
      rowTree.addRange(range.start, range.end);
      range.nested.forEach((nestedRange) => {
        if (nestedRange.key.startsWith('_block:')) {
          rowTree.addRange(nestedRange.start, nestedRange.end);
        } else {
          rowTree.removeRange(nestedRange.start, nestedRange.end);
          newRowCollapseState[nestedRange.key] = nestedRange;
        }
      });
      newState.totalRows = rowTree.totalVisible();
      delete newRowCollapseState[key];
      newState.rowCollapseState = newRowCollapseState;
      return newState;
    }
    case 'collapseColumn': {
      const { rowIndex, columnIndex } = action;
      const newState = { ...state };
      const { columnTree, headerCollapseState, header, pivot } = newState;
      const newHeaderCollapseState = { ...headerCollapseState };
      collapseColumn({
        header,
        rowIndex,
        columnIndex,
        columnTree,
        headerCollapseState: newHeaderCollapseState,
        pivot: pivot ?? undefined,
      });
      newState.totalColumns = columnTree.totalVisible();
      newState.headerCollapseState = newHeaderCollapseState;
      return newState;
    }
    case 'expandColumn': {
      const { rowIndex, columnIndex } = action;
      const newState = { ...state };
      const { columnTree, headerCollapseState } = newState;
      const newHeaderCollapseState = { ...headerCollapseState };
      const key = makeKey({ rowIndex, columnIndex });
      const range = newHeaderCollapseState[key];
      columnTree.addRange(range.start, range.end);
      range.nested.forEach((r) => {
        columnTree.removeRange(r.start, r.end);
        newHeaderCollapseState[r.key] = r;
      });
      newState.totalColumns = columnTree.totalVisible();
      delete newHeaderCollapseState[key];
      newState.headerCollapseState = newHeaderCollapseState;
      return newState;
    }
    case 'expandAll': {
      const newState = { ...state };
      const { rowTree, columnTree } = newState;
      rowTree.showAll();
      newState.totalRows = rowTree.totalVisible();
      newState.rowCollapseState = {};
      columnTree.showAll();
      newState.totalColumns = columnTree.totalVisible();
      newState.headerCollapseState = {};
      return newState;
    }
    case 'collapseAll': {
      const newState = { ...state };
      const { pivot, columnTree, header, headerCollapseState, rowCollapseState, rowTree, rows } = newState;
      if (pivot == null) {
        return state;
      }
      const newHeaderCollapseState = { ...headerCollapseState };
      const newRowCollapseState = { ...rowCollapseState };
      let indices = pivot.getIndicesToCollapseAllRows();
      indices.forEach(([r, c]) => {
        collapseRow({
          rowTree,
          rowIndex: r,
          columnIndex: c,
          rowCollapseState: newRowCollapseState,
          rows,
          pivot: pivot ?? undefined,
        });
      });
      indices = pivot.getIndicesToCollapseAllColumns();
      indices.forEach(([r, c]) => {
        collapseColumn({
          header,
          rowIndex: r,
          columnIndex: c,
          columnTree,
          headerCollapseState: newHeaderCollapseState,
          pivot: pivot ?? undefined,
        });
      });
      newState.totalRows = rowTree.totalVisible();
      newState.rowCollapseState = newRowCollapseState;
      newState.totalColumns = columnTree.totalVisible();
      newState.headerCollapseState = newHeaderCollapseState;
      return newState;
    }
    case 'setPivot': {
      const { pivot, initialCollapsed, initialColumnCollapsed, sortChanged, initialRowCollapsed } = action;
      const { pivot: oldPivot, header, columnTree, rowTree, rowCollapseState, rows } = state;
      const newState = { ...state };
      const hdr = pivot.getHeader();
      if (!isHeaderEqual(hdr, header)) {
        const total = hdr[0]?.length ?? 0;
        columnTree.reset(total);
        newState.header = hdr;
        const newHeaderCollapseState = {};
        if (initialCollapsed || initialColumnCollapsed) {
          const indices = pivot.getIndicesToCollapseAllColumns();
          indices.forEach(([r, c]) => {
            collapseColumn({
              header: hdr,
              rowIndex: r,
              columnIndex: c,
              columnTree,
              headerCollapseState: newHeaderCollapseState,
              pivot: pivot,
            });
          });
        }
        newState.totalColumns = columnTree.totalVisible();
        newState.headerCollapseState = newHeaderCollapseState;
      }
      const _tableRows = pivot.getTableData() ?? [];
      newState.rows = _tableRows;
      let indices = [];
      if (sortChanged && oldPivot === pivot) {
        // if only sort has changed, we need to collapse the rows that were previously collapsed
        indices = getUpdatedCollapsedIndices({
          oldRowCollapseState: rowCollapseState,
          oldRows: rows,
          newRows: _tableRows,
          pivot,
        });
      } else if (initialCollapsed || initialRowCollapsed) {
        indices = pivot.getIndicesToCollapseAllRows();
      }
      const newRowCollapseState = {};
      rowTree.reset(_tableRows.length);
      indices.forEach(([row, col]) => {
        collapseRow({
          rowTree,
          rowIndex: row,
          columnIndex: col,
          rowCollapseState: newRowCollapseState,
          rows: _tableRows,
          pivot: pivot ?? undefined,
        });
      });
      newState.totalRows = rowTree.totalVisible();
      newState.rowCollapseState = newRowCollapseState;
      newState.pivot = pivot;
      return newState;
    }
    case 'setDraftPowerSearchFilters': {
      const { filters } = action;
      const newState = { ...state };
      newState.draftPowerSearchFilters = filters;
      return newState;
    }
  }
}
export default function usePivotReducer() {
  return useReducer(reducer, INITIAL_STATE());
}
//# sourceMappingURL=usePivotReducer.js.map
