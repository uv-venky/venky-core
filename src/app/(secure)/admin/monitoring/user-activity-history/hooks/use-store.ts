/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { UserActivityArchive } from '@/lib/common/ds/types/core/UserActivityArchive';
import { useStore } from '@/lib/core/client/store';

export function useUserActivityHistoryStore() {
  return useStore<UserActivityArchive>({
    datasourceId: 'UserActivityArchive',
    page: 'user-activity-history-page',
    alias: 'user-activity-history-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { activityDate: -1 },
  });
}
