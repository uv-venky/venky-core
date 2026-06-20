'use client';

import type { Audit } from '@/lib/common/ds/types/core/Audit';
import { useStore } from '@/lib/core/client/store';

export function useWVAuditStore() {
  return useStore<Audit>({
    datasourceId: 'Audit',
    page: 'wv-audit-page',
    alias: 'wv-audit-all',
    limit: 20,
    includeCount: true,
    autoQuery: false,
    onInitialized: async (store) => {
      store.setIsLoading(false);
    },
  });
}
