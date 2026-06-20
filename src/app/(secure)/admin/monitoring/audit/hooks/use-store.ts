/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Audit } from '@/lib/common/ds/types/core/Audit';
import { useStore } from '@/lib/core/client/store';

export function useAuditStore() {
  return useStore<Audit>({
    datasourceId: 'Audit',
    page: 'audit-monitor-page',
    alias: 'audit-monitor',
    limit: 50,
    includeCount: true,
    autoQuery: true,
    sort: { auditId: -1 },
  });
}
