/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { ACTIONS_COLUMN_ID } from '@/components/core/table/actions-column-def';
import { useRowIds, useStoreRowCount } from '@/components/core/hooks/useStoreHooks';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { Store } from '@/lib/core/common/types/Store';
import {
  type AccessorKeyColumnDef,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type ExpandedState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table,
  type Updater,
  type VisibilityState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { proxy } from 'valtio';
import CONSTANTS from '@/lib/core/client/constants';
import {
  applyTablePageSize,
  createTableColumnPreferences,
  DEFAULT_PAGE_SIZE,
  getColumnId,
  getDefaultPageSize,
  getDefaultTableColumnPreferences,
  type TableColumnPreferences,
} from '@/components/core/page/table-column-preferences';
import type { TableVariant } from '@/components/core/common/types';
import { useTableVariant } from '@/components/core/hooks/useTableVariant';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    disableHeaderFilters?: boolean;
    store: Store<any>;
    tableColumns: AccessorKeyColumnDef<TData>[];
    defaultVisibleColumnOrder?: Extract<keyof TData, string>[];
    updateProxy: { count: number };
    resizeProxy: { count: number };
    onEdit?: (rowId: string) => void;
    preferences: TableColumnPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<TableColumnPreferences>>;
    defaultPageSize: number;
    defaultPreferences: TableColumnPreferences;
    setPaginationPageSize: (pageSize: number) => void;
  }
  interface ColumnMeta<TData extends RowData, TValue> {
    sticky?: 'left' | 'right';
    label?: string;
    flexGrow?: number;
  }
}

type Props<T extends object> = {
  store: Store<T>;
  tableColumns: AccessorKeyColumnDef<T>[];
  defaultVisibleColumnOrder?: StringKeyof<T>[];
  disableHeaderFilters?: boolean;
  initialPreferences?: Partial<TableColumnPreferences>;
};

const defaultColumn: Partial<ColumnDef<any, unknown>> = {
  size: 200,
  minSize: 8,
  maxSize: 1800,
};

const getRowId = <T extends object>(row: T) => (row as { id: string }).id;

export { getColumnId } from '@/components/core/page/table-column-preferences';

export function getDefaultColumnVisibility<T extends object>(
  tableColumns: AccessorKeyColumnDef<T>[],
  defaultVisibleColumnOrder: Extract<keyof T, string>[] | undefined,
): VisibilityState {
  if (!defaultVisibleColumnOrder) return {};
  // When tableColumns is empty we return {}; TanStack then treats missing keys as visible.
  // The useLayoutEffect in useTable re-applies visibility when columns load to avoid a flash.
  const accessorToId = new Map<string, string>();
  for (const col of tableColumns) {
    const key = col.accessorKey as string;
    if (key) accessorToId.set(key, getColumnId(col));
  }
  return tableColumns.reduce((acc, column) => {
    const id = getColumnId(column);
    if (!id) return acc;
    const key = column.accessorKey as string;
    acc[id] =
      column.enableHiding === false ||
      defaultVisibleColumnOrder.some((k) => accessorToId.get(k as string) === id || k === key);
    return acc;
  }, {} as VisibilityState);
}

function getDefaultColumnSizing<T extends object>(tableColumns: AccessorKeyColumnDef<T>[]): ColumnSizingState {
  return tableColumns.reduce((acc, column) => {
    acc[getColumnId(column)] = column.size ?? 200;
    return acc;
  }, {} as ColumnSizingState);
}

/** Sticky column keys from tableColumns (by meta.sticky). __actions is always last among sticky right. */
function getStickyColumnKeys<T extends object>(
  tableColumns: AccessorKeyColumnDef<T>[],
): { left: string[]; right: string[] } {
  const left: string[] = [];
  const right: string[] = [];
  for (const column of tableColumns) {
    const id = getColumnId(column);
    if (!id) continue;
    if (column.meta?.sticky === 'left') left.push(id);
    else if (column.meta?.sticky === 'right') right.push(id);
  }
  const actionsIndex = right.indexOf(ACTIONS_COLUMN_ID);
  if (actionsIndex !== -1 && actionsIndex !== right.length - 1) {
    right.splice(actionsIndex, 1);
    right.push(ACTIONS_COLUMN_ID);
  }
  return { left, right };
}

/** Ensures sticky left columns are first and sticky right columns are last. */
function normalizeColumnOrder<T extends object>(tableColumns: AccessorKeyColumnDef<T>[], order: string[]): string[] {
  const { left, right } = getStickyColumnKeys(tableColumns);
  if (left.length === 0 && right.length === 0) return order;
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const middle = order.filter((id) => !leftSet.has(id) && !rightSet.has(id));
  return [...left, ...middle, ...right];
}

