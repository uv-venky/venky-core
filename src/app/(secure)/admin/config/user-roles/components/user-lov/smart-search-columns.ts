/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column } from '@/components/core/smart-search/types';
import { useMemo } from 'react';
import type { UserList } from '@/lib/common/ds/types/core/UserList';

export default function useUsersLOVSmartSearchColumns(): Column<UserList>[] {
  return useMemo(() => {
    const columns: Column<UserList>[] = [
      {
        key: 'displayName',
        label: 'Display Name',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'userName',
        label: 'User Name',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'startDate',
        label: 'Start Date',
        type: 'Date',
        defaultOperator: 'on',
      },
      {
        key: 'endDate',
        label: 'End Date',
        type: 'Date',
        defaultOperator: 'on',
      },
      {
        key: 'locationName',
        label: 'Location Name',
        type: 'Text',
        defaultOperator: 'is',
      },
    ];
    return columns;
  }, []);
}
