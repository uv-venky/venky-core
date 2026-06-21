/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useMemo } from 'react';
export default function useSmartSearchColumns() {
  return useMemo(() => {
    const columns = [
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
      {
        key: 'locked',
        label: 'Locked',
        type: 'Boolean',
        defaultOperator: 'istrue',
      },
      {
        key: 'settings.theme',
        label: 'Theme',
        type: 'Select',
        options: [
          { label: 'System', value: 'system' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ],
        getOptionLabel: (option) => option.label,
        getOptionValue: (option) => option.value,
        defaultOperator: 'is',
      },
    ];
    return columns;
  }, []);
}
//# sourceMappingURL=smart-search-columns.js.map
