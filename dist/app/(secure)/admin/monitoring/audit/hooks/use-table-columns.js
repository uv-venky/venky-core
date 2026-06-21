/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Badge } from '../../../../../../components/ui/badge';
import HeaderCell from '../../../../../../components/core/table/header-cell';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { createActionsColumn } from '../../../../../../components/core/table/actions-column-def';
import { FileEdit, GitCompareArrows, Minus, Plus, Power, PowerOff, User } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '../../../../../../lib/utils';
import { useRowValue } from '../../../../../../components/core/hooks/useStoreHooks';
import TableCell from '../../../../../../components/core/table/table-cell';
import { AuditValueDiffDialog } from '../../../../../../app/(secure)/admin/monitoring/audit/components/audit-value-diff-dialog';
import {
  canShowAuditValueDiff,
  getAuditChangeType,
} from '../../../../../../app/(secure)/admin/monitoring/audit/lib/audit-value-diff';
const CHANGE_TYPE_CONFIG = {
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
function auditRowValueDataFromStore(store, rowId) {
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
function TimestampCell({ store, rowId }) {
  const updatedAt = useRowValue(store, rowId, 'updatedAt');
  if (updatedAt == null) {
    return _jsx('span', { className: 'text-muted-foreground text-xs', children: '-' });
  }
  const date = parseISO(updatedAt);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  return _jsx('div', {
    className: 'min-w-0 max-w-full',
    children: _jsx('div', {
      className: 'truncate text-muted-foreground text-xs',
      title: relativeTime,
      children: relativeTime,
    }),
  });
}
function UserCell({ store, rowId }) {
  const updatedBy = useRowValue(store, rowId, 'updatedBy');
  if (updatedBy == null) {
    return _jsx('span', { className: 'text-muted-foreground text-xs', children: '-' });
  }
  return _jsxs('div', {
    className: 'flex min-w-0 max-w-full items-center gap-2',
    children: [
      _jsx('div', {
        className: 'flex size-6 shrink-0 items-center justify-center rounded-full bg-muted',
        children: _jsx(User, { className: 'size-3 text-muted-foreground' }),
      }),
      _jsx('span', { className: 'truncate text-sm', title: updatedBy, children: updatedBy }),
    ],
  });
}
function ChangeTypeCell({ store, rowId }) {
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
  return _jsxs(Badge, {
    variant: 'outline',
    className: cn('gap-1 border font-normal', config.bgColor, config.color),
    children: [_jsx(Icon, { className: 'size-3' }), config.label],
  });
}
function OldValueCell({ store, ...props }) {
  const rowId = props.row.id;
  const valueType = useRowValue(store, rowId, 'valueType');
  if (valueType === 'JSON' || valueType === 'CLOB') {
    return _jsx(TableCell, { type: 'Text', attributeCode: 'oldClobValue', ...props });
  } else if (valueType === 'Number') {
    return _jsx(TableCell, { type: 'Number', attributeCode: 'oldDoubleValue', ...props });
  } else if (valueType === 'Date') {
    return _jsx(TableCell, { type: 'Date', attributeCode: 'oldDatetimeValue', ...props });
  } else {
    return _jsx(TableCell, { type: 'Text', attributeCode: 'oldStringValue', ...props });
  }
}
function NewValueCell({ store, ...props }) {
  const rowId = props.row.id;
  const valueType = useRowValue(store, rowId, 'valueType');
  if (valueType === 'JSON' || valueType === 'CLOB') {
    return _jsx(TableCell, { type: 'Text', attributeCode: 'newClobValue', ...props });
  } else if (valueType === 'Number') {
    return _jsx(TableCell, { type: 'Number', attributeCode: 'newDoubleValue', ...props });
  } else if (valueType === 'Date') {
    return _jsx(TableCell, { type: 'Date', attributeCode: 'newDatetimeValue', ...props });
  } else {
    return _jsx(TableCell, { type: 'Text', attributeCode: 'newStringValue', ...props });
  }
}
export default function useAuditTableColumns(store) {
  return useMemo(() => {
    const diffActions = [
      {
        label: 'View diff',
        icon: _jsx(GitCompareArrows, { className: 'size-4' }),
        tooltip: 'Compare old and new values',
        showAsIcon: true,
        disabled: (rowId) => !canShowAuditValueDiff(auditRowValueDataFromStore(store, rowId)),
        dialog: ({ rowId, onClose }) => _jsx(AuditValueDiffDialog, { store: store, rowId: rowId, onClose: onClose }),
      },
    ];
    const columns = [
      {
        accessorKey: 'auditId',
        meta: { label: 'ID' },
        size: 80,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Number', store: store, accessorKey: 'auditId', title: 'ID' }),
        cell: (props) => _jsx(TableCell, { type: 'Number', attributeCode: 'auditId', ...props }),
      },
      {
        accessorKey: 'updatedAt',
        meta: { label: 'Timestamp' },
        size: 160,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'updatedAt', title: 'Timestamp' }),
        cell: ({ row }) => _jsx(TimestampCell, { store: store, rowId: row.id }),
      },
      {
        accessorKey: 'updatedBy',
        meta: { label: 'User' },
        size: 120,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'updatedBy', title: 'User' }),
        cell: ({ row }) => _jsx(UserCell, { store: store, rowId: row.id }),
      },
      {
        accessorKey: 'datasourceId',
        meta: { label: 'Data Source' },
        size: 160,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'datasourceId', title: 'Data Source' }),
        cell: (props) => _jsx(TableCell, { type: 'Text', attributeCode: 'datasourceId', ...props }),
      },
      {
        accessorKey: 'pkValue',
        meta: { label: 'PK Value' },
        size: 140,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'pkValue', title: 'PK Value' }),
        cell: (props) => _jsx(TableCell, { type: 'Text', attributeCode: 'pkValue', ...props }),
      },
      {
        accessorKey: 'attributeCode',
        meta: { label: 'Attribute' },
        size: 140,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'attributeCode', title: 'Attribute' }),
        cell: (props) => _jsx(TableCell, { type: 'Text', attributeCode: 'attributeCode', ...props }),
      },
      {
        accessorKey: 'valueType',
        meta: { label: 'Type' },
        size: 100,
        header: (props) =>
          _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'valueType', title: 'Type' }),
        cell: ({ row }) => _jsx(ChangeTypeCell, { store: store, rowId: row.id }),
      },
      {
        id: 'oldValue',
        accessorKey: 'oldStringValue',
        meta: { label: 'Old Value' },
        size: 180,
        header: () => _jsx('span', { className: 'font-medium text-xs', children: 'Old Value' }),
        cell: (props) => _jsx(OldValueCell, { ...props, store: store }),
      },
      {
        id: 'newValue',
        accessorKey: 'newStringValue',
        meta: { label: 'New Value' },
        size: 180,
        header: () => _jsx('span', { className: 'font-medium text-xs', children: 'New Value' }),
        cell: (props) => _jsx(NewValueCell, { ...props, store: store }),
      },
      createActionsColumn(diffActions, { size: 56, title: '' }),
    ];
    return columns;
  }, [store]);
}
//# sourceMappingURL=use-table-columns.js.map
