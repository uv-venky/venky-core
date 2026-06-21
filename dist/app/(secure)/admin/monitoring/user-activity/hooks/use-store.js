/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useUserActivityStore() {
    return useStore({
        datasourceId: 'UserActivity',
        page: 'user-activity-page',
        alias: 'user-activity-all',
        limit: 20,
        includeCount: true,
        autoQuery: true,
        sort: { activityId: -1 },
    });
}
//# sourceMappingURL=use-store.js.map