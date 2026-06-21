import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface CodeCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the field */
    attributeCode: StringKeyof<T>;
    /** Custom background class */
    bgClass?: string;
    /** Custom text class */
    textClass?: string;
    /** Additional class names for the container */
    className?: string;
    /** Enable text truncation with ellipsis (default: false) */
    truncate?: boolean;
    feedbackMask?: boolean;
}
/**
 * Monospace display for IDs, codes, and technical values.
 *
 * @example
 * ```tsx
 * // Default styling
 * <CodeCell attributeCode="taxId" {...props} />
 *
 * // Custom colors
 * <CodeCell
 *   attributeCode="referenceCode"
 *   bgClass="bg-blue-50 dark:bg-blue-900"
 *   textClass="text-blue-700 dark:text-blue-300"
 *   {...props}
 * />
 * ```
 */
export declare function CodeCell<T extends object>({ attributeCode, bgClass, textClass, className, truncate, feedbackMask, row, }: CodeCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CodeCell.d.ts.map