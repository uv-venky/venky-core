/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import { useStore } from '@/lib/core/client/store';

export function useUserRolesStore(alias: string) {
  return useStore<UserRoles>({
    datasourceId: 'UserRoles',
    page: 'user-roles-page',
    alias,
    limit: 20,
    includeCount: true,
    autoQuery: false,
  });
}
