/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Column, SelectOptionsColumn } from '@/components/core/smart-search/types';
import type { Audit } from '@/lib/common/ds/types/core/Audit';
import type { AuditFilterOptions } from '@/app/(secure)/admin/monitoring/audit/actions';
import { useQuery } from '@/lib/core/client/useQuery';
import { isErrorResponse } from '@/lib/core/common/error';
import { useMemo } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

const defaultOptions: AuditFilterOptions = {
  datasources: [],
  users: [],
  attributes: [],
  valueTypes: [],
};

export default function useAuditSmartSearchColumns(): Column<Audit>[] {
  const optionsResult = useQuery('getAuditFilterOptions');

  return useMemo(() => {
    const options: AuditFilterOptions =
      optionsResult.status === 'success' && !isErrorResponse(optionsResult.data) ? optionsResult.data : defaultOptions;

    const columns: Column<Audit>[] = [
      {
        key: 'datasourceId',
        label: 'Data Source',
        type: 'Select',
        defaultOperator: 'is',
        options: options.datasources.map((d: string) => ({ label: d, value: d })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      } satisfies SelectOptionsColumn<Audit, SelectOption>,
      {
        key: 'updatedBy',
        label: 'User',
        type: 'Select',
        defaultOperator: 'is',
        options: options.users.map((u: string) => ({ label: u, value: u })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      } satisfies SelectOptionsColumn<Audit, SelectOption>,
      {
        key: 'attributeCode',
        label: 'Attribute',
        type: 'Select',
        defaultOperator: 'is',
        options: options.attributes.map((a: string) => ({ label: a, value: a })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      } satisfies SelectOptionsColumn<Audit, SelectOption>,
      {
        key: 'valueType',
        label: 'Value Type',
        type: 'Select',
        defaultOperator: 'is',
        options: options.valueTypes.map((v: string) => ({ label: v, value: v })),
        getOptionLabel: (o) => o.label,
        getOptionValue: (o) => o.value,
      } satisfies SelectOptionsColumn<Audit, SelectOption>,
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
