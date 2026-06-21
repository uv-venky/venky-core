/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useMemo } from 'react';
export default function useSmartSearchColumns({ roleCode, userName }) {
  return useMemo(() => {
    const columns = [];
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
//# sourceMappingURL=smart-search-columns.js.map
