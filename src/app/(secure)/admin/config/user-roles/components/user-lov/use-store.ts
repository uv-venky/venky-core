/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { UserList } from '@/lib/common/ds/types/core/UserList';
import { useStore } from '@/lib/core/client/store';

export function useUserListStore() {
  return useStore<UserList>({
    datasourceId: 'UserList',
    page: 'user-list-page',
    alias: 'user-list',
    limit: 20,
    includeCount: true,
    // onInitialized: async (store) => {
    //   // if the autoQuery is false, we need to set the loading to false manually if the
    //   // store is not programmatically loading any data
    //   // otherwise, the table will show loading state even until the first query is fired
    //   store.setIsLoading(false);
    // },
  });
}
