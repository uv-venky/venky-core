/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useIsStoreBusy, useStoreRowCount } from '@/components/core/hooks/useStoreHooks';
import { Button } from '@/components/ui/button';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import { Loader2, PlusIcon } from 'lucide-react';
import { Suspense, useState, useCallback, type ReactNode } from 'react';
import Suspended from '@/components/core/common/Suspended';
import type { Column } from '@/components/core/smart-search/types';
import ColumnViewsDialog from '@/components/core/page/column-views-dialog';
import StoreExportDropdown from '@/components/core/StoreExportDropdown';
import { EditPopup } from '@/components/core/page/edit-popup';
import { EditSheet } from '@/components/core/page/edit-sheet';
import Filters from '@/components/core/page/filters';
import PageLayout from '@/components/core/page/PageLayout';
import DataTable from '@/components/core/page/table';
import useTable from '@/components/core/page/useTable';
import DataTablePagination from '@/components/core/page/data-table-pagination';
import type { NewRow, StringKeyof, Filters as FiltersType } from '@/lib/core/common/ds/types/filter';
import { useAppContext } from '@/components/sidebar/app-provider';
import { cn } from '@/lib/utils';
import type { TableVariant } from '@/components/core/common/types';
import { deferAutoQueryForSavedSearches } from '@/lib/core/client/store';

type Props<T extends object> = {
  store: Store<T>;
  filterStartContent?: ReactNode;
  filterEndContent?: ReactNode;
  toolbarContent?: ReactNode;
  hideColumnsMenu?: boolean;
  hideFilters?: boolean;
  hidePagination?: boolean;
  smartSearchColumns: Column<T>[];
  tableColumns: AccessorKeyColumnDef<T>[];
  pageId: string;
  itemId: string;
  title: string;
  subTitle: string;
  icon: ReactNode;
  editForm?: ReactNode;
  /** Optional content rendered in the edit sheet/popup footer (e.g. secondary actions) */
  editFormFooterContent?: ReactNode;
  getDefaultRow?: () => NewRow<T>;
  addNewButtonText?: string;
  loadingRows?: number;
  searchOnBlur?: boolean;
  defaultVisibleColumnOrder?: StringKeyof<T>[];
  rowClickToEdit?: boolean;
  popupWidth?: number;
  popupHeight?: number;
  popupBodyClassName?: string;
  editFormLayout?: 'sheet' | 'popup';
  disableHeaderFilters?: boolean;
  updateFilters?: (filters: FiltersType<T>) => FiltersType<T>;
  stickyFilters?: (keyof T)[];
  /** Opt in on this page. Blocked when deployment config sets `features.naturalLanguageSearch: false`. */
  enableNaturalLanguageSearch?: boolean;
  /** Placeholder for natural-language search mode. */
  nlPlaceholder?: string;
  allowDelete?: boolean;
  handleSave?: (onClose: () => void) => Promise<void>;
  onSaveSuccess?: () => void;
  keepOpen?: boolean;
  showExportButton?: boolean;
  exportFilename?: string;
  exportIncludeMetadata?: boolean;
  editFormSubTitle?: string;
  tableVariant?: TableVariant;
  statsSection?: ReactNode;
};

