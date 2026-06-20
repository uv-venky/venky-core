'use client';

import HeaderCell from '@/components/core/table/header-cell';
import { useClientSession } from '@/components/core/session-context';
import TableCell from '@/components/core/table/table-cell';
import { BadgeOutlineCell, CodeCell } from '@/components/core/table/styled-cells';
import type { Audit } from '@/lib/common/ds/types/core/Audit';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export default function useWVAuditTableColumns(store: Store<Audit>): AccessorKeyColumnDef<Audit>[] {
  const session = useClientSession();
  const roles = session?.roles;
  return useMemo(() => {
    if (!roles) {
      return [];
    }
    // customize columns based on roles etc.
    const columns: AccessorKeyColumnDef<Audit>[] = [
      {
        accessorKey: 'auditId',
        meta: {
          label: 'ID',
        },
        size: 80,
        header: (props) => {
          return <HeaderCell {...props} type="Number" store={store} accessorKey="auditId" title="ID" />;
        },
        cell: (props) => <TableCell type="Number" attributeCode="auditId" {...props} />,
      },
      {
        accessorKey: 'datasourceId',
        meta: {
          label: 'DataSource',
        },
        size: 160,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="datasourceId" title="DataSource" />;
        },
        cell: (props) => <CodeCell attributeCode="datasourceId" {...props} />,
      },
      {
        accessorKey: 'pkValue',
        meta: {
          label: 'PK Value',
        },
        size: 140,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="pkValue" title="PK Value" />;
        },
        cell: (props) => <CodeCell attributeCode="pkValue" {...props} />,
      },
      {
        accessorKey: 'attributeCode',
        meta: {
          label: 'Attribute',
        },
        size: 160,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="attributeCode" title="Attribute" />;
        },
        cell: (props) => <CodeCell attributeCode="attributeCode" {...props} />,
      },
      {
        accessorKey: 'valueType',
        meta: {
          label: 'Type',
        },
        size: 100,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="valueType" title="Type" />;
        },
        cell: (props) => <BadgeOutlineCell attributeCode="valueType" mono={false} {...props} />,
      },
      {
        accessorKey: 'oldStringValue',
        meta: {
          label: 'Old Value',
        },
        size: 180,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="oldStringValue" title="Old Value" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="oldStringValue" {...props} />,
      },
      {
        accessorKey: 'newStringValue',
        meta: {
          label: 'New Value',
        },
        size: 180,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="newStringValue" title="New Value" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="newStringValue" {...props} />,
      },
      {
        accessorKey: 'oldDoubleValue',
        meta: {
          label: 'Old Number',
        },
        size: 120,
        header: (props) => {
          return <HeaderCell {...props} type="Number" store={store} accessorKey="oldDoubleValue" title="Old Number" />;
        },
        cell: (props) => <TableCell type="Number" attributeCode="oldDoubleValue" {...props} />,
      },
      {
        accessorKey: 'newDoubleValue',
        meta: {
          label: 'New Number',
        },
        size: 120,
        header: (props) => {
          return <HeaderCell {...props} type="Number" store={store} accessorKey="newDoubleValue" title="New Number" />;
        },
        cell: (props) => <TableCell type="Number" attributeCode="newDoubleValue" {...props} />,
      },
      {
        accessorKey: 'oldDatetimeValue',
        meta: {
          label: 'Old Date',
        },
        size: 140,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="oldDatetimeValue" title="Old Date" />;
        },
        cell: (props) => <TableCell type="Date" attributeCode="oldDatetimeValue" {...props} />,
      },
      {
        accessorKey: 'newDatetimeValue',
        meta: {
          label: 'New Date',
        },
        size: 140,
        header: (props) => {
          return <HeaderCell {...props} type="Date" store={store} accessorKey="newDatetimeValue" title="New Date" />;
        },
        cell: (props) => <TableCell type="Date" attributeCode="newDatetimeValue" {...props} />,
      },
      {
        accessorKey: 'oldClobValue',
        meta: {
          label: 'Old CLOB',
        },
        size: 200,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="oldClobValue" title="Old CLOB" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="oldClobValue" {...props} />,
      },
      {
        accessorKey: 'newClobValue',
        meta: {
          label: 'New CLOB',
        },
        size: 200,
        header: (props) => {
          return <HeaderCell {...props} type="Text" store={store} accessorKey="newClobValue" title="New CLOB" />;
        },
        cell: (props) => <TableCell type="Text" attributeCode="newClobValue" {...props} />,
      },
    ];
    return columns;
  }, [roles, store]);
}
