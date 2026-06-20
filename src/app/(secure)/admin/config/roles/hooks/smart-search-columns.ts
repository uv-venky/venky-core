/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column } from '@/components/core/smart-search/types';
import type { Roles } from '@/lib/common/ds/types/core/Roles';
import { useMemo } from 'react';

export default function useSmartSearchColumns(): Column<Roles>[] {
  return useMemo(() => {
    // customize columns based on roles etc.
    const columns: Column<Roles>[] = [
      {
        key: 'roleCode',
        label: 'Role Code',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'roleName',
        label: 'Role Name',
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
        key: 'description',
        label: 'Description',
        type: 'Text',
        defaultOperator: 'is',
      },
    ];
    return columns;
  }, []);
}
