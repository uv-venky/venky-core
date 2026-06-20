/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { LookupValues } from '@/lib/common/ds/types/core/LookupValues';
import { useStore } from '@/lib/core/client/store';

export function useLookupValuesStore() {
  return useStore<LookupValues>({
    datasourceId: 'LookupValues',
    page: 'lookups-page',
    alias: 'lookup-values-all',
    limit: 1000,
    includeCount: true,
    autoQuery: false,
    sort: {
      displayOrder: 1,
      label: 1,
    },
  });
}
