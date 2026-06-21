/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useUserActivityHistoryStore() {
  return useStore({
    datasourceId: 'UserActivityArchive',
    page: 'user-activity-history-page',
    alias: 'user-activity-history-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { activityDate: -1 },
  });
}
//# sourceMappingURL=use-store.js.map
