/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useUserListStore } from './use-store';
import LOVCombobox from '@/components/core/lov-combobox';
import type { UserList } from '@/lib/common/ds/types/core/UserList';
import type { Row } from '@/lib/core/common/ds/types/filter';
import type { Query, DBRow } from '@/lib/core/common/ds/types/filter';

export type UsersLOVComboboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (values: string[], rows: readonly Row<UserList>[]) => void;
  roleCode: string;
  value?: string[];
  trigger?: React.ReactNode;
};

export default function UsersLOVCombobox({
  open,
  onOpenChange,
  onSelect,
  roleCode,
  value,
  trigger,
}: UsersLOVComboboxProps) {
  const store = useUserListStore();

  const fetchUsers = async (filter: string): Promise<UserList[]> => {
    const query: Query<UserList> = {
      limit: 50,
      offset: 0,
      sort: {
        userName: 1,
      },
      match: {
        roleCode,
      },
    };

    // Add text search filter if provided
    if (filter && filter.length >= 2) {
      query.filters = [
        {
          anyof: [
            {
              userName: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
            {
              displayName: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
            {
              email: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
          ],
        },
      ];
    }

    let users: DBRow<UserList>[] = [];
    await store.executeQuery({
      query,
      handleResponse: (rows) => {
        users = rows;
      },
      noClear: true,
    });
    return users;
  };

  const getOptionsForValue = async (values: string[]): Promise<UserList[]> => {
    if (values.length === 0) return [];
    const query: Query<UserList> = {
      limit: values.length,
      offset: 0,
      filters: [
        {
          userName: {
            in: values,
          },
        },
      ],
    };

    let users: DBRow<UserList>[] = [];
    await store.executeQuery({
      query,
      handleResponse: (rows) => {
        users = rows;
      },
      force: true,
    });
    return users;
  };

  return (
    <LOVCombobox<UserList>
      open={open}
      onOpenChange={onOpenChange}
      store={store}
      onSelect={onSelect}
      title="Select Users"
      placeholder="Select users..."
      searchPlaceholder="Search users by name, username, or email..."
      getLabel={(user) => `${user.displayName} (${user.userName})`}
      getValue={(user) => user.userName}
      getOptions={fetchUsers}
      getOptionsForValue={getOptionsForValue}
      minSearchLength={0}
      value={value}
      trigger={trigger}
    />
  );
}
