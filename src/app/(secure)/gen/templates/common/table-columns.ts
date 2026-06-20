import { camelCase, startCase } from 'lodash-es';
import type { State } from '../../types';
import { getAttributeType } from '../../utils';

export default ({ dsName, moduleCode, columns, columnOrder, index, template, editable }: State) => {
  let cols = columns
    .filter((c) => columnOrder.includes(c.name))
    .sort((a, b) => columnOrder.indexOf(a.name) - columnOrder.indexOf(b.name));
  cols =
    template === 'drill-down' && moduleCode === 'amazon'
      ? cols.filter((c) => !['customer_name', 'customer_number'].includes(c.name))
      : cols;
  const fields = cols
    .filter(
      (column) =>
        ![
          'created_by',
          'last_updated_by',
          'creation_date',
          'last_update_date',
          'created_at',
          'updated_at',
          'updated_by',
        ].includes(column.name) &&
        column.name.indexOf('password') === -1 &&
        column.name.indexOf('secret') === -1,
    )
    .map((column) => {
      const type = getAttributeType(column.type, column.maxLength);
      const key = camelCase(column.name);
      const label = startCase(camelCase(column.name));
      if (!type || type === 'JSON' || type === 'Polygon' || type === 'Vector') {
        return `      /* Ignored column ${column.name} of type ${column.type}! */\n`;
      }
      return `      {
        accessorKey: '${key}${index ?? ''}',
        meta: {
          label: '${label}${index ?? ''}',
        },
        size: ${type === 'Number' ? 90 : type === 'Date' ? 110 : 200},
        header: (props) => {
          return <HeaderCell {...props} type="${type}" store={store} accessorKey="${key}${
            index ?? ''
          }" title="${label}${index ?? ''}" />;
        },
        cell: (props) => <DataTableCell type="${type}" attributeCode="${key}${index ?? ''}" {...props} />,
      },\n`;
    })
    .join('');

  return `/* Copyright (c) 2024-present Venky Corp. */
  
'use client';

import { HeaderCell, DataTableCell } ${'from'} '@/components/core/table';
import { useClientSession } ${'from'} '@/components/core/session-context';${
    editable
      ? `
import { createActionsColumn, type TableAction } ${'from'} '@/components/core/table/actions-column-def';
import { Pencil } ${'from'} 'lucide-react';`
      : ''
  }
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode ? `${moduleCode}/` : ''}${dsName}';
import type {  Store } ${'from'} '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } ${'from'} '@tanstack/react-table';
import { useMemo } ${'from'} 'react';

export default function use${dsName}TableColumns(
  store: Store<${dsName}>,
): AccessorKeyColumnDef<${dsName}>[] {
  const session = useClientSession();
  const roles = session?.roles;
  return useMemo(() => {
    if (!roles) {
      return [];
    }
    // customize columns based on roles etc.
    const columns: AccessorKeyColumnDef<${dsName}>[] = [
      ${fields.trim()}${
        editable
          ? `
      createActionsColumn(
        [
          {
            label: 'Edit',
            icon: <Pencil className="size-4" />,
            onClick: ({ rowId, table }) => {
              table.options.meta?.onEdit?.(rowId);
            },
          },
        ],
        { size: 80, title: 'Actions' },
      ),`
          : ''
      }
    ];
    return columns;
  }, [roles, store]);
}
`;
};