export default function PageLayoutTemplate<T extends object>({
  store,
  filterStartContent,
  filterEndContent,
  hideColumnsMenu = false,
  hideFilters = false,
  hidePagination = false,
  smartSearchColumns,
  tableColumns,
  pageId,
  itemId,
  title,
  subTitle,
  icon,
  editForm,
  editFormFooterContent,
  getDefaultRow,
  addNewButtonText = 'Add New',
  toolbarContent,
  loadingRows,
  searchOnBlur,
  defaultVisibleColumnOrder,
  rowClickToEdit,
  popupWidth,
  popupHeight,
  popupBodyClassName,
  editFormLayout = 'sheet',
  disableHeaderFilters: disableHeaderFiltersProp,
  updateFilters,
  stickyFilters,
  allowDelete,
  handleSave,
  onSaveSuccess,
  keepOpen,
  showExportButton = false,
  exportFilename = 'export',
  exportIncludeMetadata = false,
  editFormSubTitle,
  tableVariant,
  enableNaturalLanguageSearch,
  nlPlaceholder,
  statsSection,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const { DISABLE_HEADER_FILTERS_DEFAULT } = useAppContext();
  const disableHeaderFilters = disableHeaderFiltersProp ?? DISABLE_HEADER_FILTERS_DEFAULT;
  const table = useTable<T>({
    store,
    tableColumns,
    defaultVisibleColumnOrder,
    disableHeaderFilters,
    initialPreferences: tableVariant ? { tableVariant } : undefined,
  });

  // Defer initial queries before Filters mount (Filters is inside Suspense; defer must run synchronously).
  if (!store.initialQueryFired() && !hideFilters) {
    deferAutoQueryForSavedSearches(store);
  }

  return (
    <PageLayout
      title={title}
      subTitle={subTitle}
      icon={icon}
      toolbar={
        <>
          {editForm && (
            <div className="flex shrink-0 items-center gap-4">
              <Button
                variant="default"
                onClick={async () => {
                  await store?.createNew({ partialRecord: getDefaultRow?.() });
                  setOpen(true);
                }}
                data-testid="add-new-button"
              >
                <PlusIcon className="h-4 w-4" />
                {addNewButtonText}
              </Button>
              {editFormLayout === 'popup' ? (
                open && (
                  <EditPopup
                    title={title}
                    store={store}
                    onClose={() => setOpen(false)}
                    width={popupWidth}
                    height={popupHeight}
                    bodyClassName={popupBodyClassName}
                    footerContent={editFormFooterContent}
                    allowDelete={allowDelete}
                    handleSave={handleSave}
                    onSaveSuccess={onSaveSuccess}
                    description={editFormSubTitle}
                  >
                    {editForm}
                  </EditPopup>
                )
              ) : (
                <EditSheet
                  title={title}
                  store={store}
                  open={open}
                  onClose={() => setOpen(false)}
                  width={popupWidth}
                  allowDelete={allowDelete}
                  handleSave={handleSave}
                  onSaveSuccess={onSaveSuccess}
                  keepOpen={keepOpen}
                  bodyClassName={popupBodyClassName}
                  footerContent={editFormFooterContent}
                  description={editFormSubTitle}
                >
                  {editForm}
                </EditSheet>
              )}
            </div>
          )}
          {toolbarContent}
        </>
      }
      statsSection={statsSection}
      filterSection={
        <div className="flex flex-1 shrink-0 items-start gap-2">
          {filterStartContent}
          {!hideFilters && (
            <Suspense fallback={<Suspended name="Filters" />}>
              <Filters
                border="none"
                store={store}
                table={table}
                columns={smartSearchColumns}
                pageId={pageId}
                itemId={itemId}
                searchOnBlur={searchOnBlur}
                updateFilters={updateFilters}
                stickyFilters={stickyFilters}
                enableNaturalLanguageSearch={enableNaturalLanguageSearch}
                nlPlaceholder={nlPlaceholder}
              />
            </Suspense>
          )}
          {!hideColumnsMenu && (
            <ColumnViewsDialog
              table={table as unknown as Table<object>}
              variant="ghost"
              iconOnly
              className={cn('mt-1', showExportButton ? '' : 'mr-2')}
              defaultPreferences={tableVariant ? { tableVariant } : undefined}
            />
          )}
          {showExportButton && (
            <StoreExportDropdown
              store={store}
              table={table}
              filename={exportFilename}
              includeMetadata={exportIncludeMetadata}
              className="mt-1 mr-2"
            />
          )}
          {filterEndContent}
        </div>
      }
      mainSection={
        <MainSection
          table={table}
          hidePagination={hidePagination}
          store={store}
          title={title}
          editForm={editForm}
          editFormFooterContent={editFormFooterContent}
          editFormSubTitle={editFormSubTitle}
          smartSearchColumns={smartSearchColumns}
          loadingRows={loadingRows}
          rowClickToEdit={rowClickToEdit}
          popupWidth={popupWidth}
          popupHeight={popupHeight}
          popupBodyClassName={popupBodyClassName}
          editFormLayout={editFormLayout}
          allowDelete={allowDelete}
          handleSave={handleSave}
          onSaveSuccess={onSaveSuccess}
          keepOpen={keepOpen}
        />
      }
    />
  );
}

function MainSection<T extends object>({
  table,
  hidePagination,
  store,
  title,
  editForm,
  editFormFooterContent,
  editFormSubTitle,
  smartSearchColumns,
  loadingRows,
  rowClickToEdit = false,
  popupWidth,
  popupHeight,
  popupBodyClassName,
  editFormLayout = 'sheet',
  allowDelete,
  handleSave,
  onSaveSuccess,
  keepOpen,
}: {
  table: Table<T>;
  hidePagination: boolean;
  store: Store<T>;
  title: string;
  editForm?: React.ReactNode;
  editFormFooterContent?: React.ReactNode;
  editFormSubTitle?: string;
  smartSearchColumns: Column<T>[];
  loadingRows?: number;
  rowClickToEdit?: boolean;
  popupWidth?: number;
  popupHeight?: number;
  popupBodyClassName?: string;
  editFormLayout?: 'sheet' | 'popup';
  allowDelete?: boolean;
  handleSave?: (onClose: () => void) => Promise<void>;
  onSaveSuccess?: () => void;
  keepOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const onRowClick = useCallback(() => {
    setOpen(true);
  }, []);
  const onEdit = useCallback(
    async (rowId: string) => {
      const accepted = await store.setCurrentRowId(rowId);
      if (!accepted) return;
      setOpen(true);
    },
    [store, setOpen],
  );

  return (
    <Suspense fallback={<Suspended name="MainSection" />}>
      <div className="flex h-full w-full flex-col">
        <div className="relative flex-1 rounded-md">
          <DataTable
            table={table}
            onRowClick={editForm && rowClickToEdit ? onRowClick : undefined}
            onEdit={editForm ? onEdit : undefined}
            store={store}
            smartSearchColumns={smartSearchColumns}
            loadingRows={loadingRows}
          />
          {editForm &&
            (editFormLayout === 'popup' ? (
              open && (
                <EditPopup<T>
                  title={title}
                  store={store}
                  onClose={() => setOpen(false)}
                  width={popupWidth}
                  height={popupHeight}
                  bodyClassName={popupBodyClassName}
                  footerContent={editFormFooterContent}
                  allowDelete={allowDelete}
                  handleSave={handleSave}
                  onSaveSuccess={onSaveSuccess}
                  description={editFormSubTitle}
                >
                  {editForm}
                </EditPopup>
              )
            ) : (
              <EditSheet<T>
                title={title}
                store={store}
                open={open}
                onClose={() => setOpen(false)}
                width={popupWidth}
                allowDelete={allowDelete}
                handleSave={handleSave}
                onSaveSuccess={onSaveSuccess}
                keepOpen={keepOpen}
                bodyClassName={popupBodyClassName}
                footerContent={editFormFooterContent}
                description={editFormSubTitle}
              >
                {editForm}
              </EditSheet>
            ))}
        </div>
        {!hidePagination && <PaginationSection table={table} store={store} />}
      </div>
    </Suspense>
  );
}

export function PaginationSection<T extends object>({
  table,
  store,
  hideRowsPerPageSelector = false,
}: {
  table: Table<T>;
  store: Store<T>;
  hideRowsPerPageSelector?: boolean;
}) {
  const rowCount = useStoreRowCount<T>(store);
  const isStoreBusy = useIsStoreBusy(store);

  return (
    <Suspense fallback={<Suspended name="PaginationSection" />}>
      <div className="flex shrink-0 select-none items-center justify-end space-x-2 p-2">
        {isStoreBusy ? (
          <div className="flex-1">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          rowCount != null && <div className="flex-1 text-muted-foreground text-sm">{rowCount} row(s)</div>
        )}
        <div className="space-x-2">
          <DataTablePagination table={table} store={store} hideRowsPerPageSelector={hideRowsPerPageSelector} />
        </div>
      </div>
    </Suspense>
  );
}
