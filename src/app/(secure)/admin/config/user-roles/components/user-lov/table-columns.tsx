/* Copyright (c) 2024-present Venky Corp. */

'use client';

import HeaderCell from '@/components/core/table/header-cell';
import TableCell from '@/components/core/table/table-cell';
import { CompoundCell } from '@/components/core/table/styled-cells';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { UserList } from '@/lib/common/ds/types/core/UserList';
import { MapPin, User } from 'lucide-react';

export default function useUsersLOVTableColumns(store: Store<UserList>): AccessorKeyColumnDef<UserList>[] {
  return useMemo(() => {
    const columns: AccessorKeyColumnDef<UserList>[] = [
      {
        accessorKey: 'displayName',
        meta: {
          label: 'User',
        },
        size: 280,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="displayName" title="User" />;
        },
        cell: (props) => (
          <CompoundCell
            primary="displayName"
            secondary="email"
            icon={<User className="size-3.5" />}
            iconBgClass="bg-blue-500/10"
            iconClass="text-blue-600 dark:text-blue-400"
            {...props}
          />
        ),
      },
      {
        accessorKey: 'locationName',
        meta: {
          label: 'Location',
        },
        size: 200,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="locationName" title="Location" />;
        },
        cell: (props) => (
          <CompoundCell
            primary="locationName"
            icon={<MapPin className="size-3.5" />}
            iconBgClass="bg-emerald-500/10"
            iconClass="text-emerald-600 dark:text-emerald-400"
            {...props}
          />
        ),
      },
      {
        accessorKey: 'endDate',
        meta: {
          label: 'End Date',
        },
        size: 110,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="endDate" title="End Date" />;
        },
        cell: (props) => <TableCell type="Date" attributeCode="endDate" {...props} />,
      },
    ];
    return columns;
  }, [store]);
}
