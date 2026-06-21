/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useAppsStore() {
    return useStore({
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
//# sourceMappingURL=use-apps-store.js.map