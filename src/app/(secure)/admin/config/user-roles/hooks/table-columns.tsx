/* Copyright (c) 2024-present Venky Corp. */

'use client';

import HeaderCell from '@/components/core/table/header-cell';
import { CodeCell, CompoundCell, EntityNameCell } from '@/components/core/table/styled-cells';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { EditableDateCell } from '@/components/core/table/editable-table-cells';
import { Shield, User } from 'lucide-react';

export default function useUserRolesTableColumns(
  store: Store<UserRoles>,
  {
    roleCode,
    userName,
  }: {
    roleCode?: string;
    userName?: string;
  },
): AccessorKeyColumnDef<UserRoles>[] {
  return useMemo(() => {
    const columns: AccessorKeyColumnDef<UserRoles>[] = [];
    if (!userName) {
      columns.push({
        accessorKey: 'userName',
        meta: {
          label: 'User',
        },
        size: 280,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="userName" title="User" />;
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
      });
    }
    if (!roleCode) {
      columns.push({
        accessorKey: 'roleName',
        meta: {
          label: 'Role',
        },
        size: 240,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="roleName" title="Role" />;
        },
        cell: (props) => (
          <EntityNameCell
            attributeCode="roleName"
            icon={<Shield className="size-3.5" />}
            iconBgClass="bg-violet-500/10"
            iconClass="text-violet-600 dark:text-violet-400"
            {...props}
          />
        ),
      });
      columns.push({
        accessorKey: 'roleCode',
        meta: {
          label: 'Role Code',
        },
        size: 160,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="roleCode" title="Role Code" />;
        },
        cell: (props) => <CodeCell attributeCode="roleCode" {...props} />,
      });
    }

    columns.push(
      {
        accessorKey: 'startDate',
        meta: {
          label: 'Start Date',
        },
        size: 140,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="startDate" title="Start Date" />;
        },
        cell: (props) => <EditableDateCell attributeCode="startDate" {...props} store={store} />,
      },
      {
        accessorKey: 'endDate',
        meta: {
          label: 'End Date',
        },
        size: 140,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="endDate" title="End Date" />;
        },
        cell: (props) => <EditableDateCell attributeCode="endDate" {...props} store={store} />,
      },
    );
    return columns;
  }, [store, roleCode, userName]);
}
