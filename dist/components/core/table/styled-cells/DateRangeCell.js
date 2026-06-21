/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { Fragment as _Fragment, jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
/**
 * Default date formatter - displays as "Jan 15, 2024"
 */
function defaultFormatDate(dateStr) {
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
export function DateRangeCell({
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
}) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in DateRangeCell');
  const startDate = useRowValue(store, row.id, startDateField);
  const endDate = useRowValue(store, row.id, endDateField);
  const start = startDate ? formatDate(startDate) : null;
  const end = endDate ? formatDate(endDate) : null;
  if (!start && !end) {
    return EMPTY_CELL;
  }
  // Inline variant: "Jan 1 – Jan 31" or "From Jan 1" or "Until Jan 31"
  if (variant === 'inline') {
    return _jsx(Cell, {
      attributeCode: startDateField,
      store: store,
      rowId: row.id,
      className: className,
      feedbackMask: feedbackMask,
      children: _jsx('span', {
        className: 'text-sm',
        children:
          start && end
            ? _jsxs(_Fragment, { children: [start, separator, end] })
            : start
              ? _jsxs(_Fragment, { children: ['From ', start] })
              : _jsxs(_Fragment, { children: ['Until ', end] }),
      }),
    });
  }
  // Stacked variant (default): "From: Jan 1" / "To: Jan 31"
  const fromLabel = startLabel ?? 'From:';
  const toLabel = endLabel ?? 'To:';
  return _jsx(Cell, {
    attributeCode: startDateField,
    store: store,
    rowId: row.id,
    className: className,
    children: _jsxs('div', {
      className: 'flex flex-col gap-0.5 text-xs',
      children: [
        start &&
          _jsxs('span', {
            children: [_jsx('span', { className: 'text-muted-foreground', children: fromLabel }), ' ', start],
          }),
        end &&
          _jsxs('span', {
            children: [_jsx('span', { className: 'text-muted-foreground', children: toLabel }), ' ', end],
          }),
      ],
    }),
  });
}
//# sourceMappingURL=DateRangeCell.js.map
