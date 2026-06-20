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

export interface CompoundCellProps<T extends object> extends CellContext<T, unknown> {
  /** Primary field (larger, main text) */
  primary: StringKeyof<T>;
  /** Secondary field (smaller, muted text) */
  secondary?: StringKeyof<T>;
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
export function CompoundCell<T extends object>({
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
}: CompoundCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in CompoundCell');

  const primaryValue = useRowValue(store, row.id, primary);
  const secondaryValue = useRowValue(store, row.id, secondary ?? ('' as StringKeyof<T>));

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

  const content = (
    <>
      {resolvedIcon && (
        <div className={cn('flex size-6 shrink-0 items-center justify-center rounded', resolvedIconBgClass)}>
          <span className={resolvedIconClass}>{resolvedIcon}</span>
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        {isClickable ? (
          <span className="truncate font-medium text-sm group-hover:underline">{primaryString}</span>
        ) : (
          <span className="truncate font-medium text-sm">{primaryString}</span>
        )}
        {secondaryString && <span className="truncate text-muted-foreground text-xs">{secondaryString}</span>}
      </div>
    </>
  );

  return (
    <Cell
      attributeCode={primary}
      store={store}
      rowId={row.id}
      className={cn('px-2 py-1', className)}
      feedbackMask={feedbackMask}
    >
      {isClickable ? (
        <button
          type="button"
          onClick={handleClick}
          className="group flex min-w-0 max-w-full cursor-pointer items-center gap-2 text-left"
        >
          {content}
        </button>
      ) : (
        <div className="flex min-w-0 max-w-full items-center gap-2">{content}</div>
      )}
    </Cell>
  );
}
