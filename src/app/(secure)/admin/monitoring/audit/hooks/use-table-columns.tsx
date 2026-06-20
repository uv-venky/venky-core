/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Badge } from '@/components/ui/badge';
import HeaderCell from '@/components/core/table/header-cell';
import type { Audit } from '@/lib/common/ds/types/core/Audit';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { createActionsColumn } from '@/components/core/table/actions-column-def';
import type { TableAction } from '@/components/core/table/actions-column';
import { FileEdit, GitCompareArrows, Minus, Plus, Power, PowerOff, User } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import TableCell from '@/components/core/table/table-cell';
import type { CellContext } from '@tanstack/react-table';
import { AuditValueDiffDialog } from '@/app/(secure)/admin/monitoring/audit/components/audit-value-diff-dialog';
import {
  canShowAuditValueDiff,
  getAuditChangeType,
  type AuditChangeType,
  type AuditRowValueData,
} from '@/app/(secure)/admin/monitoring/audit/lib/audit-value-diff';

const CHANGE_TYPE_CONFIG: Record<
  AuditChangeType,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  added: {
    icon: Plus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'Added',
  },
  removed: {
    icon: Minus,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20',
    label: 'Removed',
  },
  modified: {
    icon: FileEdit,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    label: 'Modified',
  },
  activated: {
    icon: Power,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20',
    label: 'Activated',
  },
  deactivated: {
    icon: PowerOff,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    label: 'Deactivated',
  },
};

function auditRowValueDataFromStore(store: Store<Audit>, rowId: string): AuditRowValueData {
  const row = store.row(rowId);
  return {
    valueType: row?.valueType,
    oldStringValue: row?.oldStringValue,
    newStringValue: row?.newStringValue,
    oldClobValue: row?.oldClobValue,
    newClobValue: row?.newClobValue,
    oldDoubleValue: row?.oldDoubleValue,
    newDoubleValue: row?.newDoubleValue,
    oldDatetimeValue: row?.oldDatetimeValue,
    newDatetimeValue: row?.newDatetimeValue,
    attributeCode: row?.attributeCode,
  };
}

function TimestampCell({ store, rowId }: { store: Store<Audit>; rowId: string }) {
  const updatedAt = useRowValue(store, rowId, 'updatedAt');
  if (updatedAt == null) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  const date = parseISO(updatedAt);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  return (
    <div className="min-w-0 max-w-full">
      <div className="truncate text-muted-foreground text-xs" title={relativeTime}>
        {relativeTime}
      </div>
    </div>
  );
}

function UserCell({ store, rowId }: { store: Store<Audit>; rowId: string }) {
  const updatedBy = useRowValue(store, rowId, 'updatedBy');
  if (updatedBy == null) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="size-3 text-muted-foreground" />
      </div>
      <span className="truncate text-sm" title={updatedBy}>
        {updatedBy}
      </span>
    </div>
  );
}

