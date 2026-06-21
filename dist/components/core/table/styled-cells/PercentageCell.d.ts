import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../../lib/core/common/ds/types/filter';
export interface PercentageCellProps<T extends object> extends CellContext<T, unknown> {
    /** Attribute code for the percentage field */
    attributeCode: StringKeyof<T>;
    /** Number of decimal places (default: 0) */
    fractionDigits?: number;
}
/**
 * Convenience wrapper for percentage values.
 * Shorthand for NumericWithUnitsCell with unit="%".
 *
 * @example
 * ```tsx
 * <PercentageCell attributeCode="progress" {...props} />
 *
 * // With decimal places
 * <PercentageCell attributeCode="allocationPercent" fractionDigits={1} {...props} />
 * ```
 */
export declare function PercentageCell<T extends object>({ attributeCode, fractionDigits, ...props }: PercentageCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PercentageCell.d.ts.map