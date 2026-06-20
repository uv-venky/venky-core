/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, type ReactNode, type MouseEvent, Fragment } from 'react';
import type { Table } from '@tanstack/react-table';
import type { Store } from '@/lib/core/common/types/Store';

export type TableActionOpenDialogFn = (props: { rowId: string; table: Table<any>; onClose: () => void }) => ReactNode;

export interface TableActionRenderFnProps {
  rowId: string;
  table: Table<any>;
  asIconButton: boolean;
  store: Store<any>;
}

export type TableActionRenderFn = (props: TableActionRenderFnProps) => ReactNode;

export interface TableActionWithLabel {
  label: string;
  icon: ReactNode;
  onClick?: (props: { rowId: string; table: Table<any> }) => void | Promise<void>;
  disabled?: boolean | ((rowId: string) => boolean);
  variant?: 'default' | 'destructive';
  separator?: boolean;
  showAsIcon?: boolean; // If false, show in dropdown menu
  dialog?: TableActionOpenDialogFn;
  tooltip?: string;
}

export interface TableActionWithRender {
  render: TableActionRenderFn;
  showAsIcon?: boolean;
}

export type TableAction = TableActionWithLabel | TableActionWithRender;

export interface ActionsColumnProps {
  actions: TableAction[];
  rowId: string;
  className?: string;
  table: Table<any>;
  store: Store<any>;
}

const isTableActionWithRender = (action: TableAction): action is TableActionWithRender => {
  return 'render' in action;
};

export function ActionsColumnCell({ actions, rowId, className, table, store }: ActionsColumnProps) {
  const [openDialogFn, setOpenDialogFn] = useState<TableActionOpenDialogFn | null>(null);

  const filteredActions = actions.filter((action) => {
    if ('render' in action) {
      return true;
    }
    if (typeof action.disabled === 'function') {
      return !action.disabled(rowId);
    }
    return !action.disabled;
  });

  if (filteredActions.length === 0) {
    return <div className={cn('flex items-center justify-center px-2', className)} />;
  }

  // Separate actions into icon actions and dropdown actions
  const iconActions = filteredActions.filter((action) => action.showAsIcon === true);
  const dropdownActions = filteredActions.filter((action) => action.showAsIcon !== true);

  const handleActionClick = async (action: TableActionWithLabel, e: MouseEvent) => {
    e.stopPropagation();
    await store.setCurrentRowId(rowId);
    const { dialog, onClick } = action;

    if (dialog) {
      setOpenDialogFn(() => dialog);
    } else if (onClick) {
      onClick({ rowId, table });
    }
  };

  // Render icon actions as buttons and dropdown actions in menu
  return (
    <>
      <div className={cn('flex items-center justify-center gap-1 px-2', className)}>
        {iconActions.map((action) => {
          if (isTableActionWithRender(action)) {
            return (
              <Fragment key="action-render-icon">{action.render({ rowId, table, asIconButton: true, store })}</Fragment>
            );
          }
          const isDisabled =
            typeof action.disabled === 'function' ? action.disabled(rowId) : (action.disabled ?? false);
          const actionLabel = action.label.toLowerCase().replace(/\s+/g, '-');

          return (
            <Button
              key={action.label}
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', action.variant === 'destructive' && '[&_svg]:text-red-500')}
              onClick={(e) => handleActionClick(action, e)}
              disabled={isDisabled}
              data-tip={action.tooltip ?? action.label}
              data-testid={`table-action-icon-${actionLabel}-${rowId}`}
            >
              {action.icon}
            </Button>
          );
        })}
        {dropdownActions.length > 0 && (
          <DropdownMenu onOpenChange={(open) => open && store.setCurrentRowId(rowId)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-tip="Actions"
                data-testid={`table-actions-menu-trigger-${rowId}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownActions.map((action, index) => {
                if (isTableActionWithRender(action)) {
                  return (
                    <Fragment key="action-render-dropdown">
                      {action.render({ rowId, table, asIconButton: false, store })}
                    </Fragment>
                  );
                }

                const isDisabled =
                  typeof action.disabled === 'function' ? action.disabled(rowId) : (action.disabled ?? false);
                const showSeparator = action.separator && index > 0;
                const actionLabel = action.label.toLowerCase().replace(/\s+/g, '-');

                return (
                  <Fragment key={action.label}>
                    {showSeparator && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      variant={action.variant}
                      disabled={isDisabled}
                      onClick={(e) => handleActionClick(action, e)}
                      className="flex items-center gap-2"
                      data-tip={action.tooltip}
                      data-testid={`table-action-item-${actionLabel}-${rowId}`}
                    >
                      <span
                        className={cn('flex items-center', action.variant === 'destructive' && '[&_svg]:text-red-500!')}
                      >
                        {action.icon}
                      </span>
                      <span className={action.variant === 'destructive' ? 'text-red-500' : ''}>{action.label}</span>
                    </DropdownMenuItem>
                  </Fragment>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {openDialogFn?.({ rowId, table, onClose: () => setOpenDialogFn(null) })}
    </>
  );
}
