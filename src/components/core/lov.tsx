'use client';

import { useEffect } from 'react';

import type { Column } from '@/components/core/smart-search/types';
import DataTable from '@/components/core/page/table';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import useTable from '@/components/core/page/useTable';
import { rowSelectionColumnDef } from '@/components/core/table/table-cell';
import type { Row } from '@/lib/core/common/ds/types/filter';
import { PaginationSection } from '@/components/core/page/page-layout-template';
import { Popup } from '@/components/core/page/popup';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Filters from '@/components/core/page/filters';
import { useSelectedRowIds } from '@/components/core/hooks/useStoreHooks';

export type LOVDialogProps<T extends object> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: Store<T>;
  tableColumns: AccessorKeyColumnDef<T>[];
  smartSearchColumns: Column<T>[];
  onSelect: (values: string[], rows: readonly Row<T>[]) => void;
  title?: string;
  contentClassName?: string;
  width?: number;
  height?: number;
  singleSelection?: boolean;
  modal?: boolean;
};

export default function LOVDialog<T extends object>({
  open,
  onOpenChange,
  store,
  tableColumns,
  smartSearchColumns,
  onSelect,
  title = 'Select Values',
  contentClassName,
  width = 800,
  height = 600,
  singleSelection = false,
  modal = true,
}: LOVDialogProps<T>) {
  const table = useTable<T>({
    store,
    tableColumns: [
      rowSelectionColumnDef({
        hideHeader: singleSelection,
      }),
      ...tableColumns,
    ],
  });

  const selectedIds = useSelectedRowIds(store);

  useEffect(() => {
    if (!open) {
      store.deSelectAll();
    }
    return () => {
      store.deSelectAll();
    };
  }, [store, open]);

  // Enforce single selection when enabled
  useEffect(() => {
    if (!singleSelection || !open) {
      return;
    }

    if (selectedIds.length > 1) {
      // Keep only the first selected row, deselect the rest
      selectedIds.slice(1).forEach((id) => {
        store.deSelectRow(id);
      });
    }
  }, [selectedIds, singleSelection, open, store]);

  const handleRowClick = (row: any) => {
    if (singleSelection) {
      // Deselect all other rows first, then select the clicked row
      const selectedIds = store.selectedRowIds();
      selectedIds.forEach((id) => {
        if (id !== row.id) {
          store.deSelectRow(id);
        }
      });
      if (!row.getIsSelected()) {
        row.toggleSelected();
      }
    } else {
      row.toggleSelected();
    }
  };

  return (
    open && (
      <Popup
        onClose={() => onOpenChange(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const selected = store.selectedRowIds();
                const rows = store.selectedRows();
                onSelect(selected, rows);
                onOpenChange(false);
              }}
            >
              Select
            </Button>
          </>
        }
        title={title}
        width={width}
        height={height}
        contentClassName={cn('p-0', contentClassName)}
        bodyClassName="p-0"
        modal={modal}
      >
        <div className="relative h-full flex-1 flex-col overflow-hidden">
          <div className="px-2 pb-2">
            <Filters
              border="full"
              roundedCorners
              store={store}
              table={table}
              columns={smartSearchColumns}
              pageId="lov-dialog"
              itemId="lov-dialog-filters"
            />
          </div>
          <div className="relative flex h-[calc(100%-56px)] flex-1 rounded-md">
            <DataTable
              table={table}
              store={store}
              onRowClick={handleRowClick}
              smartSearchColumns={smartSearchColumns}
            />
          </div>
          <PaginationSection table={table} store={store} />
        </div>
      </Popup>
    )
  );
}
