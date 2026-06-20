'use client';

import {
  useIsHeaderFilterApplied,
  useIsHeaderFiltersHidden,
  useRowIds,
  useSelectedRowIds,
  useSortState,
} from '@/components/core/hooks/useStoreHooks';
import type { AttributeType } from '@/lib/core/common/ds/types/AttributeType';
import type { Store } from '@/lib/core/common/types/Store';
import { cn } from '@/lib/utils';
import type { Column, Header, Table } from '@tanstack/react-table';
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowUp10,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ArrowUpZA,
  FunnelX,
  Loader2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { SortDirection } from '@/components/core/pivot/PivotTypes';
import SortMenu from '@/components/core/common/SortMenu';
import { Button } from '@/components/ui/button';
import { assertExists } from '@/components/core/utils/assert';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { Checkbox } from '@/components/ui/checkbox';

export function TableRowSelectionHeaderCell({
  className,
  isDisabled,
}: {
  className?: string;
  isDisabled?: (rowId: string) => boolean;
}) {
  const store = useCurrentStore<any>();
  assertExists(store, 'Missing store in TableRowSelectionHeaderCell');
  const selectedIds = useSelectedRowIds(store);
  const rowIds = useRowIds(store);
  const selectableRowIds = useMemo(
    () => (isDisabled ? rowIds.filter((id) => !isDisabled(id)) : rowIds),
    [rowIds, isDisabled],
  );

  const isSelected = selectedIds.length > 0 && selectedIds.length === selectableRowIds.length;

  return (
    <Checkbox
      className={cn('mx-2 cursor-pointer justify-center', className)}
      checked={isSelected}
      onCheckedChange={(checked) => {
        if (checked) {
          if (isDisabled) {
            const ids = store.rowIds().filter((id) => !isDisabled?.(id));
            store.selectRows(ids);
          } else {
            store.selectAll();
          }
        } else {
          store.deSelectAll();
        }
      }}
      aria-label="Select all rows"
    />
  );
}

export default function HeaderCell({
  store,
  title,
  accessorKey,
  type,
  className,
  isEditable,
  column,
  sortable = true,
  align,
  table,
}: {
  store: Store<any>;
  title: string;
  accessorKey: string;
  type: AttributeType;
  className?: string;
  isEditable?: boolean;

  table: Table<any>;

  header: Header<any, unknown>;

  column: Column<any, unknown>;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}) {
  const [sortState, sortPosition] = useSortState(store, accessorKey);
  const [isSorting, setIsSorting] = useState(false);
  const headerFiltersHidden = useIsHeaderFiltersHidden(store);
  const isApplied = useIsHeaderFilterApplied(store, accessorKey);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  let sortIcon = <ArrowUpDown />;
  if (sortState != null) {
    switch (type) {
      case 'YN':
      case 'TF':
      case 'Boolean':
        sortIcon = sortState > 0 ? <ArrowDownNarrowWide /> : <ArrowUpWideNarrow />;
        break;
      case 'Number':
        sortIcon = sortState > 0 ? <ArrowDown01 /> : <ArrowUp10 />;
        break;
      default:
        sortIcon = sortState > 0 ? <ArrowDownAZ /> : <ArrowUpZA />;
        break;
    }
  }

  const handleSort = useCallback(
    async (newSortState?: SortDirection) => {
      setIsSorting(true);
      try {
        await store.sort({
          [accessorKey]: newSortState ? (newSortState === 'ascending' ? 1 : -1) : undefined,
        });
      } finally {
        setIsSorting(false);
      }
    },
    [store, accessorKey],
  );

  return (
    <div
      className={cn(
        'group/header relative flex h-full w-full items-center rounded-none p-0 px-2 hover:bg-transparent hover:text-table-header-foreground dark:hover:bg-transparent',
        {
          'justify-center': (!align && ['YN', 'TF', 'Boolean'].includes(type)) || align === 'center',
          'justify-end': (!align && type === 'Number') || align === 'right',
          'justify-between': (!align && !['YN', 'TF', 'Boolean', 'Number'].includes(type)) || align === 'left',
          'border-t-2 border-t-yellow-500 bg-yellow-50 dark:border-t-yellow-900 dark:bg-yellow-950': isEditable,
        },
        className,
      )}
    >
      <span className="truncate">{title}</span>
      <div className="flex items-center">
        {isApplied && headerFiltersHidden && (
          <Button
            className="text-blue-500 hover:text-blue-700"
            variant="ghost"
            size="icon"
            data-tip="Header Filter Applied. Click to view filters."
            onClick={() => {
              store.getState().hideHeaderFilters = false;
              // store.clearHeaderFilter(accessorKey);
              // store.applyHeaderFiltersIfChanged();
            }}
          >
            <FunnelX />
          </Button>
        )}
        {sortable && column.getCanSort() && (!column?.getIsResizing() || sortState != null || isSorting) && (
          <SortMenu
            sortDirection={sortState ? (sortState > 0 ? 'ascending' : 'descending') : undefined}
            onSort={handleSort}
            sortPosition={sortPosition}
            className={cn(
              'mr-2 flex shrink-0 transition-all duration-200 hover:bg-table-header-accent [&[data-state=open]]:flex',
              {
                'hidden group-hover/header:flex': sortState == null && !isSorting && !sortMenuOpen,
              },
            )}
            sortIcon={isSorting ? <Loader2 className="size-4 animate-spin" /> : sortIcon}
            store={store}
            open={sortMenuOpen}
            onOpenChange={setSortMenuOpen}
            disableHeaderFilters={table.options.meta?.disableHeaderFilters}
            columnId={accessorKey}
          />
        )}
      </div>
    </div>
  );
}
