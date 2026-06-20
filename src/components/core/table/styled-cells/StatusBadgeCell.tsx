/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Cell } from '../table-cell';
import { EMPTY_CELL, STATUS_DEFAULTS, type StatusConfig } from './shared';

export interface StatusBadgeCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the status field */
  attributeCode: StringKeyof<T>;
  /** Map status values to Badge styling */
  statusConfig?: Record<string, StatusConfig>;
  /** Default config when status not in map */
  defaultConfig?: StatusConfig;
  /** Additional class names for the cell */
  cellClassName?: string;
  feedbackMask?: boolean;
}

/**
 * Status badge cell with semantic color mapping.
 *
 * @example
 * ```tsx
 * // With custom config
 * <StatusBadgeCell
 *   attributeCode="status"
 *   statusConfig={{
 *     Active: { variant: 'success' },
 *     Inactive: { variant: 'secondary' },
 *   }}
 *   {...props}
 * />
 *
 * // With default styling (auto-detects common statuses)
 * <StatusBadgeCell attributeCode="status" {...props} />
 * ```
 */
export function StatusBadgeCell<T extends object>({
  attributeCode,
  statusConfig,
  defaultConfig = { variant: 'secondary' },
  cellClassName,
  feedbackMask,
  row,
}: StatusBadgeCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in StatusBadgeCell');

  const value = useRowValue(store, row.id, attributeCode);

  if (value == null || value === '') {
    return EMPTY_CELL;
  }

  const stringValue = String(value);
  const config = statusConfig?.[stringValue] ?? STATUS_DEFAULTS[stringValue] ?? defaultConfig;
  const { variant, className } = config;

  return (
    <Cell
      attributeCode={attributeCode}
      store={store}
      rowId={row.id}
      className={cellClassName}
      feedbackMask={feedbackMask}
    >
      <Badge variant={variant} className={cn(className)}>
        {stringValue}
      </Badge>
    </Cell>
  );
}
