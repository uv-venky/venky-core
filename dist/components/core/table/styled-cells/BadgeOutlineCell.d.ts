import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface BadgeOutlineCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the field */
    attributeCode: StringKeyof<T>;
    /** Use monospace font */
    mono?: boolean;
    /** Additional badge classes */
    className?: string;
    feedbackMask?: boolean;
}
/**
 * Outline badge for short values like currency codes, categories.
 *
 * @example
 * ```tsx
 * // Currency code (monospace by default)
 * <BadgeOutlineCell attributeCode="currency" {...props} />
 *
 * // Category (no monospace)
 * <BadgeOutlineCell attributeCode="category" mono={false} {...props} />
 * ```
 */
export declare function BadgeOutlineCell<T extends object>({ attributeCode, mono, className, feedbackMask, row, }: BadgeOutlineCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=BadgeOutlineCell.d.ts.map