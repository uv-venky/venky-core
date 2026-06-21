/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { ActionsColumnCell } from '../../../components/core/table/actions-column';
import HeaderCell from '../../../components/core/table/header-cell';
export const ACTIONS_COLUMN_ID = '__actions';
export function createActionsColumn(actions, options) {
  const size = options?.size ?? 60;
  const title = options?.title ?? 'Actions';
  return {
    id: ACTIONS_COLUMN_ID,
    accessorKey: ACTIONS_COLUMN_ID,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: {
      label: title,
      sticky: 'right',
    },
    size,
    header: (props) => {
      return _jsx(HeaderCell, {
        ...props,
        type: 'Text',
        store: props.table.options.meta?.store,
        accessorKey: ACTIONS_COLUMN_ID,
        title: title,
        align: 'center',
      });
    },
    cell: (props) => {
      const rowId = props.row.id;
      return _jsx(ActionsColumnCell, {
        actions: actions,
        rowId: rowId,
        table: props.table,
        store: props.table.options.meta?.store,
      });
    },
  };
}
//# sourceMappingURL=actions-column-def.js.map