function ChangeTypeCell({ store, rowId }: { store: Store<Audit>; rowId: string }) {
  const valueType = useRowValue(store, rowId, 'valueType');
  const oldStringValue = useRowValue(store, rowId, 'oldStringValue');
  const newStringValue = useRowValue(store, rowId, 'newStringValue');
  const oldClobValue = useRowValue(store, rowId, 'oldClobValue');
  const newClobValue = useRowValue(store, rowId, 'newClobValue');
  const oldDoubleValue = useRowValue(store, rowId, 'oldDoubleValue');
  const newDoubleValue = useRowValue(store, rowId, 'newDoubleValue');
  const oldDatetimeValue = useRowValue(store, rowId, 'oldDatetimeValue');
  const newDatetimeValue = useRowValue(store, rowId, 'newDatetimeValue');
  const attributeCode = useRowValue(store, rowId, 'attributeCode');

  const changeType = getAuditChangeType({
    valueType,
    oldStringValue,
    newStringValue,
    oldClobValue,
    newClobValue,
    oldDoubleValue,
    newDoubleValue,
    oldDatetimeValue,
    newDatetimeValue,
    attributeCode,
  });
  const config = CHANGE_TYPE_CONFIG[changeType];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('gap-1 border font-normal', config.bgColor, config.color)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

function OldValueCell({ store, ...props }: CellContext<any, unknown> & { store: Store<Audit> }) {
  const rowId = props.row.id;
  const valueType = useRowValue(store, rowId, 'valueType');

  if (valueType === 'JSON' || valueType === 'CLOB') {
    return <TableCell type="Text" attributeCode="oldClobValue" {...props} />;
  } else if (valueType === 'Number') {
    return <TableCell type="Number" attributeCode="oldDoubleValue" {...props} />;
  } else if (valueType === 'Date') {
    return <TableCell type="Date" attributeCode="oldDatetimeValue" {...props} />;
  } else {
    return <TableCell type="Text" attributeCode="oldStringValue" {...props} />;
  }
}

function NewValueCell({ store, ...props }: CellContext<any, unknown> & { store: Store<Audit> }) {
  const rowId = props.row.id;
  const valueType = useRowValue(store, rowId, 'valueType');

  if (valueType === 'JSON' || valueType === 'CLOB') {
    return <TableCell type="Text" attributeCode="newClobValue" {...props} />;
  } else if (valueType === 'Number') {
    return <TableCell type="Number" attributeCode="newDoubleValue" {...props} />;
  } else if (valueType === 'Date') {
    return <TableCell type="Date" attributeCode="newDatetimeValue" {...props} />;
  } else {
    return <TableCell type="Text" attributeCode="newStringValue" {...props} />;
  }
}

export default function useAuditTableColumns(store: Store<Audit>): AccessorKeyColumnDef<Audit>[] {
  return useMemo(() => {
    const diffActions: TableAction[] = [
      {
        label: 'View diff',
        icon: <GitCompareArrows className="size-4" />,
        tooltip: 'Compare old and new values',
        showAsIcon: true,
        disabled: (rowId) => !canShowAuditValueDiff(auditRowValueDataFromStore(store, rowId)),
        dialog: ({ rowId, onClose }) => <AuditValueDiffDialog store={store} rowId={rowId} onClose={onClose} />,
      },
    ];

    const columns: AccessorKeyColumnDef<Audit>[] = [
      {
        accessorKey: 'auditId',
        meta: { label: 'ID' },
        size: 80,
        header: (props) => <HeaderCell {...props} type="Number" store={store} accessorKey="auditId" title="ID" />,
        cell: (props) => <TableCell type="Number" attributeCode="auditId" {...props} />,
      },
      {
        accessorKey: 'updatedAt',
        meta: { label: 'Timestamp' },
        size: 160,
        header: (props) => (
          <HeaderCell {...props} type="Date" store={store} accessorKey="updatedAt" title="Timestamp" />
        ),
        cell: ({ row }) => <TimestampCell store={store} rowId={row.id} />,
      },
      {
        accessorKey: 'updatedBy',
        meta: { label: 'User' },
        size: 120,
        header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="updatedBy" title="User" />,
        cell: ({ row }) => <UserCell store={store} rowId={row.id} />,
      },
      {
        accessorKey: 'datasourceId',
        meta: { label: 'Data Source' },
        size: 160,
        header: (props) => (
          <HeaderCell {...props} type="Text" store={store} accessorKey="datasourceId" title="Data Source" />
        ),
        cell: (props) => <TableCell type="Text" attributeCode="datasourceId" {...props} />,
      },
      {
        accessorKey: 'pkValue',
        meta: { label: 'PK Value' },
        size: 140,
        header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="pkValue" title="PK Value" />,
        cell: (props) => <TableCell type="Text" attributeCode="pkValue" {...props} />,
      },
      {
        accessorKey: 'attributeCode',
        meta: { label: 'Attribute' },
        size: 140,
        header: (props) => (
          <HeaderCell {...props} type="Text" store={store} accessorKey="attributeCode" title="Attribute" />
        ),
        cell: (props) => <TableCell type="Text" attributeCode="attributeCode" {...props} />,
      },
      {
        accessorKey: 'valueType',
        meta: { label: 'Type' },
        size: 100,
        header: (props) => <HeaderCell {...props} type="Text" store={store} accessorKey="valueType" title="Type" />,
        cell: ({ row }) => <ChangeTypeCell store={store} rowId={row.id} />,
      },
      {
        id: 'oldValue',
        accessorKey: 'oldStringValue',
        meta: { label: 'Old Value' },
        size: 180,
        header: () => <span className="font-medium text-xs">Old Value</span>,
        cell: (props) => <OldValueCell {...props} store={store} />,
      },
      {
        id: 'newValue',
        accessorKey: 'newStringValue',
        meta: { label: 'New Value' },
        size: 180,
        header: () => <span className="font-medium text-xs">New Value</span>,
        cell: (props) => <NewValueCell {...props} store={store} />,
      },
      createActionsColumn<Audit>(diffActions, { size: 56, title: '' }),
    ];
    return columns;
  }, [store]);
}
