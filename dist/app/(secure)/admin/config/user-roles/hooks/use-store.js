/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useUserRolesStore(alias) {
  return useStore({
    datasourceId: 'UserRoles',
    page: 'user-roles-page',
    alias,
    limit: 20,
    includeCount: true,
    autoQuery: false,
  });
}
//# sourceMappingURL=use-store.js.map
