/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useAuditStore() {
    return useStore({
        datasourceId: 'Audit',
        page: 'audit-monitor-page',
        alias: 'audit-monitor',
        limit: 50,
        includeCount: true,
        autoQuery: true,
        sort: { auditId: -1 },
    });
}
//# sourceMappingURL=use-store.js.map