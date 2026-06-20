/* Copyright (c) 2024-present Venky Corp. */

'use client';

import HeaderCell from '@/components/core/table/header-cell';
import TableCell from '@/components/core/table/table-cell';
import type { UserActivityArchive } from '@/lib/common/ds/types/core/UserActivityArchive';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export default function useUserActivityHistoryTableColumns(
  store: Store<UserActivityArchive>,
): AccessorKeyColumnDef<UserActivityArchive>[] {
  return useMemo(() => {
    const columns: AccessorKeyColumnDef<UserActivityArchive>[] = [
      {
        accessorKey: 'activityDate',
        meta: {
          label: 'Date',
        },
        size: 110,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="activityDate" title="Date" />;
        },
        cell: (props) => <TableCell type="Date" dateFormat="M/d/yyyy" attributeCode="activityDate" {...props} />,
      },
      {
        accessorKey: 'userName',
        meta: {
          label: 'User Name',
        },
        size: 160,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="userName" title="User Name" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="userName" {...props} />,
      },
      {
        accessorKey: 'eventType',
        meta: {
          label: 'Event Type',
        },
        size: 160,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="eventType" title="Event Type" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="eventType" {...props} />,
      },
      {
        accessorKey: 'pageUrl',
        meta: {
          label: 'Page Url',
        },
        size: 400,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="pageUrl" title="Page Url" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="pageUrl" {...props} />,
      },
      {
        accessorKey: 'activityCount',
        meta: {
          label: 'Count',
        },
        size: 90,
        header: (props) => {
          return <HeaderCell {...props} type="Number" store={store} accessorKey="activityCount" title="Count" />;
        },
        cell: (props) => <TableCell type="Number" attributeCode="activityCount" {...props} />,
      },
      {
        accessorKey: 'spacer',
        meta: {
          label: '-',
        },
        size: 5,
        enableHiding: false,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="spacer" title="" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="spacer" {...props} />,
      },
    ];
    return columns;
  }, [store]);
}
