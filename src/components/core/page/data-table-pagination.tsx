/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Store } from '@/lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { PAGE_SIZE_OPTIONS } from '@/components/core/page/table-column-preferences';
import { useStoreOffset, useStoreRowCount } from '@/components/core/hooks/useStoreHooks';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps<T extends object> {
  table: Table<T>;
  pageSizeOptions?: PageSizeOptions;
  store: Store<T>;
  hideRowsPerPageSelector?: boolean;
}

type PageSizeOptions = readonly number[];

function PaginationButton({
  onClick,
  disabled,
  label,
  icon,
  testId,
}: {
  onClick: () => Promise<void>;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
  testId: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      aria-label={label}
      variant="outline"
      className={cn('hidden size-8 p-0 lg:flex', (disabled || busy) && 'cursor-not-allowed')}
      onClick={async () => {
        try {
          setBusy(true);
          await onClick();
        } finally {
          setBusy(false);
        }
      }}
      disabled={disabled || busy}
      data-tip={label}
      data-testid={testId}
    >
      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
    </Button>
  );
}

function DataTablePagination<T extends object>({
  table,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  store,
  hideRowsPerPageSelector = false,
}: DataTablePaginationProps<T>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const _rowCount = useStoreRowCount(store);
  const [_, forceUpdate] = useState(0);
  const [busy, setBusy] = useState(false);

  const offset = useStoreOffset<T>(store);
  useEffect(() => {
    // on sort or filter, the offset is reset to 0, so we need to reset the page index to 0
    if (offset === 0) {
      table.setPageIndex(0);
      forceUpdate((prev) => prev + 1);
    } else {
      const page = Math.floor(offset / table.getState().pagination.pageSize);
      if (page !== table.getState().pagination.pageIndex) {
        table.setPageIndex(page);
        forceUpdate((prev) => prev + 1);
      }
    }
  }, [offset, table]);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
      <div className="flex select-none flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        {table.getPageCount() > 0 && (
          <>
            {!hideRowsPerPageSelector && (
              <div className="flex items-center space-x-2">
                <p className="whitespace-nowrap font-medium text-sm">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={async (value) => {
                    try {
                      setBusy(true);
                      table.setPageIndex(0);
                      table.setPageSize(Number(value));
                      if (store) {
                        await store.setLimit(Number(value));
                      }
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <SelectTrigger
                    disabled={busy}
                    className="h-8 w-[4.5rem]"
                    data-testid="pagination-rows-per-page-trigger"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <SelectValue placeholder={table.getState().pagination.pageSize} />
                    )}
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((pageSize) => (
                      <SelectItem
                        key={pageSize}
                        value={`${pageSize}`}
                        data-testid={`pagination-rows-per-page-option-${pageSize}`}
                      >
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-center font-medium text-sm" data-testid="pagination-page-info">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
          </>
        )}
        <div className="flex items-center space-x-2">
          <PaginationButton
            onClick={async () => {
              table.setPageIndex(0);
              if (store) {
                await store.goToPage(0);
              }
              forceUpdate((prev) => prev + 1);
            }}
            disabled={busy || !table.getCanPreviousPage()}
            label="Go to first page"
            icon={<ChevronsLeft className="size-4" aria-hidden="true" />}
            testId="pagination-first-page"
          />
          <PaginationButton
            label="Go to previous page"
            onClick={async () => {
              table.previousPage();
              if (store) {
                await store.goToPage(pageIndex - 1);
              }
              forceUpdate((prev) => prev + 1);
            }}
            disabled={busy || !table.getCanPreviousPage()}
            icon={<ChevronLeft className="size-4" aria-hidden="true" />}
            testId="pagination-previous-page"
          />
          <PaginationButton
            label="Go to next page"
            icon={<ChevronRight className="size-4" aria-hidden="true" />}
            onClick={async () => {
              table.nextPage();
              if (store) {
                await store.goToPage(pageIndex + 1);
              }
              forceUpdate((prev) => prev + 1);
            }}
            disabled={busy || !table.getCanNextPage()}
            testId="pagination-next-page"
          />
          <PaginationButton
            label="Go to last page"
            onClick={async () => {
              table.setPageIndex(pageCount - 1);
              if (store) {
                await store.goToPage(pageCount - 1);
              }
              forceUpdate((prev) => prev + 1);
            }}
            disabled={busy || !table.getCanNextPage()}
            icon={<ChevronsRight className="size-4" aria-hidden="true" />}
            testId="pagination-last-page"
          />
        </div>
      </div>
    </div>
  );
}

export default memo(DataTablePagination) as <T extends object>(props: DataTablePaginationProps<T>) => React.ReactNode;
