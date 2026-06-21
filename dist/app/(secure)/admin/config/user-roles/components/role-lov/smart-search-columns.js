/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useMemo } from 'react';
export default function useRolesLOVSmartSearchColumns() {
  return useMemo(() => {
    const columns = [
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
//# sourceMappingURL=smart-search-columns.js.map
