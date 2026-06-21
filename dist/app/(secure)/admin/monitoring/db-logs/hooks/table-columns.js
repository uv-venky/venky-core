/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import HeaderCell from '../../../../../../components/core/table/header-cell';
import TableCell, { Cell } from '../../../../../../components/core/table/table-cell';
import { useMemo } from 'react';
import { assertExists } from '../../../../../../components/core/utils/assert';
import { useCurrentStore } from '../../../../../../components/core/page/RowIdProvider';
import { useRowValue } from '../../../../../../components/core/hooks/useStoreHooks';
import { splitFilter } from '../../../../../../lib/core/common/ds/types/filter';
import { cn } from '../../../../../../lib/utils';
import { AlertCircle, CheckCircle2, XCircle, Bug, Info } from 'lucide-react';
import { isEmpty } from '../../../../../../lib/core/common/isEmpty';
function LogCell(props) {
  const { row, attributeCode } = props;
  const store = useCurrentStore();
  assertExists(store, 'Missing store in LogCell');
  const value = useRowValue(store, row.id, attributeCode);
  const displayValue = value == null ? '' : String(value);
  const isValueEmpty = isEmpty(value);
  const handleFilterClick = (e) => {
    e.stopPropagation();
    if (isValueEmpty) {
      return;
    }
    store.setSmartSearchFilters([
      ...store.smartSearchFilters().filter((f) => splitFilter(f).attributeCode !== attributeCode),
      {
        [attributeCode]: { is: value },
      },
    ]);
    store.executeQuery({});
  };
  return _jsx(Cell, {
    attributeCode: attributeCode,
    store: store,
    rowId: row.id,
    className: cn('min-w-0', !isValueEmpty && 'cursor-pointer'),
    dataTip: isValueEmpty ? undefined : displayValue,
    onClick: isValueEmpty ? undefined : handleFilterClick,
    children: _jsx('span', {
      className: cn(
        'min-w-0 flex-1 truncate text-sm',
        isValueEmpty ? 'text-muted-foreground text-xs' : 'text-primary hover:underline',
      ),
      children: isValueEmpty ? '-' : displayValue,
    }),
  });
}
function StatusCell(props) {
  const { row } = props;
  const store = useCurrentStore();
  assertExists(store, 'Missing store in StatusCell');
  const level = useRowValue(store, row.id, 'level') ?? null;
  const getStatusConfig = (level) => {
    switch (level) {
      case 10:
        return {
          icon: CheckCircle2,
          color: 'text-gray-100',
          bgColor: 'bg-gray-400',
          label: 'Trace',
        };
      case 20:
        return {
          icon: Bug,
          color: 'text-gray-100',
          bgColor: 'bg-blue-600',
          label: 'Debug',
        };
      case 30:
        return {
          icon: Info,
          color: 'text-gray-100',
          bgColor: 'bg-green-600',
          label: 'Info',
        };
      case 40:
        return {
          icon: AlertCircle,
          color: 'text-gray-100',
          bgColor: 'bg-amber-500',
          label: 'Warn',
        };
      case 50:
        return {
          icon: XCircle,
          color: 'text-gray-100',
          bgColor: 'bg-red-600',
          label: 'Error',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-100',
          bgColor: 'bg-gray-500',
          label: 'Unknown',
        };
    }
  };
  const config = getStatusConfig(level);
  const Icon = config.icon;
  const handleLevelClick = (e) => {
    e.stopPropagation();
    if (level == null) {
      return;
    }
    store.setSmartSearchFilters([
      ...store.smartSearchFilters().filter((f) => splitFilter(f).attributeCode !== 'level'),
      { level: { is: level } },
    ]);
    store.executeQuery({});
  };
  return _jsx(Cell, {
    attributeCode: 'level',
    store: store,
    rowId: row.id,
    className: 'min-w-0 justify-center',
    dataTip: config.label,
    onClick: level == null ? undefined : handleLevelClick,
    children: _jsxs('div', {
      className: cn('flex min-w-0 max-w-full cursor-pointer items-center gap-1 rounded-full px-2 py-0', config.bgColor),
      children: [
        _jsx(Icon, { className: cn('size-4 shrink-0', config.color) }),
        _jsx('span', { className: cn('min-w-0 truncate font-medium text-sm', config.color), children: config.label }),
      ],
    }),
  });
}
export default function useLogsTableColumns(store) {
  return useMemo(() => {
    const columns = [
      {
        accessorKey: 'logId',
        meta: {
          label: 'ID',
        },
        size: 120,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Number', store: store, accessorKey: 'logId', title: 'ID' });
        },
        cell: (props) => _jsx(TableCell, { type: 'Number', attributeCode: 'logId', ...props }),
      },
      {
        accessorKey: 'createdAt',
        meta: {
          label: 'Time',
        },
        size: 140,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Date', store: store, accessorKey: 'createdAt', title: 'Time' });
        },
        cell: (props) =>
          _jsx(TableCell, { type: 'Date', dateFormat: 'M/d H:mm:ss', attributeCode: 'createdAt', ...props }),
      },
      {
        accessorKey: 'level',
        meta: {
          label: 'Level',
        },
        size: 90,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Number',
            align: 'center',
            store: store,
            accessorKey: 'level',
            title: 'Level',
          });
        },
        cell: (props) => _jsx(StatusCell, { ...props }),
      },
      {
        accessorKey: 'userName',
        meta: {
          label: 'User Name',
        },
        size: 110,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Text',
            store: store,
            accessorKey: 'userName',
            title: 'User Name',
          });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'userName', ...props }),
      },
      {
        accessorKey: 'trackId',
        meta: {
          label: 'Track Id',
        },
        size: 120,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'trackId', title: 'Track Id' });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'trackId', ...props }),
      },
      {
        accessorKey: 'message',
        meta: {
          label: 'Message',
        },
        size: 600,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'message', title: 'Message' });
        },
        cell: (props) => _jsx(TableCell, { type: 'Text', attributeCode: 'message', ...props }),
      },
      {
        accessorKey: 'apiName',
        meta: {
          label: 'Api Name',
        },
        size: 200,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'apiName', title: 'Api Name' });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'apiName', ...props }),
      },
      {
        accessorKey: 'dataSource',
        meta: {
          label: 'Data Source',
        },
        size: 200,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Text',
            store: store,
            accessorKey: 'dataSource',
            title: 'Data Source',
          });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'dataSource', ...props }),
      },
      {
        accessorKey: 'sessionId',
        meta: {
          label: 'Session Id',
        },
        size: 300,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Text',
            store: store,
            accessorKey: 'sessionId',
            title: 'Session Id',
          });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'sessionId', ...props }),
      },
      {
        accessorKey: 'hostname',
        meta: {
          label: 'Hostname',
        },
        size: 160,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'hostname', title: 'Hostname' });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'hostname', ...props }),
      },
      {
        accessorKey: 'pid',
        meta: {
          label: 'PID',
        },
        size: 90,
        header: (props) => {
          return _jsx(HeaderCell, { ...props, type: 'Text', store: store, accessorKey: 'pid', title: 'PID' });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'pid', ...props }),
      },
      {
        accessorKey: 'appVersion',
        meta: {
          label: 'App Version',
        },
        size: 160,
        header: (props) => {
          return _jsx(HeaderCell, {
            ...props,
            type: 'Text',
            store: store,
            accessorKey: 'appVersion',
            title: 'App Version',
          });
        },
        cell: (props) => _jsx(LogCell, { attributeCode: 'appVersion', ...props }),
      },
    ];
    return columns;
  }, [store]);
}
//# sourceMappingURL=table-columns.js.map
