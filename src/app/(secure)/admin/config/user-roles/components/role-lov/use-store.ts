/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Roles } from '@/lib/common/ds/types/core/Roles';
import { useStore } from '@/lib/core/client/store';

export function useRoleListStore() {
  return useStore<Roles>({
    datasourceId: 'Roles',
    page: 'role-list-page',
    alias: 'role-list',
    limit: 20,
    includeCount: true,
  });
}
