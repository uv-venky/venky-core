/* Copyright (c) 2024-present Venky Corp. */

'use client';
import useTable from '@/components/core/page/useTable';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import { useEffect } from 'react';
import { UserRolesFilterBar } from './filter-bar';
import { UserRolesTable } from './table';
import useUserRolesTableColumns from '../hooks/table-columns';
import { Card } from '@/components/ui/card';
import { usePreQuery } from '@/components/core/hooks/useStoreHooks';
import type { Store } from '@/lib/core/common/types/Store';

export default function UserRolesTableWithSearch({
  roleCode,
  userName,
  store,
}: {
  store: Store<UserRoles>;
  roleCode?: string;
  userName?: string;
}) {
  const tableColumns = useUserRolesTableColumns(store, { roleCode, userName });
  const table = useTable<UserRoles>({
    store,
    tableColumns,
  });

  // always add roleCode and userName to the query
  usePreQuery(store, (query) => {
    query.match = {
      roleCode,
      userName,
    };
    return query;
  });

  useEffect(() => {
    store.clearSync();
    store.executeQuery({
      query: {
        match: {
          // just to use the dependency... these are always added to the query by usePreQuery
          // irrespective of where the executeQuery is called from e.g. from the filter bar or from the table
          roleCode,
          userName,
        },
      },
    });
  }, [store, roleCode, userName]);

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <UserRolesFilterBar
        store={store}
        table={table}
        pageId="user-roles-page"
        itemId="user-roles"
        roleCode={roleCode}
        userName={userName}
      />
      <Card className="flex-1 overflow-hidden p-0">
        <UserRolesTable store={store} table={table} />
      </Card>
    </div>
  );
}
