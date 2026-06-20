/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';

export interface DateCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the date field */
  attributeCode: StringKeyof<T>;
  /** Date formatter function (default: "Jan 15, 2024") */
  formatDate?: (date: string) => string;
  /** Additional class names */
  className?: string;
  feedbackMask?: boolean;
}

/**
 * Default date formatter - displays as "Jan 15, 2024"
 */
function defaultFormatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  // Use UTC to avoid timezone shifts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/**
 * Simple date cell with formatted display.
 *
 * @example
 * ```tsx
 * // Default format (Jan 15, 2024)
 * <DateCell attributeCode="invoiceDate" {...props} />
 *
 * // Custom formatter
 * <DateCell
 *   attributeCode="dueDate"
 *   formatDate={(d) => format(new Date(d), 'MMM d, yyyy')}
 *   {...props}
 * />
 * ```
 */
export function DateCell<T extends object>({
  attributeCode,
  formatDate = defaultFormatDate,
  className,
  feedbackMask,
  row,
}: DateCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in DateCell');

  const value = useRowValue(store, row.id, attributeCode) as string | null;

  if (!value) {
    return EMPTY_CELL;
  }

  const formatted = formatDate(value);

  return (
    <Cell attributeCode={attributeCode} store={store} rowId={row.id} className={className} feedbackMask={feedbackMask}>
      <span className="text-sm">{formatted}</span>
    </Cell>
  );
}
