/* Copyright (c) 2024-present Venky Corp. */

'use client';

import HeaderCell from '@/components/core/table/header-cell';
import TableCell, { Cell } from '@/components/core/table/table-cell';
import { BooleanYesNoCell, CompoundCell } from '@/components/core/table/styled-cells';
import { createActionsColumn } from '@/components/core/table/actions-column-def';
import type { TableAction } from '@/components/core/table/actions-column';
import type { Users } from '@/lib/common/ds/types/core/Users';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, CellContext } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Copy, MapPin, Pencil, Shield, User } from 'lucide-react';
import { AssignRolesDialog } from '@/app/(secure)/admin/config/users/components/AssignRolesButton';
import { CopyRolesFromUserDialog } from '@/app/(secure)/admin/config/users/components/CopyRolesFromUserDialog';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { UserSettings } from '@/lib/core/common/types/UserSettings';
import { Moon, Sun } from 'lucide-react';

export default function useUsersTableColumns(store: Store<Users>): AccessorKeyColumnDef<Users>[] {
  return useMemo(() => {
    const actions: TableAction[] = [
      {
        label: 'Edit',
        icon: <Pencil className="size-4" />,
        onClick: ({ rowId, table }) => {
          table.options.meta?.onEdit?.(rowId);
        },
      },
      {
        label: 'Assign Roles',
        icon: <Shield className="size-4" />,
        dialog: ({ rowId, onClose }) => {
          return <AssignRolesDialog rowId={rowId} onClose={onClose} />;
        },
      },
      {
        label: 'Copy Roles from User',
        icon: <Copy className="size-4" />,
        dialog: ({ rowId, onClose }) => {
          return <CopyRolesFromUserDialog rowId={rowId} onClose={onClose} />;
        },
      },
    ];

    const columns: AccessorKeyColumnDef<Users>[] = [
      {
        accessorKey: 'userName',
        meta: {
          label: 'User',
          sticky: 'left',
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
            useTableOnEdit
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
        accessorKey: 'locked',
        meta: {
          label: 'Locked',
        },
        size: 90,
        header: (props) => {
          return <HeaderCell {...props} type="Boolean" store={store} accessorKey="locked" title="Locked" />;
        },
        cell: (props) => <BooleanYesNoCell attributeCode="locked" checkedAsNegative {...props} />,
      },
      {
        accessorKey: 'startDate',
        meta: {
          label: 'Start Date',
        },
        size: 110,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="startDate" title="Start Date" />;
        },
        cell: (props) => <TableCell type="Date" attributeCode="startDate" {...props} />,
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
      {
        accessorKey: 'settings.theme',
        meta: {
          label: 'Theme',
        },
        size: 200,
        header: (props) => {
          return (
            <HeaderCell
              {...props}
              type="Text"
              store={store}
              accessorKey="settings.theme"
              title="Theme"
              className="justify-center"
            />
          );
        },
        cell: (props) => <SettingsCell {...props} attr="theme" store={store} />,
      },
      createActionsColumn(actions, { size: 80, title: 'Actions' }),
    ];
    return columns;
  }, [store]);
}

function SettingsCell({
  attr,
  store,
  row,
}: {
  attr: StringKeyof<UserSettings>;
  store: Store<Users>;
} & CellContext<any, unknown>) {
  const settings = useRowValue(store, row.id, 'settings') ?? ({} as UserSettings);
  const value = settings[attr];

  return (
    <Cell
      dataTip={value as string}
      attributeCode={`settings.${attr}` as StringKeyof<Users>}
      store={store}
      rowId={row.id}
      className="justify-center"
    >
      <span className="flex items-center gap-2">
        {value === 'dark' ? <Moon className="size-3.5 text-gray-500" /> : <Sun className="size-3.5 text-gray-500" />}
      </span>
    </Cell>
  );
}
