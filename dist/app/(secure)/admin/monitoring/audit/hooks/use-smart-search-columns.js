/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useQuery } from '../../../../../../lib/core/client/useQuery';
import { isErrorResponse } from '../../../../../../lib/core/common/error';
import { useMemo } from 'react';
const defaultOptions = {
  datasources: [],
  users: [],
  attributes: [],
  valueTypes: [],
};
export default function useAuditSmartSearchColumns() {
  const optionsResult = useQuery('getAuditFilterOptions');
  return useMemo(() => {
    const options =
      optionsResult.status === 'success' && !isErrorResponse(optionsResult.data) ? optionsResult.data : defaultOptions;
    const columns = [
      {
        key: 'datasourceId',
        label: 'Data Source',
        type: 'Select',
        defaultOperator: 'is',
        options: options.datasources.map((d) => ({ label: d, value: d })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      },
      {
        key: 'updatedBy',
        label: 'User',
        type: 'Select',
        defaultOperator: 'is',
        options: options.users.map((u) => ({ label: u, value: u })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      },
      {
        key: 'attributeCode',
        label: 'Attribute',
        type: 'Select',
        defaultOperator: 'is',
        options: options.attributes.map((a) => ({ label: a, value: a })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      },
      {
        key: 'valueType',
        label: 'Value Type',
        type: 'Select',
        defaultOperator: 'is',
        options: options.valueTypes.map((v) => ({ label: v, value: v })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      },
      {
        key: 'pkValue',
        label: 'PK Value',
        type: 'Text',
        defaultOperator: 'like',
      },
      {
        key: 'updatedAt',
        label: 'Updated At',
        type: 'Date',
        defaultOperator: 'on',
        showTime: true,
      },
      {
        key: 'auditId',
        label: 'Audit ID',
        type: 'Number',
        defaultOperator: 'eq',
      },
    ];
    return columns;
  }, [optionsResult]);
}
//# sourceMappingURL=use-smart-search-columns.js.map
