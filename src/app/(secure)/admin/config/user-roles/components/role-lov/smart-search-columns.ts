/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column } from '@/components/core/smart-search/types';
import { useMemo } from 'react';
import type { Roles } from '@/lib/common/ds/types/core/Roles';

export default function useRolesLOVSmartSearchColumns(): Column<Roles>[] {
  return useMemo(() => {
    const columns: Column<Roles>[] = [
      {
        key: 'roleName',
        label: 'Role Name',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'roleCode',
        label: 'Role Code',
        type: 'Text',
        defaultOperator: 'is',
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
