import type { Table, AccessorKeyColumnDef } from '@tanstack/react-table';
import type { Store } from '@/lib/core/common/types/Store';
import type { Query, StringKeyof } from '@/lib/core/common/ds/types/filter';
import clientLogger from '@/lib/core/client/client-logger';
import { showError } from '../common';

export function getExportableColumns<T extends object>(
  store: Store<T>,
  table: Table<T>,
): { code: string; label: string }[] {
  return table
    .getVisibleLeafColumns()
    .filter((column) => {
      const accessorKey = (column.columnDef as AccessorKeyColumnDef<T>).accessorKey;
      if (typeof accessorKey !== 'string' || accessorKey.length === 0) {
        return false;
      }

      const attribute = store.getAttribute(accessorKey as StringKeyof<T>);
      if (!attribute) {
        // UI-only columns (e.g. "spacer") should not be exported since the server
        // export endpoint builds SQL SELECT from DataSource attributes.
        return false;
      }

      return attribute.export !== false;
    })
    .map((c) => ({
      code: String((c.columnDef as AccessorKeyColumnDef<T>).accessorKey),
      label: (c.columnDef as { meta?: { label?: string } }).meta?.label ?? String(c.id),
    }));
}

export async function exportStoreToCsv<T extends object>({
  store,
  table,
  filename,
  includeMetadata,
}: {
  store: Store<T>;
  table: Table<T>;
  filename: string;
  includeMetadata?: boolean;
}) {
  const query = { ...(store.getPreviousQuery() ?? {}) } as Query<T>;
  query.sort = store.getSort();
  query.limit = undefined;
  query.offset = undefined;
  const smartFilters = store.smartSearchFilters?.() ?? [];
  const headerFilters = store.headerFilters?.() ?? [];
  if (smartFilters.length) {
    query.filters = [...(query.filters ?? []), ...smartFilters];
  }
  if (headerFilters.length) {
    query.filters = [...(query.filters ?? []), ...headerFilters];
  }
  const columns = getExportableColumns(store, table);
  if (columns.length === 0) {
    showError('No columns to export');
    return;
  }
  const res = await fetch('/api/export-ds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      datasourceId: store.datasourceId,
      query,
      columns,
      ...(includeMetadata && { includeMetadata: true }),
    }),
  });
  if (!res.ok) {
    clientLogger.error({
      message: 'CSV export failed',
      error: await res.text(),
    });
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
