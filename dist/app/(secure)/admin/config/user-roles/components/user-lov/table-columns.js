/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import HeaderCell from '../../../../../../../components/core/table/header-cell';
import TableCell from '../../../../../../../components/core/table/table-cell';
import { CompoundCell } from '../../../../../../../components/core/table/styled-cells';
import { useMemo } from 'react';
import { MapPin, User } from 'lucide-react';
export default function useUsersLOVTableColumns(store) {
  return useMemo(() => {
    const columns = [
      {
        accessorKey: 'displayName',
        meta: {
          label: 'User',
        },
        size: 280,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'displayName', title: 'User' });
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
      },
      {
        accessorKey: 'locationName',
        meta: {
          label: 'Location',
        },
        size: 200,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Text',
            store: store,
            accessorKey: 'locationName',
            title: 'Location',
          });
        },
        cell: (props) =>
          _jsx(CompoundCell, {
            primary: 'locationName',
            icon: _jsx(MapPin, { className: 'size-3.5' }),
            iconBgClass: 'bg-emerald-500/10',
            iconClass: 'text-emerald-600 dark:text-emerald-400',
            ...props,
          }),
      },
      {
        accessorKey: 'endDate',
        meta: {
          label: 'End Date',
        },
        size: 110,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'endDate', title: 'End Date' });
        },
        cell: (props) => _jsx(TableCell, { type: 'Date', attributeCode: 'endDate', ...props }),
      },
    ];
    return columns;
  }, [store]);
}
//# sourceMappingURL=table-columns.js.map
