/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import { PlusIcon, SaveAll, Trash } from 'lucide-react';
import { Suspense, useState, type ReactNode } from 'react';
import clientLogger from '@/lib/core/client/client-logger';
import Suspended from '@/components/core/common/Suspended';
import type { Column } from '@/components/core/smart-search/types';
import ColumnViewsDialog from '@/components/core/page/column-views-dialog';
import { getErrorMessage } from '@/lib/core/common/error';
import { showError } from '@/components/core/common/Notification';
import Filters from '@/components/core/page/filters';
import PageLayout from '@/components/core/page/PageLayout';
import DataTable from '@/components/core/page/table';
import useTable from '@/components/core/page/useTable';
import type { NewRow } from '@/lib/core/common/ds/types/filter';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { EditRecordForm } from '@/components/core/page/edit-record-form';
import { PaginationSection } from './page-layout-template';

type Props<T extends object> = {
  store: Store<T>;
  filterStartContent?: ReactNode;
  filterEndContent?: ReactNode;
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
  getDefaultRow?: () => NewRow<T>;
  addNewButtonText?: string;
  editFormProportion?: number;
  headerEndContent?: ReactNode;
};

export default function PageWithFormTemplate<T extends object>({
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
  getDefaultRow,
  addNewButtonText = 'Add New',
  editFormProportion = 50,
  headerEndContent,
}: Props<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const table = useTable<T>({
    store,
    tableColumns,
  });

  return (
    <PageLayout
      title={title}
      subTitle={subTitle}
      icon={icon}
      toolbar={
        editForm && (
          <div className="flex shrink-0 items-center gap-4">
            <Button
              variant="outline"
              onClick={async () => {
                await store?.createNew({ partialRecord: getDefaultRow?.() });
              }}
              data-testid="add-new-button"
            >
              <PlusIcon className="h-4 w-4" />
              {addNewButtonText}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await store?.save();
                } catch (error) {
                  showError(`Unexpected error while saving data: ${getErrorMessage(error)}`);
                  clientLogger.error({ message: 'save error', error });
                } finally {
                  setIsSaving(false);
                }
              }}
              data-testid="save-changes-button"
            >
              <SaveAll className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                try {
                  const id = store?.currentRowId();
                  if (id) {
                    if (store.isCurrentRowFromDB()) {
                      store?.deleteRow(id);
                      store?.save();
                    } else {
                      store?.deleteRow(id);
                    }
                  }
                } catch (error) {
                  showError(`Unexpected error while deleting data: ${getErrorMessage(error)}`);
                  clientLogger.error({ message: 'delete error', error });
                }
              }}
              data-testid="delete-record-button"
            >
              <Trash className="h-4 w-4" />
              {'Delete record'}
            </Button>
            {headerEndContent}
          </div>
        )
      }
      filterSection={
        <div className="flex flex-1 shrink-0 items-center gap-2">
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
              />
            </Suspense>
          )}
          {!hideColumnsMenu && <ColumnViewsDialog table={table as unknown as Table<object>} variant="ghost" />}
          {filterEndContent}
        </div>
      }
      mainSection={
        <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          <ResizablePanel
            defaultSize={`${100 - editFormProportion}%`}
            minSize="35%"
            className="relative overflow-hidden"
          >
            <MainSection
              table={table}
              hidePagination={hidePagination}
              store={store}
              editForm={editForm}
              smartSearchColumns={smartSearchColumns}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={`${editFormProportion}%`} minSize="40%" className="overflow-hidden">
            {editForm && (
              <EditRecordForm<T> title={title} store={store}>
                {editForm}
              </EditRecordForm>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    />
  );
}

function MainSection<T extends object>({
  table,
  hidePagination,
  store,
  editForm,
  smartSearchColumns,
}: {
  table: Table<T>;
  hidePagination: boolean;
  store: Store<T>;
  editForm?: React.ReactNode;
  smartSearchColumns: Column<T>[];
}) {
  const onRowClick = () => {};

  return (
    <Suspense fallback={<Suspended name="MainSection" />}>
      <div className="flex h-full w-full flex-col">
        <div className="relative flex-1 rounded-md">
          <DataTable
            table={table}
            onRowClick={editForm ? onRowClick : undefined}
            store={store}
            smartSearchColumns={smartSearchColumns}
          />
        </div>
        {!hidePagination && <PaginationSection table={table} store={store} />}
      </div>
    </Suspense>
  );
}
