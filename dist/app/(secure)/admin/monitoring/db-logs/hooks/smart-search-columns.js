/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useMemo } from 'react';
export default function useSmartSearchColumns() {
  return useMemo(() => {
    const columns = [
      {
        key: 'logId',
        label: 'Log Id',
        type: 'Number',
        defaultOperator: 'eq',
      },
      {
        key: 'level',
        label: 'Level',
        type: 'Select',
        defaultOperator: 'is',
        options: [
          {
            label: 'Trace',
            value: 10,
          },
          {
            label: 'Debug',
            value: 20,
          },
          {
            label: 'Info',
            value: 30,
          },
          {
            label: 'Warn',
            value: 40,
          },
          {
            label: 'Error',
            value: 50,
          },
          {
            label: 'Fatal',
            value: 60,
          },
        ],
        getOptionLabel: (option) => option.label,
        getOptionValue: (option) => option.value,
      },
      {
        key: 'userName',
        label: 'User Name',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'trackId',
        label: 'Track Id',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'message',
        label: 'Message',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'apiName',
        label: 'Api Name',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'dataSource',
        label: 'Data Source',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'sessionId',
        label: 'Session Id',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'createdAt',
        label: 'Created At',
        type: 'Date',
        defaultOperator: 'on',
      },
      {
        key: 'hostname',
        label: 'Hostname',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'pid',
        label: 'Pid',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'appVersion',
        label: 'App Version',
        type: 'Text',
        defaultOperator: 'is',
      },
    ];
    return columns;
  }, []);
}
//# sourceMappingURL=smart-search-columns.js.map
