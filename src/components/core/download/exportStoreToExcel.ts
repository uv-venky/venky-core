/* Copyright (c) 2024-present Venky Corp. */

import type { Table } from '@tanstack/react-table';
import type { Store } from '@/lib/core/common/types/Store';
import type { Query } from '@/lib/core/common/ds/types/filter';
import clientLogger from '@/lib/core/client/client-logger';
import { showError } from '../common';
import { getExportableColumns } from './exportStoreToCsv';

export async function exportStoreToExcel<T extends object>({
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
      format: 'xlsx',
      ...(includeMetadata && { includeMetadata: true }),
    }),
  });
  if (!res.ok) {
    clientLogger.error({
      message: 'Excel export failed',
      error: await res.text(),
    });
    showError('Export failed');
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
