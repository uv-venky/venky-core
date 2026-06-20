'use client';

import { useUserListStore } from './use-store';
import useUsersLOVTableColumns from './table-columns';
import useUsersLOVSmartSearchColumns from './smart-search-columns';
import LOVDialog from '@/components/core/lov';
import { usePreQuery } from '@/components/core/hooks/useStoreHooks';
import { useEffect } from 'react';
import type { UserList } from '@/lib/common/ds/types/core/UserList';
import type { Row } from '@/lib/core/common/ds/types/filter';

export type UsersLOVProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (values: string[], rows: readonly Row<UserList>[]) => void;
  roleCode: string;
};

export default function UsersLOV({ open, onOpenChange, onSelect, roleCode }: UsersLOVProps) {
  const store = useUserListStore();
  const tableColumns = useUsersLOVTableColumns(store);
  const smartSearchColumns = useUsersLOVSmartSearchColumns();

  usePreQuery(store, (query) => {
    query.match = {
      roleCode,
    };
    query.sort = query.sort ?? {
      userName: 1,
    };
    return query;
  });

  useEffect(() => {
    store.clearSync();
    store.executeQuery({
      query: {
        match: {
          roleCode,
        },
      },
    });
  }, [roleCode, store]);

  return (
    <LOVDialog
      open={open}
      onOpenChange={onOpenChange}
      store={store}
      tableColumns={tableColumns}
      smartSearchColumns={smartSearchColumns}
      onSelect={onSelect}
      title="Select Users"
      width={1100}
      height={650}
      modal={false}
    />
  );
}
