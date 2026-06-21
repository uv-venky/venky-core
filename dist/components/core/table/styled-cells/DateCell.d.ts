import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
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
export declare function DateCell<T extends object>({ attributeCode, formatDate, className, feedbackMask, row, }: DateCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DateCell.d.ts.map