/* Copyright (c) 2024-present Venky Corp. */

import { format } from 'date-fns';

export function formatExportMetadata({
  datasourceId,
  exportedAt,
  exportedBy,
  filters,
}: {
  datasourceId: string;
  exportedAt: Date;
  exportedBy: string;
  filters?: unknown[];
}) {
  const filtersStr = !filters || filters.length === 0 ? 'None' : JSON.stringify(filters);
  return [
    `Datasource: ${datasourceId}`,
    `Exported At: ${format(exportedAt, 'yyyy-MM-dd HH:mm:ss')}`,
    `Exported By: ${exportedBy}`,
    `Filters: ${filtersStr}`,
  ];
}
