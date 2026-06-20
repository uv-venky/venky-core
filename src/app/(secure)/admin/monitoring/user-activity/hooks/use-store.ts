/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { UserActivity } from '@/lib/common/ds/types/core/UserActivity';
import { useStore } from '@/lib/core/client/store';

export function useUserActivityStore() {
  return useStore<UserActivity>({
    datasourceId: 'UserActivity',
    page: 'user-activity-page',
    alias: 'user-activity-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { activityId: -1 },
  });
}
