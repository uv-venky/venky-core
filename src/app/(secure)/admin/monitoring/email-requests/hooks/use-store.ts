/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { EmailRequests } from '@/lib/common/ds/types/core/EmailRequests';
import { useStore } from '@/lib/core/client/store';

export function useEmailRequestsStore() {
  return useStore<EmailRequests>({
    datasourceId: 'EmailRequests',
    page: 'email-requests-page',
    alias: 'email-requests-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: { requestId: -1 },
  });
}
