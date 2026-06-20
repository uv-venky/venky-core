'use client';

import type { Column } from '@/components/core/smart-search/types';
import { useClientSession } from '@/components/core/session-context';
import type { Audit } from '@/lib/common/ds/types/core/Audit';
import { useMemo } from 'react';

export default function useSmartSearchColumns(): Column<Audit>[] {
  const session = useClientSession();
  const roles = session?.roles;
  return useMemo(() => {
    if (!roles) {
      return [];
    }
    // customize columns based on roles etc.
    const columns: Column<Audit>[] = [
      {
        key: 'attributeCode',
        label: 'Attribute Code',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'auditId',
        label: 'Audit Id',
        type: 'Number',
        defaultOperator: 'eq',
      },
      {
        key: 'datasourceId',
        label: 'Datasource Id',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'newClobValue',
        label: 'New Clob Value',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'newDatetimeValue',
        label: 'New Datetime Value',
        type: 'Date',
        defaultOperator: 'on',
      },
      {
        key: 'newDoubleValue',
        label: 'New Double Value',
        type: 'Number',
        defaultOperator: 'eq',
      },
      {
        key: 'newStringValue',
        label: 'New String Value',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'oldClobValue',
        label: 'Old Clob Value',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'oldDatetimeValue',
        label: 'Old Datetime Value',
        type: 'Date',
        defaultOperator: 'on',
      },
      {
        key: 'oldDoubleValue',
        label: 'Old Double Value',
        type: 'Number',
        defaultOperator: 'eq',
      },
      {
        key: 'oldStringValue',
        label: 'Old String Value',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'pkValue',
        label: 'Pk Value',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'updatedAt',
        label: 'Updated At',
        type: 'Date',
        defaultOperator: 'on',
      },
      {
        key: 'updatedBy',
        label: 'Updated By',
        type: 'Text',
        defaultOperator: 'is',
      },
      {
        key: 'valueType',
        label: 'Value Type',
        type: 'Text',
        defaultOperator: 'is',
      },
    ];
    return columns;
  }, [roles]);
}
