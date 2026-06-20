/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useStoreRowCount } from '@/components/core/hooks/useStoreHooks';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import type * as React from 'react';
import type { Column } from '@/components/core/smart-search/types';
import ColumnViewsDialog from '@/components/core/page/column-views-dialog';
import Filters from '@/components/core/page/filters';
import DataTable from '@/components/core/page/table';
import useTable from '@/components/core/page/useTable';
import DataTablePagination from './data-table-pagination';

export default function SimplePageTemplate<T extends object>({
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
}: {
  store: Store<T>;
  headerStartContent?: React.ReactNode;
  headerEndContent?: React.ReactNode;
  hideColumnsMenu?: boolean;
  hideFilters?: boolean;
  hidePagination?: boolean;
  smartSearchColumns: Column<T>[];
  tableColumns: AccessorKeyColumnDef<T>[];
  pageId: string;
  itemId: string;
}) {
  const rowCount = useStoreRowCount(store);

  const table = useTable<T>({
    store,
    tableColumns,
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div className="my-4 flex shrink-0 items-center gap-4">
        {headerStartContent}
        {!hideFilters && (
          <Filters
            border="full"
            roundedCorners
            store={store}
            table={table}
            columns={smartSearchColumns}
            pageId={pageId}
            itemId={itemId}
          />
        )}
        {!hideColumnsMenu && <ColumnViewsDialog table={table as unknown as Table<object>} />}
        {headerEndContent}
      </div>
      <div className="relative flex-1 rounded-md border">
        <DataTable table={table} store={store} smartSearchColumns={smartSearchColumns} />
      </div>
      {!hidePagination && (
        <div className="flex shrink-0 items-center justify-end space-x-2 pt-4">
          <div className="flex-1 text-muted-foreground text-sm">{rowCount} row(s)</div>
          <div className="space-x-2">
            <DataTablePagination table={table} store={store} />
          </div>
        </div>
      )}
    </div>
  );
}
