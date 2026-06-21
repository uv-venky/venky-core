import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface BooleanYesNoCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the boolean field */
    attributeCode: StringKeyof<T>;
    /** Label for true value (default: "Yes") */
    trueLabel?: string;
    /** Label for false value (default: "No") */
    falseLabel?: string;
    /** Treat null/undefined as false (default: true) */
    nullAsFalse?: boolean;
    /** When true, show the checked (Yes) state with negative/destructive styling (e.g. for "Locked") */
    checkedAsNegative?: boolean;
    /** Additional class names */
    className?: string;
    feedbackMask?: boolean;
}
/**
 * Boolean cell displaying styled Yes/No with icons.
 *
 * @example
 * ```tsx
 * // Default Yes/No
 * <BooleanYesNoCell attributeCode="expensesAllowed" {...props} />
 *
 * // Custom labels
 * <BooleanYesNoCell
 *   attributeCode="isActive"
 *   trueLabel="Enabled"
 *   falseLabel="Disabled"
 *   {...props}
 * />
 *
 * // Checked (Yes) shown as negative, e.g. for "Locked"
 * <BooleanYesNoCell attributeCode="locked" checkedAsNegative {...props} />
 * ```
 */
export declare function BooleanYesNoCell<T extends object>({ attributeCode, trueLabel, falseLabel, nullAsFalse, checkedAsNegative, className, feedbackMask, row, }: BooleanYesNoCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=BooleanYesNoCell.d.ts.map