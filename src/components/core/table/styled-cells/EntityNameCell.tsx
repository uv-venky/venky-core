/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL, ENTITY_PRESETS, type EntityPreset } from './shared';

export interface EntityNameCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the name field */
  attributeCode: StringKeyof<T>;
  /** Preset entity type for icon and colors */
  preset?: EntityPreset;
  /** Custom icon component (overrides preset) */
  icon?: ReactNode;
  /** Background color class for icon container (overrides preset) */
  iconBgClass?: string;
  /** Icon color class (overrides preset) */
  iconClass?: string;
  /** Click handler - if provided, name becomes clickable */
  onClick?: (rowId: string) => void;
  /** Use table.options.meta?.onEdit instead of onClick */
  useTableOnEdit?: boolean;
  /** Additional class names for the cell */
  className?: string;
  feedbackMask?: boolean;
}

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
export function EntityNameCell<T extends object>({
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
}: EntityNameCellProps<T>) {
  const store = useCurrentStore<T>();
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

  return (
    <Cell
      attributeCode={attributeCode}
      store={store}
      rowId={row.id}
      className={cn('px-2 py-1', className)}
      feedbackMask={feedbackMask}
    >
      {isClickable ? (
        <button
          type="button"
          onClick={handleClick}
          className="group flex min-w-0 max-w-full cursor-pointer items-center gap-2 rounded px-1 py-0.5"
        >
          {resolvedIcon && (
            <div className={cn('flex size-6 shrink-0 items-center justify-center rounded', resolvedIconBgClass)}>
              <span className={resolvedIconClass}>{resolvedIcon}</span>
            </div>
          )}
          <span className="min-w-0 truncate font-medium text-sm group-hover:underline">{stringValue}</span>
        </button>
      ) : (
        <div className="flex min-w-0 max-w-full items-center gap-2 px-1 py-0.5">
          {resolvedIcon && (
            <div className={cn('flex size-6 shrink-0 items-center justify-center rounded', resolvedIconBgClass)}>
              <span className={resolvedIconClass}>{resolvedIcon}</span>
            </div>
          )}
          <span className="min-w-0 truncate font-medium text-sm">{stringValue}</span>
        </div>
      )}
    </Cell>
  );
}
