import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface LabelMapping {
    /** Display label */
    label: string;
    /** Badge styling class */
    className?: string;
}
export interface LabelMappedBadgeCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the field */
    attributeCode: StringKeyof<T>;
    /** Map raw values to display labels and styles */
    labelMap: Record<string, LabelMapping>;
    /** Fallback styling for unmapped values */
    defaultClassName?: string;
    /** Additional class names for the cell */
    cellClassName?: string;
    feedbackMask?: boolean;
}
/**
 * Badge cell with value-to-label transformation.
 * Use when the stored value differs from the display label.
 *
 * @example
 * ```tsx
 * <LabelMappedBadgeCell
 *   attributeCode="billingType"
 *   labelMap={{
 *     FB: { label: 'Fixed Bid', className: 'bg-blue-500/10 text-blue-700' },
 *     'T&M': { label: 'Time & Material', className: 'bg-purple-500/10 text-purple-700' },
 *     MF: { label: 'Monthly Fixed', className: 'bg-teal-500/10 text-teal-700' },
 *   }}
 *   {...props}
 * />
 * ```
 */
export declare function LabelMappedBadgeCell<T extends object>({ attributeCode, labelMap, defaultClassName, cellClassName, feedbackMask, row, }: LabelMappedBadgeCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LabelMappedBadgeCell.d.ts.map