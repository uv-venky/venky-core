import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
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
export declare function DateRangeCell<T extends object>({ startDateField, endDateField, variant, startLabel, endLabel, separator, formatDate, className, feedbackMask, row, }: DateRangeCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DateRangeCell.d.ts.map