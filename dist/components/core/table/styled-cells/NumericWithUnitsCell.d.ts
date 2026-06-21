import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface NumericWithUnitsCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the numeric field */
    attributeCode: StringKeyof<T>;
    /** Unit label (e.g., "days", "%", "hrs") */
    unit?: string;
    /** Icon to display before value */
    icon?: ReactNode;
    /** Icon color class */
    iconClass?: string;
    /** Number of decimal places */
    fractionDigits?: number;
    /** Format as currency */
    currency?: boolean;
    /** Additional class names */
    className?: string;
    feedbackMask?: boolean;
}
/**
 * Numeric cell with optional icon and unit suffix.
 *
 * @example
 * ```tsx
 * // With icon and unit
 * <NumericWithUnitsCell
 *   attributeCode="paymentTermsDays"
 *   unit="days"
 *   icon={<Calendar className="size-3.5" />}
 *   {...props}
 * />
 *
 * // Percentage
 * <NumericWithUnitsCell
 *   attributeCode="allocationPercent"
 *   unit="%"
 *   fractionDigits={0}
 *   {...props}
 * />
 *
 * // Currency with rate
 * <NumericWithUnitsCell
 *   attributeCode="hourlyRate"
 *   currency
 *   unit="/hr"
 *   {...props}
 * />
 * ```
 */
export declare function NumericWithUnitsCell<T extends object>({ attributeCode, unit, icon, iconClass, fractionDigits, currency: isCurrency, className, feedbackMask, row, }: NumericWithUnitsCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=NumericWithUnitsCell.d.ts.map