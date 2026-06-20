/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Apps } from '@/lib/common/ds/types/core/Apps';
import { useStore } from '@/lib/core/client/store';

export function useAppsStore() {
  return useStore<Apps>({
    datasourceId: 'Apps',
    page: 'apps-page',
    alias: 'apps-all',
    limit: 100,
    includeCount: true,
    autoQuery: true,
    sort: {
      name: 1,
    },
  });
}
