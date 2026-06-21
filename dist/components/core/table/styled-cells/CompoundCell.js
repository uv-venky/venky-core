/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL, ENTITY_PRESETS } from './shared';
/**
 * Compound cell with primary and secondary text, optional icon.
 *
 * @example
 * ```tsx
 * // Name with email subtitle
 * <CompoundCell
 *   primary="displayName"
 *   secondary="email"
 *   preset="user"
 *   useTableOnEdit
 *   {...props}
 * />
 *
 * // Project with customer
 * <CompoundCell
 *   primary="projectName"
 *   secondary="customerName"
 *   preset="project"
 *   {...props}
 * />
 * ```
 */
export function CompoundCell({
  primary,
  secondary,
  preset,
  icon,
  iconBgClass,
  iconClass,
  onClick,
  useTableOnEdit,
  className,
  feedbackMask,
  row,
  table,
}) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in CompoundCell');
  const primaryValue = useRowValue(store, row.id, primary);
  const secondaryValue = useRowValue(store, row.id, secondary ?? '');
  if (primaryValue == null || primaryValue === '') {
    return EMPTY_CELL;
  }
  // Get preset config or use custom values
  const presetConfig = preset ? ENTITY_PRESETS[preset] : null;
  const resolvedIcon = icon ?? presetConfig?.icon;
  const resolvedIconBgClass = iconBgClass ?? presetConfig?.iconBgClass ?? 'bg-slate-100 dark:bg-slate-800';
  const resolvedIconClass = iconClass ?? presetConfig?.iconClass ?? 'text-slate-600 dark:text-slate-400';
  const handleClick = () => {
    if (useTableOnEdit) {
      table.options.meta?.onEdit?.(row.id);
    } else if (onClick) {
      onClick(row.id);
    }
  };
  const isClickable = useTableOnEdit || onClick;
  const primaryString = String(primaryValue);
  const secondaryString = secondaryValue != null && secondaryValue !== '' ? String(secondaryValue) : null;
  const content = _jsxs(_Fragment, {
    children: [
      resolvedIcon &&
        _jsx('div', {
          className: cn('flex size-6 shrink-0 items-center justify-center rounded', resolvedIconBgClass),
          children: _jsx('span', { className: resolvedIconClass, children: resolvedIcon }),
        }),
      _jsxs('div', {
        className: 'flex min-w-0 flex-col',
        children: [
          isClickable
            ? _jsx('span', { className: 'truncate font-medium text-sm group-hover:underline', children: primaryString })
            : _jsx('span', { className: 'truncate font-medium text-sm', children: primaryString }),
          secondaryString &&
            _jsx('span', { className: 'truncate text-muted-foreground text-xs', children: secondaryString }),
        ],
      }),
    ],
  });
  return _jsx(Cell, {
    attributeCode: primary,
    store: store,
    rowId: row.id,
    className: cn('px-2 py-1', className),
    feedbackMask: feedbackMask,
    children: isClickable
      ? _jsx('button', {
          type: 'button',
          onClick: handleClick,
          className: 'group flex min-w-0 max-w-full cursor-pointer items-center gap-2 text-left',
          children: content,
        })
      : _jsx('div', { className: 'flex min-w-0 max-w-full items-center gap-2', children: content }),
  });
}
//# sourceMappingURL=CompoundCell.js.map
