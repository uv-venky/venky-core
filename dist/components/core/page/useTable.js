/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { ACTIONS_COLUMN_ID } from '../../../components/core/table/actions-column-def';
import { useRowIds, useStoreRowCount } from '../../../components/core/hooks/useStoreHooks';
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from '@tanstack/react-table';
import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { proxy } from 'valtio';
import CONSTANTS from '../../../lib/core/client/constants';
import { applyTablePageSize, createTableColumnPreferences, DEFAULT_PAGE_SIZE, getColumnId, getDefaultPageSize, getDefaultTableColumnPreferences, } from '../../../components/core/page/table-column-preferences';
import { useTableVariant } from '../../../components/core/hooks/useTableVariant';
const defaultColumn = {
    size: 200,
    minSize: 8,
    maxSize: 1800,
};
const getRowId = (row) => row.id;
export { getColumnId } from '../../../components/core/page/table-column-preferences';
export function getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder) {
    if (!defaultVisibleColumnOrder)
        return {};
    // When tableColumns is empty we return {}; TanStack then treats missing keys as visible.
    // The useLayoutEffect in useTable re-applies visibility when columns load to avoid a flash.
    const accessorToId = new Map();
    for (const col of tableColumns) {
        const key = col.accessorKey;
        if (key)
            accessorToId.set(key, getColumnId(col));
    }
    return tableColumns.reduce((acc, column) => {
        const id = getColumnId(column);
        if (!id)
            return acc;
        const key = column.accessorKey;
        acc[id] =
            column.enableHiding === false ||
                defaultVisibleColumnOrder.some((k) => accessorToId.get(k) === id || k === key);
        return acc;
    }, {});
}
function getDefaultColumnSizing(tableColumns) {
    return tableColumns.reduce((acc, column) => {
        acc[getColumnId(column)] = column.size ?? 200;
        return acc;
    }, {});
}
/** Sticky column keys from tableColumns (by meta.sticky). __actions is always last among sticky right. */
function getStickyColumnKeys(tableColumns) {
    const left = [];
    const right = [];
    for (const column of tableColumns) {
        const id = getColumnId(column);
        if (!id)
            continue;
        if (column.meta?.sticky === 'left')
            left.push(id);
        else if (column.meta?.sticky === 'right')
            right.push(id);
    }
    const actionsIndex = right.indexOf(ACTIONS_COLUMN_ID);
    if (actionsIndex !== -1 && actionsIndex !== right.length - 1) {
        right.splice(actionsIndex, 1);
        right.push(ACTIONS_COLUMN_ID);
    }
    return { left, right };
}
/** Ensures sticky left columns are first and sticky right columns are last. */
function normalizeColumnOrder(tableColumns, order) {
    const { left, right } = getStickyColumnKeys(tableColumns);
    if (left.length === 0 && right.length === 0)
        return order;
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
export function mergeSavedColumnOrder(savedOrder, tableColumns) {
    const fullOrder = tableColumns.map((c) => getColumnId(c)).filter(Boolean);
    const savedSet = new Set(savedOrder);
    const missing = fullOrder.filter((id) => !savedSet.has(id));
    if (missing.length === 0)
        return normalizeColumnOrder(tableColumns, savedOrder);
    const { right } = getStickyColumnKeys(tableColumns);
    const rightSet = new Set(right);
    const result = [];
    let missingInserted = false;
    for (const id of savedOrder) {
        if (rightSet.has(id) && !missingInserted) {
            result.push(...missing);
            missingInserted = true;
        }
        result.push(id);
    }
    if (!missingInserted)
        result.push(...missing);
    return normalizeColumnOrder(tableColumns, result);
}
export function getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder) {
    const accessorToId = new Map();
    for (const col of tableColumns) {
        const key = col.accessorKey;
        if (key)
            accessorToId.set(key, getColumnId(col));
    }
    let order;
    if (!defaultVisibleColumnOrder) {
        order = tableColumns.map((column) => getColumnId(column)).filter(Boolean);
    }
    else {
        const leftColumns = [];
        const rightColumns = [];
        for (const column of tableColumns) {
            const id = getColumnId(column);
            const key = column.accessorKey;
            if (id &&
                column.enableHiding === false &&
                !defaultVisibleColumnOrder.some((k) => accessorToId.get(k) === id || k === key)) {
                if (column.meta?.sticky === 'left') {
                    leftColumns.push(id);
                }
                else {
                    rightColumns.push(id);
                }
            }
        }
        order = [
            ...leftColumns,
            ...defaultVisibleColumnOrder.map((k) => accessorToId.get(k) ?? k),
            ...rightColumns,
        ];
    }
    return mergeSavedColumnOrder(normalizeColumnOrder(tableColumns, order), tableColumns);
}
export default function useTable({ store, tableColumns, defaultVisibleColumnOrder, disableHeaderFilters: disableHeaderFiltersProp, initialPreferences, }) {
    const disableHeaderFilters = disableHeaderFiltersProp ?? CONSTANTS.DISABLE_HEADER_FILTERS_DEFAULT;
    const resolvedDefaultVariant = useTableVariant(initialPreferences?.tableVariant);
    const defaultPreferences = useMemo(() => createTableColumnPreferences({
        ...initialPreferences,
        tableVariant: initialPreferences?.tableVariant ?? resolvedDefaultVariant,
    }), [initialPreferences, resolvedDefaultVariant]);
    const [preferences, setPreferences] = useState(defaultPreferences);
    const updateProxy = useRef(proxy({ count: 0 }));
    const resizeProxy = useRef(proxy({ count: 0 }));
    const rowIds = useRowIds(store);
    const rows = useMemo(() => rowIds.map((id) => ({
        id,
    })), [rowIds]);
    const rowCount = useStoreRowCount(store);
    const [sorting, setSorting] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [columnSizing, setColumnSizing] = useState(() => getDefaultColumnSizing(tableColumns));
    const onColumnSizingChange = useCallback((updater) => {
        setColumnSizing(updater);
        resizeProxy.current.count++;
    }, []);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState(() => getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder));
    const [rowSelection, setRowSelectionInternal] = useState({});
    const setRowSelection = useCallback((updater) => {
        setRowSelectionInternal((old) => {
            const newRowSelection = typeof updater === 'function' ? updater(old) : updater;
            const id = Object.keys(newRowSelection)[0];
            if (id) {
                store?.setCurrentRowId(id);
            }
            return newRowSelection;
        });
    }, [store]);
    const [columnOrder, setColumnOrder] = useState(() => getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder));
    const onColumnOrderChange = useCallback((updater) => {
        setColumnOrder((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            return normalizeColumnOrder(tableColumns, next);
        });
        resizeProxy.current.count++;
    }, [tableColumns]);
    const defaultPageSize = store?.defaultLimit ?? DEFAULT_PAGE_SIZE;
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });
    const setPaginationPageSize = useCallback((pageSize) => {
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
            setPreferences((prev) => prev.tableVariant === initialPreferences.tableVariant
                ? prev
                : { ...prev, tableVariant: initialPreferences.tableVariant });
        }
    }, [initialPreferences?.tableVariant]);
    const table = useReactTable({
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
export async function resetTableColumnLayout(table) {
    const meta = table.options.meta;
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
//# sourceMappingURL=useTable.js.map