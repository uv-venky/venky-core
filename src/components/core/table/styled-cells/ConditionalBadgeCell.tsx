/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Cell } from '../table-cell';

export interface ConditionalBadgeCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the boolean/flag field */
  attributeCode: StringKeyof<T>;
  /** Label to show when truthy */
  label: string;
  /** Badge variant */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  /** Additional badge class names */
  className?: string;
  feedbackMask?: boolean;
}

/**
 * Badge cell that only displays when the value is truthy.
 * Use for flag fields like "isPreliminary", "isFeatured", etc.
 *
 * @example
 * ```tsx
 * <ConditionalBadgeCell
 *   attributeCode="isPreliminary"
 *   label="Preliminary"
 *   variant="outline"
 *   className="border-amber-500 text-amber-600"
 *   {...props}
 * />
 *
 * <ConditionalBadgeCell
 *   attributeCode="isFeatured"
 *   label="Featured"
 *   variant="default"
 *   className="bg-blue-600"
 *   {...props}
 * />
 * ```
 */
export function ConditionalBadgeCell<T extends object>({
  attributeCode,
  label,
  variant = 'outline',
  className,
  feedbackMask,
  row,
}: ConditionalBadgeCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in ConditionalBadgeCell');

  const value = useRowValue(store, row.id, attributeCode);

  // Only show badge when truthy
  const isTruthy =
    value === true ||
    value === 'true' ||
    value === 1 ||
    value === '1' ||
    (typeof value === 'string' && value.length > 0);

  if (!isTruthy) {
    return <div className="px-2 py-1" />;
  }

  return (
    <Cell attributeCode={attributeCode} store={store} rowId={row.id} feedbackMask={feedbackMask}>
      <Badge variant={variant} className={cn(className)}>
        {label}
      </Badge>
    </Cell>
  );
}
