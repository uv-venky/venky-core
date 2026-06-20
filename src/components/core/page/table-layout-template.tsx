/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useIsStoreBusy, useStoreRowCount } from '@/components/core/hooks/useStoreHooks';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import { Suspense, type ReactNode } from 'react';
import Suspended from '@/components/core/common/Suspended';
import type { Column } from '@/components/core/smart-search/types';
import ColumnViewsDialog from '@/components/core/page/column-views-dialog';
import Filters from '@/components/core/page/filters';
import DataTable from '@/components/core/page/table';
import useTable from '@/components/core/page/useTable';
import DataTablePagination from '@/components/core/page/data-table-pagination';
import { WaveDots } from '@/components/core/common/WaveDots';
import type { Filters as FiltersType } from '@/lib/core/common/ds/types/filter';
import type { TableVariant } from '@/components/core/common/types';

type Props<T extends object> = {
  store: Store<T>;
  headerStartContent?: ReactNode;
  headerEndContent?: ReactNode;
  hideColumnsMenu?: boolean;
  hideFilters?: boolean;
  hidePagination?: boolean;
  smartSearchColumns: Column<T>[];
  tableColumns: AccessorKeyColumnDef<T>[];
  pageId: string;
  itemId: string;
  onRowClick?: () => void;
  variant?: TableVariant;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  updateFilters?: (filters: FiltersType<T>) => FiltersType<T>;
};

export default function TableLayoutTemplate<T extends object>({
  store,
  headerStartContent,
  headerEndContent,
  hideColumnsMenu = false,
  hideFilters = false,
  hidePagination = false,
  smartSearchColumns,
  tableColumns,
  pageId,
  itemId,
  onRowClick,
  variant = 'roomy',
  emptyStateTitle = 'No data found',
  emptyStateSubtitle = 'Use the filters above to search',
  updateFilters,
}: Props<T>) {
  const table = useTable<T>({
    store,
    tableColumns,
    initialPreferences: { tableVariant: variant },
  });

  const rowCount = useStoreRowCount(store);
  const isStoreBusy = useIsStoreBusy(store);

  return (
    <div className="flex h-full flex-col">
      {/* Filter Section */}
      <div className="flex shrink-0 items-center py-4">
        {headerStartContent}
        {!hideFilters && (
          <Suspense fallback={<Suspended name="Filters" />}>
            <Filters
              border="none"
              store={store}
              table={table}
              columns={smartSearchColumns}
              pageId={pageId}
              itemId={itemId}
              updateFilters={updateFilters}
            />
          </Suspense>
        )}
        {!hideColumnsMenu && (
          <ColumnViewsDialog
            table={table as unknown as Table<object>}
            variant="ghost"
            defaultPreferences={{ tableVariant: variant }}
          />
        )}
        {headerEndContent}
      </div>

      {/* Main Section */}
      <Suspense fallback={<Suspended name="MainSection" />}>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex-1">
            <DataTable
              table={table}
              onRowClick={onRowClick}
              store={store}
              smartSearchColumns={smartSearchColumns}
              emptyStateTitle={emptyStateTitle}
              emptyStateSubtitle={emptyStateSubtitle}
            />
          </div>
          {!hidePagination && (
            <div className="flex shrink-0 items-center justify-end space-x-2 p-2">
              {isStoreBusy ? (
                <div className="flex-1">
                  <WaveDots active />
                </div>
              ) : (
                rowCount != null && <div className="flex-1 text-muted-foreground text-sm">{rowCount} row(s)</div>
              )}
              <div className="space-x-2">
                <DataTablePagination table={table} store={store} />
              </div>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
