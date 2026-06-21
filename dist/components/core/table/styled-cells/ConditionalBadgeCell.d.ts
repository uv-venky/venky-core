import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
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
export declare function ConditionalBadgeCell<T extends object>({ attributeCode, label, variant, className, feedbackMask, row, }: ConditionalBadgeCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ConditionalBadgeCell.d.ts.map