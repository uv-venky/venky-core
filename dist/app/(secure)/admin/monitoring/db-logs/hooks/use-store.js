/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useLogsStore() {
  return useStore({
    datasourceId: 'Logs',
    page: 'logs-page',
    alias: 'logs-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { logId: -1 },
  });
}
//# sourceMappingURL=use-store.js.map
