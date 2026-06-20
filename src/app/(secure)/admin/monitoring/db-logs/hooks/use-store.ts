/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Logs } from '@/lib/common/ds/types/core/Logs';
import { useStore } from '@/lib/core/client/store';

export function useLogsStore() {
  return useStore<Logs>({
    datasourceId: 'Logs',
    page: 'logs-page',
    alias: 'logs-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { logId: -1 },
  });
}
