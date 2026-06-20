/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { LookupTypes } from '@/lib/common/ds/types/core/LookupTypes';
import { useStore } from '@/lib/core/client/store';

export function useLookupTypesStore() {
  return useStore<LookupTypes>({
    datasourceId: 'LookupTypes',
    page: 'lookups-page',
    alias: 'lookup-types-all',
    limit: 1000,
    includeCount: true,
    autoQuery: true,
    sort: {
      code: 1,
    },
  });
}
