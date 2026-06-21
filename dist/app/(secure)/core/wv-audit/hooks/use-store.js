'use client';
import { useStore } from '../../../../../lib/core/client/store';
export function useWVAuditStore() {
  return useStore({
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
//# sourceMappingURL=use-store.js.map
