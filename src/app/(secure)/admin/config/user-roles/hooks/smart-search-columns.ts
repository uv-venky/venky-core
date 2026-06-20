/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column } from '@/components/core/smart-search/types';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import { useMemo } from 'react';

export default function useSmartSearchColumns({
  roleCode,
  userName,
}: {
  roleCode?: string;
  userName?: string;
}): Column<UserRoles>[] {
  return useMemo(() => {
    const columns: Column<UserRoles>[] = [];
    if (!userName) {
      columns.push({
        key: 'userName',
        label: 'User Name',
        type: 'Text',
        defaultOperator: 'is',
      });
      columns.push({
        key: 'displayName',
        label: 'Display Name',
        type: 'Text',
        defaultOperator: 'is',
      });
      columns.push({
        key: 'email',
        label: 'Email',
        type: 'Text',
        defaultOperator: 'is',
      });
    }
    if (!roleCode) {
      columns.push({
        key: 'roleCode',
        label: 'Role Code',
        type: 'Text',
        defaultOperator: 'is',
      });
      columns.push({
        key: 'roleName',
        label: 'Role Name',
        type: 'Text',
        defaultOperator: 'is',
      });
    }
    columns.push(
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
    );
    return columns;
  }, [roleCode, userName]);
}
