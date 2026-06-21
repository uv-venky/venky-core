/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
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
    if (Number.isNaN(date.getTime()))
        return dateStr;
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
export function DateCell({ attributeCode, formatDate = defaultFormatDate, className, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in DateCell');
    const value = useRowValue(store, row.id, attributeCode);
    if (!value) {
        return EMPTY_CELL;
    }
    const formatted = formatDate(value);
    return (_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: className, feedbackMask: feedbackMask, children: _jsx("span", { className: "text-sm", children: formatted }) }));
}
//# sourceMappingURL=DateCell.js.map