/**
 * Merges a saved column order with the current table columns.
 * Columns that exist in the table but are missing from the saved order (e.g. newly added columns)
 * are inserted before the right-sticky columns (e.g. __actions) so Actions stays last.
 */
export function mergeSavedColumnOrder<T extends object>(
  savedOrder: string[],
  tableColumns: AccessorKeyColumnDef<T>[],
): string[] {
  const fullOrder = tableColumns.map((c) => getColumnId(c)).filter(Boolean);
  const savedSet = new Set(savedOrder);
  const missing = fullOrder.filter((id) => !savedSet.has(id));
  if (missing.length === 0) return normalizeColumnOrder(tableColumns, savedOrder);
  const { right } = getStickyColumnKeys(tableColumns);
  const rightSet = new Set(right);
  const result: string[] = [];
  let missingInserted = false;
  for (const id of savedOrder) {
    if (rightSet.has(id) && !missingInserted) {
      result.push(...missing);
      missingInserted = true;
    }
    result.push(id);
  }
  if (!missingInserted) result.push(...missing);
  return normalizeColumnOrder(tableColumns, result);
}

export function getDefaultColumnOrder<T extends object>(
  tableColumns: AccessorKeyColumnDef<T>[],
  defaultVisibleColumnOrder: Extract<keyof T, string>[] | undefined,
): string[] {
  const accessorToId = new Map<string, string>();
  for (const col of tableColumns) {
    const key = col.accessorKey as string;
    if (key) accessorToId.set(key, getColumnId(col));
  }

  let order: string[];
  if (!defaultVisibleColumnOrder) {
    order = tableColumns.map((column) => getColumnId(column)).filter(Boolean);
  } else {
    const leftColumns: string[] = [];
    const rightColumns: string[] = [];

    for (const column of tableColumns) {
      const id = getColumnId(column);
      const key = column.accessorKey as string;
      if (
        id &&
        column.enableHiding === false &&
        !defaultVisibleColumnOrder.some((k) => accessorToId.get(k as string) === id || k === key)
      ) {
        if (column.meta?.sticky === 'left') {
          leftColumns.push(id);
        } else {
          rightColumns.push(id);
        }
      }
    }

    order = [
      ...leftColumns,
      ...defaultVisibleColumnOrder.map((k) => accessorToId.get(k as string) ?? k),
      ...rightColumns,
    ];
  }
  return mergeSavedColumnOrder(normalizeColumnOrder(tableColumns, order), tableColumns);
}

