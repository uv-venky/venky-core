/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useLookupTypesStore() {
    return useStore({
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
//# sourceMappingURL=use-lookup-types-store.js.map