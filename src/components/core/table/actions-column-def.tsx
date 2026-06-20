/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { ActionsColumnCell } from '@/components/core/table/actions-column';
import type {
  TableAction,
  TableActionRenderFnProps,
  TableActionOpenDialogFn,
  TableActionRenderFn,
  TableActionWithLabel,
  TableActionWithRender,
} from '@/components/core/table/actions-column';
import type { AccessorKeyColumnDef, CellContext } from '@tanstack/react-table';
import type { Store } from '@/lib/core/common/types/Store';
import HeaderCell from '@/components/core/table/header-cell';

export const ACTIONS_COLUMN_ID = '__actions';

export type {
  TableAction,
  TableActionOpenDialogFn,
  TableActionRenderFn,
  TableActionRenderFnProps,
  TableActionWithLabel,
  TableActionWithRender,
};

export function createActionsColumn<T extends object>(
  actions: TableAction[],
  options?: {
    size?: number;
    title?: string;
  },
): AccessorKeyColumnDef<T> {
  const size = options?.size ?? 60;
  const title = options?.title ?? 'Actions';

  return {
    id: ACTIONS_COLUMN_ID,
    accessorKey: ACTIONS_COLUMN_ID as keyof T,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: {
      label: title,
      sticky: 'right',
    },
    size,
    header: (props) => {
      return (
        <HeaderCell
          {...props}
          type="Text"
          store={props.table.options.meta?.store as Store<T>}
          accessorKey={ACTIONS_COLUMN_ID}
          title={title}
          align="center"
        />
      );
    },
    cell: (props: CellContext<T, unknown>) => {
      const rowId = props.row.id;
      return (
        <ActionsColumnCell
          actions={actions}
          rowId={rowId}
          table={props.table}
          store={props.table.options.meta?.store as Store<T>}
        />
      );
    },
  } as AccessorKeyColumnDef<T>;
}
