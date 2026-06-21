/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import HeaderCell from '../../../../../../components/core/table/header-cell';
import { CodeCell, CompoundCell, EntityNameCell } from '../../../../../../components/core/table/styled-cells';
import { useMemo } from 'react';
import { EditableDateCell } from '../../../../../../components/core/table/editable-table-cells';
import { Shield, User } from 'lucide-react';
export default function useUserRolesTableColumns(store, { roleCode, userName }) {
  return useMemo(() => {
    const columns = [];
    if (!userName) {
      columns.push({
        accessorKey: 'userName',
        meta: {
          label: 'User',
        },
        size: 280,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'userName', title: 'User' });
        },
        cell: (props) =>
          _jsx(CompoundCell, {
            primary: 'displayName',
            secondary: 'email',
            icon: _jsx(User, { className: 'size-3.5' }),
            iconBgClass: 'bg-blue-500/10',
            iconClass: 'text-blue-600 dark:text-blue-400',
            ...props,
          }),
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
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'roleName', title: 'Role' });
        },
        cell: (props) =>
          _jsx(EntityNameCell, {
            attributeCode: 'roleName',
            icon: _jsx(Shield, { className: 'size-3.5' }),
            iconBgClass: 'bg-violet-500/10',
            iconClass: 'text-violet-600 dark:text-violet-400',
            ...props,
          }),
      });
      columns.push({
        accessorKey: 'roleCode',
        meta: {
          label: 'Role Code',
        },
        size: 160,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Text',
            store: store,
            accessorKey: 'roleCode',
            title: 'Role Code',
          });
        },
        cell: (props) => _jsx(CodeCell, { attributeCode: 'roleCode', ...props }),
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
          return _jsx(HeaderCell, {
            ...props,
            type: 'Date',
            store: store,
            accessorKey: 'startDate',
            title: 'Start Date',
          });
        },
        cell: (props) => _jsx(EditableDateCell, { attributeCode: 'startDate', ...props, store: store }),
      },
      {
        accessorKey: 'endDate',
        meta: {
          label: 'End Date',
        },
        size: 140,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'endDate', title: 'End Date' });
        },
        cell: (props) => _jsx(EditableDateCell, { attributeCode: 'endDate', ...props, store: store }),
      },
    );
    return columns;
  }, [store, roleCode, userName]);
}
//# sourceMappingURL=table-columns.js.map
