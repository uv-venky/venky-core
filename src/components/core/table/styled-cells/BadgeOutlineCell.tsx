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
import { EMPTY_CELL } from './shared';

export interface BadgeOutlineCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the field */
  attributeCode: StringKeyof<T>;
  /** Use monospace font */
  mono?: boolean;
  /** Additional badge classes */
  className?: string;
  feedbackMask?: boolean;
}

/**
 * Outline badge for short values like currency codes, categories.
 *
 * @example
 * ```tsx
 * // Currency code (monospace by default)
 * <BadgeOutlineCell attributeCode="currency" {...props} />
 *
 * // Category (no monospace)
 * <BadgeOutlineCell attributeCode="category" mono={false} {...props} />
 * ```
 */
export function BadgeOutlineCell<T extends object>({
  attributeCode,
  mono = true,
  className,
  feedbackMask,
  row,
}: BadgeOutlineCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in BadgeOutlineCell');

  const value = useRowValue(store, row.id, attributeCode);

  if (value == null || value === '') {
    return EMPTY_CELL;
  }

  const stringValue = String(value);

  return (
    <Cell attributeCode={attributeCode} store={store} rowId={row.id} feedbackMask={feedbackMask}>
      <Badge variant="outline" className={cn(mono && 'font-mono', className)}>
        {stringValue}
      </Badge>
    </Cell>
  );
}