export default function useTable<T extends object>({
  store,
  tableColumns,
  defaultVisibleColumnOrder,
  disableHeaderFilters: disableHeaderFiltersProp,
  initialPreferences,
}: Props<T>): Table<T> {
  const disableHeaderFilters = disableHeaderFiltersProp ?? CONSTANTS.DISABLE_HEADER_FILTERS_DEFAULT;
  const resolvedDefaultVariant = useTableVariant(initialPreferences?.tableVariant);
  const defaultPreferences = useMemo(
    () =>
      createTableColumnPreferences({
        ...initialPreferences,
        tableVariant: initialPreferences?.tableVariant ?? resolvedDefaultVariant,
      }),
    [initialPreferences, resolvedDefaultVariant],
  );
  const [preferences, setPreferences] = useState<TableColumnPreferences>(defaultPreferences);
  const updateProxy = useRef(proxy({ count: 0 }));
  const resizeProxy = useRef(proxy({ count: 0 }));
  const rowIds = useRowIds<T>(store);
  const rows = useMemo(
    () =>
      rowIds.map((id) => ({
        id,
      })) as T[],
    [rowIds],
  );
  const rowCount = useStoreRowCount<T>(store);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => getDefaultColumnSizing(tableColumns));
  const onColumnSizingChange = useCallback((updater: Updater<ColumnSizingState>) => {
    setColumnSizing(updater);
    resizeProxy.current.count++;
  }, []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder),
  );
  const [rowSelection, setRowSelectionInternal] = useState<RowSelectionState>({});
  const setRowSelection = useCallback(
    (updater: Updater<RowSelectionState>) => {
      setRowSelectionInternal((old) => {
        const newRowSelection = typeof updater === 'function' ? updater(old) : updater;
        const id = Object.keys(newRowSelection)[0];
        if (id) {
          store?.setCurrentRowId(id);
        }
        return newRowSelection;
      });
    },
    [store],
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder),
  );
  const onColumnOrderChange = useCallback(
    (updater: Updater<string[]>) => {
      setColumnOrder((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return normalizeColumnOrder(tableColumns, next);
      });
      resizeProxy.current.count++;
    },
    [tableColumns],
  );
  const defaultPageSize = store?.defaultLimit ?? DEFAULT_PAGE_SIZE;
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const setPaginationPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => (prev.pageSize === pageSize && prev.pageIndex === 0 ? prev : { pageIndex: 0, pageSize }));
  }, []);

  useEffect(() => {
    if (store) {
      store.limit = pagination.pageSize;
    }
  }, [store, pagination.pageSize]);

  // Sync visibility/order/sizing when column defs or defaultVisibleColumnOrder change (e.g. initial
  // session load where tableColumns goes from [] to full). useLayoutEffect avoids a flash of
  // "all columns visible" before the correct visibility is applied.
  useLayoutEffect(() => {
    setColumnVisibility(getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder));
    setColumnSizing(getDefaultColumnSizing(tableColumns));
    setColumnOrder(getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder));
  }, [tableColumns, defaultVisibleColumnOrder]);

  const state = useMemo(() => {
    return {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
      pagination,
      columnSizing,
      expanded,
    };
  }, [sorting, columnFilters, columnVisibility, rowSelection, columnOrder, pagination, columnSizing, expanded]);

  const meta = useMemo(() => {
    return {
      store,
      tableColumns,
      defaultVisibleColumnOrder,
      updateProxy: updateProxy.current,
      resizeProxy: resizeProxy.current,
      disableHeaderFilters,
      preferences,
      setPreferences,
      defaultPageSize,
      defaultPreferences,
      setPaginationPageSize,
    };
  }, [
    store,
    tableColumns,
    defaultVisibleColumnOrder,
    disableHeaderFilters,
    preferences,
    setPreferences,
    defaultPageSize,
    defaultPreferences,
    setPaginationPageSize,
  ]);

  useEffect(() => {
    if (initialPreferences?.tableVariant) {
      setPreferences((prev) =>
        prev.tableVariant === initialPreferences.tableVariant
          ? prev
          : { ...prev, tableVariant: initialPreferences.tableVariant as TableVariant },
      );
    }
  }, [initialPreferences?.tableVariant]);

  const table = useReactTable<T>({
    defaultColumn,
    data: rows,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId,
    enableMultiRowSelection: false,
    state,
    columnResizeMode: 'onChange',
    onColumnOrderChange: onColumnOrderChange,
    enableExpanding: true,
    onExpandedChange: setExpanded,
    rowCount: typeof rowCount === 'number' ? rowCount : undefined,
    pageCount: typeof rowCount === 'number' ? Math.ceil(rowCount / pagination.pageSize) : undefined,
    onPaginationChange: setPagination,
    manualPagination: true,
    onColumnSizingChange,
    meta,
  });

  useEffect(() => {
    if (tableColumns && rows && state && meta) {
      updateProxy.current.count++;
      // Trigger resize recalculation when column definitions change (e.g., flexGrow, size, sticky)
      // This ensures column sizing updates after HMR when column definitions are modified
      resizeProxy.current.count++;
    }
  }, [tableColumns, rows, state, meta]);

  useEffect(() => {
    updateProxy.current.count++;
    resizeProxy.current.count++;
  }, [preferences]);

  return table;
}

/** Reset column order, visibility, sizing, density/sticky, and page size to page defaults. */
export async function resetTableColumnLayout<T extends object>(table: Table<T>): Promise<void> {
  const meta = table.options.meta as {
    tableColumns?: AccessorKeyColumnDef<T>[];
    defaultVisibleColumnOrder?: Extract<keyof T, string>[];
    setPreferences?: (value: TableColumnPreferences) => void;
    updateProxy?: { count: number };
    resizeProxy?: { count: number };
  };
  const tableColumns = meta.tableColumns ?? [];
  const defaultVisibleColumnOrder = meta.defaultVisibleColumnOrder;
  table.setColumnOrder(getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder));
  table.setColumnVisibility(getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder));
  table.resetColumnSizing();
  meta.setPreferences?.(getDefaultTableColumnPreferences(table));
  await applyTablePageSize(table, getDefaultPageSize(table));
  if (meta.updateProxy) {
    meta.updateProxy.count++;
  }
  if (meta.resizeProxy) {
    meta.resizeProxy.count++;
  }
}
