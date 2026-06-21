/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { flexRender } from '@tanstack/react-table';
import { GripVerticalIcon, Loader2 } from 'lucide-react';
import * as React from 'react';
import { memo, useEffect, useState } from 'react';
import { subscribe } from 'valtio';
import { ACTIONS_COLUMN_ID } from '../../../components/core/table/actions-column-def';
import useAutoSizer from '../../../components/core/hooks/useAutoSizer';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { Skeleton } from '../../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { cn } from '../../../lib/utils';
import EmptyState from '../../../components/core/common/EmptyState';
import { useCurrentRowId, useIsStoreLoading, useStoreError } from '../../../components/core/hooks/useStoreHooks';
import { RowIdProvider, StoreProvider } from '../../../components/core/page/RowIdProvider';
import ErrorCard from '../../../components/core/common/error';
import TableHeaderFilters from '../../../components/core/page/table-header-filters';
import ErrorBoundary from '../common/ErrorBoundary';
import { useTableVariant } from '../../../components/core/hooks/useTableVariant';
import {
  isColumnStickyLeft,
  isColumnStickyRight,
  resolveEffectiveStickyColumns,
} from '../../../components/core/page/table-column-preferences';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { assertExists } from '../utils';
function ReorderableRow({ row, onRowClick, store, currentRowId, children }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.id,
    data: {
      type: 'reorder',
      row,
      store,
    },
  });
  const style = {
    transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };
  return _jsx(TableRow, {
    'data-state': (row.id === currentRowId || row.getIsSelected()) && 'selected',
    className: cn('group/row relative', onRowClick ? 'cursor-pointer' : ''),
    onClick: () => onRowClick?.(row),
    onClickCapture: async () => {
      await store.setCurrentRowId(row.id);
    },
    ref: setNodeRef,
    style: style,
    children: children,
  });
}
function DraggableRow({ row, onRowClick, store, currentRowId, children }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: row.id,
    data: {
      type: 'drag',
      row,
      store,
    },
  });
  return _jsx(TableRow, {
    'data-state': (row.id === currentRowId || row.getIsSelected()) && 'selected',
    className: cn('group/row relative cursor-grab'),
    onClick: () => onRowClick?.(row),
    onClickCapture: async () => {
      await store.setCurrentRowId(row.id);
    },
    ref: setNodeRef,
    ...listeners,
    ...attributes,
    children: children,
  });
}
function DroppableRow({ row, onRowClick, store, currentRowId, children }) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: row.id,
    data: {
      type: 'drop',
      row,
      store,
    },
  });
  return _jsx(TableRow, {
    'data-state': (row.id === currentRowId || row.getIsSelected()) && 'selected',
    className: cn(
      'group/row relative data-[state=selected]:bg-transparent',
      onRowClick ? 'cursor-pointer' : '',
      active &&
        'bg-green-50 data-[state=selected]:bg-green-50 dark:bg-green-950 dark:data-[state=selected]:bg-green-950',
      isOver &&
        'border-b-2 border-b-green-500 bg-green-100 data-[state=selected]:bg-green-100 dark:bg-green-900 dark:data-[state=selected]:bg-green-900',
    ),
    onClick: () => onRowClick?.(row),
    onClickCapture: async () => {
      await store.setCurrentRowId(row.id);
    },
    ref: setNodeRef,
    children: children,
  });
}
function CanBeDraggableRow(props) {
  const { row, onRowClick, store, currentRowId, children, reorderable, draggable, droppable } = props;
  if (reorderable) {
    return _jsx(ReorderableRow, { ...props });
  }
  if (draggable) {
    return _jsx(DraggableRow, { ...props });
  }
  if (droppable) {
    return _jsx(DroppableRow, { ...props });
  }
  return _jsx(TableRow, {
    'data-state': (row.id === currentRowId || row.getIsSelected()) && 'selected',
    className: cn('group/row relative', onRowClick ? 'cursor-pointer' : ''),
    onClick: () => onRowClick?.(row),
    onClickCapture: async () => {
      await store.setCurrentRowId(row.id);
    },
    children: children,
  });
}
function DataTable({
  loadingRows = 20,
  table,
  onRowClick,
  onEdit,
  store,
  variant: variantProp,
  emptyStateTitle = 'No data found!',
  emptyStateSubtitle = 'Use the smart search to fetch the data',
  hideCurrentRowIndicator = false,
  smartSearchColumns,
  reorderable,
  draggable,
  droppable,
  renderSubComponent,
}) {
  const meta = table.options.meta;
  assertExists(meta, 'Table meta is required');
  const variant = useTableVariant(variantProp ?? meta.preferences?.tableVariant);
  const { width, height, Container } = useAutoSizer();
  const isStoreLoading = useIsStoreLoading(store);
  const error = useStoreError(store);
  const currentRowId = useCurrentRowId(store);
  const [_, forceUpdate] = useState(0);
  const updateProxy = meta.updateProxy;
  const resizeProxy = meta.resizeProxy;
  useEffect(() => {
    subscribe(updateProxy, () => {
      forceUpdate((prev) => prev + 1);
    });
    subscribe(resizeProxy, () => {
      forceUpdate((prev) => prev + 1);
    });
  }, [updateProxy, resizeProxy]);
  // Store onEdit in table meta so it can be accessed from column definitions
  // Set it synchronously on every render to ensure it's always fresh, especially after HMR
  // This ensures that even if the onEdit function reference changes after HMR,
  // it will be updated in the table meta before any event handlers are called
  meta.onEdit = onEdit;
  const { columnSizingInfo, columnSizing, columnOrder, columnVisibility } = table.getState();
  const effectiveSticky = React.useMemo(() => {
    const visibleColumnIds = columnOrder.filter((id) => columnVisibility[id] !== false);
    return resolveEffectiveStickyColumns({
      visibleColumnIds,
      tableColumns: meta.tableColumns,
      preferences: meta.preferences,
    });
  }, [columnOrder, columnVisibility, meta.tableColumns, meta.preferences]);
  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const leafHeaders = table.getLeafHeaders();
    const colSizes = {};
    const totalSize = table.getTotalSize();
    colSizes['--table-width'] = `${Math.max(totalSize, width)}px`;
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const headerSize = header.getSize();
      const colSize = header.column.getSize();
      colSizes[`--header-${header.id}-size`] = `${headerSize}px`;
      colSizes[`--col-${header.column.id}-size`] = `${colSize}px`;
    }
    if (totalSize < width) {
      const totalFlexGrow = leafHeaders.reduce((acc, header) => acc + (header.column.columnDef.meta?.flexGrow ?? 0), 0);
      const remainingWidth = width - totalSize;
      if (totalFlexGrow > 0) {
        const flexGrowWidth = Math.floor(remainingWidth / totalFlexGrow);
        for (const header of leafHeaders) {
          const flexGrow = header.column.columnDef.meta?.flexGrow ?? 0;
          if (flexGrow > 0) {
            const size = Math.floor(flexGrow * flexGrowWidth);
            colSizes[`--header-${header.id}-size`] = `${size + header.getSize()}px`;
            colSizes[`--col-${header.column.id}-size`] = `${size + header.column.getSize()}px`;
          }
        }
      } else {
        const lastColumn = leafHeaders[leafHeaders.length - 1];
        if (lastColumn) {
          // If the last column is the actions column, flex the second-to-last column instead
          const columnToFlex =
            lastColumn.column.id === ACTIONS_COLUMN_ID && leafHeaders.length > 1
              ? leafHeaders[leafHeaders.length - 2]
              : lastColumn;
          if (columnToFlex) {
            colSizes[`--header-${columnToFlex.id}-size`] = `${columnToFlex.getSize() + remainingWidth}px`;
            colSizes[`--col-${columnToFlex.column.id}-size`] = `${columnToFlex.column.getSize() + remainingWidth}px`;
          }
        }
      }
    }
    let left = 0;
    for (const header of leafHeaders) {
      const colSize = header.column.getSize();
      if (isColumnStickyLeft(header.column.id, effectiveSticky)) {
        colSizes[`--left-${header.column.id}`] = `${left}px`;
        left += colSize;
      }
    }
    let right = 0;
    for (let i = leafHeaders.length - 1; i >= 0; i--) {
      const header = leafHeaders[i];
      const colSize = header.column.getSize();
      if (isColumnStickyRight(header.column.id, effectiveSticky)) {
        colSizes[`--right-${header.column.id}`] = `${right}px`;
        right += colSize;
      }
    }
    return colSizes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columnSizingInfo, columnSizing, width, columnOrder, columnVisibility, meta.tableColumns, effectiveSticky]);
  const emptyState = _jsx(EmptyState, {
    title: emptyStateTitle,
    description: emptyStateSubtitle,
    icon: 'table',
    style: { height: Math.max(height - 50 - 16, 280) },
  });
  return _jsx(ErrorBoundary, {
    showDetails: process.env.NODE_ENV === 'development',
    children: _jsx(StoreProvider, {
      store: store,
      children: _jsx(Container, {
        className: 'absolute inset-0 h-full w-full flex-1',
        children: _jsx(ScrollArea, {
          className: 'h-full',
          style: { width: width, height: height },
          children: _jsxs(Table, {
            style: columnSizeVars,
            className: 'w-(--table-width)',
            children: [
              _jsxs(TableHeader, {
                className: 'sticky top-0 z-10 border-separate border-spacing-0',
                children: [
                  table.getHeaderGroups().map((headerGroup) =>
                    _jsx(
                      TableRow,
                      {
                        className: cn({
                          'h-8': variant === 'compact',
                          'h-10': variant === 'default',
                          'h-12': variant === 'roomy' || variant === 'spacious',
                        }),
                        children: headerGroup.headers.map((header) => {
                          const isStickyLeft = isColumnStickyLeft(header.column.id, effectiveSticky);
                          const isStickyRight = isColumnStickyRight(header.column.id, effectiveSticky);
                          return _jsxs(
                            TableHead,
                            {
                              className: cn(
                                'group/header relative select-none p-0 shadow-[inset_0_0_0,inset_0_-2px_0] shadow-neutral-400',
                                isStickyLeft && 'sticky left-0 z-20 bg-table-header',
                                isStickyRight && 'sticky right-0 z-20 bg-table-header',
                              ),
                              style: {
                                width: `var(--col-${header.column.id}-size)`,
                                ...(isStickyLeft ? { left: `var(--left-${header.column.id})` } : {}),
                                ...(isStickyRight ? { right: `var(--right-${header.column.id})` } : {}),
                              },
                              children: [
                                header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext()),
                                header.column.getCanResize() &&
                                  _jsxs('div', {
                                    onDoubleClick: () => header.column.resetSize(),
                                    onMouseDown: header.getResizeHandler(),
                                    onTouchStart: header.getResizeHandler(),
                                    className: cn(
                                      `flex items-center justify-center absolute right-0 top-0 h-full w-2 mr-2 cursor-col-resize overflow-visible`,
                                      header.column.getIsResizing() ? 'flex' : 'hidden group-hover/header:flex',
                                    ),
                                    children: [
                                      _jsx(Separator, {
                                        orientation: 'vertical',
                                        className: 'absolute right-1 h-full bg-neutral-400',
                                      }),
                                      _jsx('div', {
                                        className:
                                          'z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border',
                                        children: _jsx(GripVerticalIcon, { className: 'size-2.5' }),
                                      }),
                                    ],
                                  }),
                              ],
                            },
                            header.id,
                          );
                        }),
                      },
                      headerGroup.id,
                    ),
                  ),
                  !table.options.meta?.disableHeaderFilters &&
                    smartSearchColumns &&
                    _jsx(TableHeaderFilters, { table: table, store: store, columns: smartSearchColumns }),
                ],
              }),
              _jsx(TableBody, {
                showBorderOnLastRow: droppable,
                children:
                  isStoreLoading && (table.getRowModel().rows?.length ?? 0) === 0 && loadingRows > 0
                    ? [...Array(loadingRows)].map((_, i) =>
                        _jsx(
                          TableRow,
                          {
                            children: table.getAllColumns().map((column) =>
                              _jsx(
                                TableCell,
                                {
                                  style: { width: `var(--col-${column.id}-size)` },
                                  className: cn('p-2', {
                                    'h-6': variant === 'compact',
                                    'h-9': variant === 'default',
                                    'h-12': variant === 'roomy',
                                    'h-[92px]': variant === 'spacious',
                                  }),
                                  children: _jsx(Skeleton, { className: 'h-full w-full' }),
                                },
                                column.id,
                              ),
                            ),
                          },
                          i,
                        ),
                      )
                    : table.getRowModel().rows?.length
                      ? table.getRowModel().rows.map((row) =>
                          _jsxs(
                            React.Fragment,
                            {
                              children: [
                                _jsx(RowIdProvider, {
                                  rowId: row.id,
                                  children: _jsx(CanBeDraggableRow, {
                                    onRowClick: onRowClick,
                                    store: store,
                                    row: row,
                                    currentRowId: currentRowId,
                                    reorderable: reorderable,
                                    draggable: draggable,
                                    droppable: droppable,
                                    children: row.getVisibleCells().map((cell, index) => {
                                      const isStickyLeft = isColumnStickyLeft(cell.column.id, effectiveSticky);
                                      const isStickyRight = isColumnStickyRight(cell.column.id, effectiveSticky);
                                      return _jsx(
                                        TableCell,
                                        {
                                          style: {
                                            width: `var(--col-${cell.column.id}-size)`,
                                            ...(isStickyLeft ? { left: `var(--left-${cell.column.id})` } : {}),
                                            ...(isStickyRight ? { right: `var(--right-${cell.column.id})` } : {}),
                                          },
                                          className: cn(
                                            'relative p-0',
                                            !droppable &&
                                              'group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                            {
                                              'h-6': variant === 'compact',
                                              'h-9': variant === 'default',
                                              'h-12': variant === 'roomy',
                                              'h-[92px]': variant === 'spacious',
                                              'before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-primary before:content-[""]':
                                                index === 0 && row.id === currentRowId && !hideCurrentRowIndicator,
                                            },
                                            isStickyLeft && 'sticky left-0 z-2 bg-background',
                                            isStickyRight && 'sticky right-0 z-2 bg-background',
                                          ),
                                          children: flexRender(cell.column.columnDef.cell, cell.getContext()),
                                        },
                                        cell.id,
                                      );
                                    }),
                                  }),
                                }),
                                renderSubComponent &&
                                  row.getIsExpanded() &&
                                  _jsx(
                                    TableRow,
                                    {
                                      children: _jsx(TableCell, {
                                        colSpan: row.getVisibleCells().length,
                                        className: 'p-0',
                                        children: _jsx(RowIdProvider, {
                                          rowId: row.id,
                                          children: renderSubComponent({ row }),
                                        }),
                                      }),
                                    },
                                    `${row.id}-expanded`,
                                  ),
                              ],
                            },
                            row.id,
                          ),
                        )
                      : _jsx(TableRow, {
                          children: _jsx(TableCell, {
                            colSpan: table.getAllColumns().length,
                            className: 'h-6 text-center',
                            children: isStoreLoading
                              ? _jsx(Loader2, { className: 'size-4 animate-spin' })
                              : error
                                ? _jsx(ErrorCard, { children: error })
                                : droppable
                                  ? _jsx(DroppableEmptyState, {
                                      height: Math.max(height - 50 - 16, 280),
                                      children: emptyState,
                                    })
                                  : emptyState,
                          }),
                        }),
              }),
            ],
          }),
        }),
      }),
    }),
  });
}
export default memo(DataTable);
function DroppableEmptyState({ children, height }) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: 'droppable-empty-state',
  });
  return _jsx('div', {
    ref: setNodeRef,
    children: !active
      ? children
      : _jsx('div', {
          className: cn(
            'flex h-full w-full items-center justify-center border-4 border-dotted',
            isOver && 'border-green-500',
          ),
          style: { height },
          children: 'Drop here...',
        }),
  });
}
//# sourceMappingURL=table.js.map
