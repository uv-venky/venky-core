/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL, ENTITY_PRESETS } from './shared';
/**
 * Entity name cell with icon and optional click behavior.
 *
 * @example
 * ```tsx
 * // With preset
 * <EntityNameCell preset="customer" attributeCode="customerName" useTableOnEdit {...props} />
 *
 * // With custom icon and colors
 * <EntityNameCell
 *   attributeCode="name"
 *   icon={<User className="size-3.5" />}
 *   iconBgClass="bg-indigo-100 dark:bg-indigo-900"
 *   iconClass="text-indigo-600 dark:text-indigo-400"
 *   onClick={(rowId) => router.push(`/users/${rowId}`)}
 *   {...props}
 * />
 * ```
 */
export function EntityNameCell({
  attributeCode,
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
  assertExists(store, 'Store not found in EntityNameCell');
  const value = useRowValue(store, row.id, attributeCode);
  if (value == null || value === '') {
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
  const stringValue = String(value);
  return _jsx(Cell, {
    attributeCode: attributeCode,
    store: store,
    rowId: row.id,
    className: cn('px-2 py-1', className),
    feedbackMask: feedbackMask,
    children: isClickable
      ? _jsxs('button', {
          type: 'button',
          onClick: handleClick,
          className: 'group flex min-w-0 max-w-full cursor-pointer items-center gap-2 rounded px-1 py-0.5',
          children: [
            resolvedIcon &&
              _jsx('div', {
                className: cn('flex size-6 shrink-0 items-center justify-center rounded', resolvedIconBgClass),
                children: _jsx('span', { className: resolvedIconClass, children: resolvedIcon }),
              }),
            _jsx('span', {
              className: 'min-w-0 truncate font-medium text-sm group-hover:underline',
              children: stringValue,
            }),
          ],
        })
      : _jsxs('div', {
          className: 'flex min-w-0 max-w-full items-center gap-2 px-1 py-0.5',
          children: [
            resolvedIcon &&
              _jsx('div', {
                className: cn('flex size-6 shrink-0 items-center justify-center rounded', resolvedIconBgClass),
                children: _jsx('span', { className: resolvedIconClass, children: resolvedIcon }),
              }),
            _jsx('span', { className: 'min-w-0 truncate font-medium text-sm', children: stringValue }),
          ],
        }),
  });
}
//# sourceMappingURL=EntityNameCell.js.map
