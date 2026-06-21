/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useStore } from '../../../../../../lib/core/client/store';
export function useUsersStore() {
  return useStore({
    datasourceId: 'Users',
    page: 'users-page',
    alias: 'users-all',
    limit: 20,
    includeCount: true,
    autoQuery: true,
    sort: {
      userName: 1,
    },
    // onInitialized: async (store) => {
    //   // if the autoQuery is false, we need to set the loading to false manually if the
    //   // store is not programmatically loading any data
    //   // otherwise, the table will show loading state even until the first query is fired
    //   store.setIsLoading(false);
    // },
  });
}
//# sourceMappingURL=use-store.js.map
