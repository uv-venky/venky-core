/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useRoleListStore } from './use-store';
import LOVCombobox from '@/components/core/lov-combobox';
import type { Roles } from '@/lib/common/ds/types/core/Roles';
import type { Row } from '@/lib/core/common/ds/types/filter';
import type { Query, DBRow } from '@/lib/core/common/ds/types/filter';

export type RolesLOVComboboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (values: string[], rows: readonly Row<Roles>[]) => void;
  userName: string;
  value?: string[];
  trigger?: React.ReactNode;
};

export default function RolesLOVCombobox({
  open,
  onOpenChange,
  onSelect,
  userName,
  value,
  trigger,
}: RolesLOVComboboxProps) {
  const store = useRoleListStore();

  const fetchRoles = async (filter: string): Promise<Roles[]> => {
    const query: Query<Roles> = {
      limit: 50,
      offset: 0,
      sort: {
        roleCode: 1,
      },
      match: {
        userName,
      },
    };

    // Add text search filter if provided
    if (filter && filter.length >= 2) {
      query.filters = [
        {
          anyof: [
            {
              roleName: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
            {
              roleCode: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
            {
              description: {
                like: `%${filter}%`,
                ignoreCase: true,
              },
            },
          ],
        },
      ];
    }

    let roles: DBRow<Roles>[] = [];
    await store.executeQuery({
      query,
      handleResponse: (rows) => {
        roles = rows;
      },
      force: true,
    });
    return roles;
  };

  const getOptionsForValue = async (values: string[]): Promise<Roles[]> => {
    if (values.length === 0) return [];
    const query: Query<Roles> = {
      limit: values.length,
      offset: 0,
      filters: [
        {
          roleCode: {
            in: values,
          },
        },
      ],
    };

    let roles: DBRow<Roles>[] = [];
    await store.executeQuery({
      query,
      handleResponse: (rows) => {
        roles = rows;
      },
      noClear: true,
    });
    return roles;
  };

  return (
    <LOVCombobox<Roles>
      open={open}
      onOpenChange={onOpenChange}
      store={store}
      onSelect={onSelect}
      title="Select Roles"
      placeholder="Select roles..."
      searchPlaceholder="Search roles by name, code, or description..."
      getLabel={(role) => `${role.roleName} (${role.roleCode})`}
      getValue={(role) => role.roleCode}
      getOptions={fetchRoles}
      getOptionsForValue={getOptionsForValue}
      minSearchLength={0}
      value={value}
      trigger={trigger}
    />
  );
}
