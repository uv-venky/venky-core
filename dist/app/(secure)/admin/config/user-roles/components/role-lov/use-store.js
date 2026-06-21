/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../../lib/core/client/store';
export function useRoleListStore() {
    return useStore({
        datasourceId: 'Roles',
        page: 'role-list-page',
        alias: 'role-list',
        limit: 20,
        includeCount: true,
    });
}
//# sourceMappingURL=use-store.js.map