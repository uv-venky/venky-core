/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';

export interface DateRangeCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the start date field */
  startDateField: StringKeyof<T>;
  /** Attribute code for the end date field */
  endDateField: StringKeyof<T>;
  /** Display variant: "stacked" (From:/To: on separate lines) or "inline" (Jan 1 – Jan 31) */
  variant?: 'stacked' | 'inline';
  /** Label for start date (default: "From:" for stacked, "" for inline) */
  startLabel?: string;
  /** Label for end date (default: "To:" for stacked, "" for inline) */
  endLabel?: string;
  /** Separator for inline variant (default: " – ") */
  separator?: string;
  /** Date formatter function */
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
 * Date range cell displaying start and end dates.
 *
 * @example
 * ```tsx
 * // Stacked variant (default) - "From: Jan 1" / "To: Jan 31"
 * <DateRangeCell
 *   startDateField="startDate"
 *   endDateField="endDate"
 *   {...props}
 * />
 *
 * // Inline variant - "Jan 1 – Jan 31"
 * <DateRangeCell
 *   startDateField="effectiveFrom"
 *   endDateField="effectiveTo"
 *   variant="inline"
 *   {...props}
 * />
 *
 * // Custom labels (stacked)
 * <DateRangeCell
 *   startDateField="startDate"
 *   endDateField="endDate"
 *   startLabel="Start:"
 *   endLabel="End:"
 *   {...props}
 * />
 * ```
 */
export function DateRangeCell<T extends object>({
  startDateField,
  endDateField,
  variant = 'stacked',
  startLabel,
  endLabel,
  separator = ' – ',
  formatDate = defaultFormatDate,
  className,
  feedbackMask,
  row,
}: DateRangeCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in DateRangeCell');

  const startDate = useRowValue(store, row.id, startDateField) as string | null;
  const endDate = useRowValue(store, row.id, endDateField) as string | null;

  const start = startDate ? formatDate(startDate) : null;
  const end = endDate ? formatDate(endDate) : null;

  if (!start && !end) {
    return EMPTY_CELL;
  }

  // Inline variant: "Jan 1 – Jan 31" or "From Jan 1" or "Until Jan 31"
  if (variant === 'inline') {
    return (
      <Cell
        attributeCode={startDateField}
        store={store}
        rowId={row.id}
        className={className}
        feedbackMask={feedbackMask}
      >
        <span className="text-sm">
          {start && end ? (
            <>
              {start}
              {separator}
              {end}
            </>
          ) : start ? (
            <>From {start}</>
          ) : (
            <>Until {end}</>
          )}
        </span>
      </Cell>
    );
  }

  // Stacked variant (default): "From: Jan 1" / "To: Jan 31"
  const fromLabel = startLabel ?? 'From:';
  const toLabel = endLabel ?? 'To:';

  return (
    <Cell attributeCode={startDateField} store={store} rowId={row.id} className={className}>
      <div className="flex flex-col gap-0.5 text-xs">
        {start && (
          <span>
            <span className="text-muted-foreground">{fromLabel}</span> {start}
          </span>
        )}
        {end && (
          <span>
            <span className="text-muted-foreground">{toLabel}</span> {end}
          </span>
        )}
      </div>
    </Cell>
  );
}
