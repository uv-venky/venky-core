/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { NumericWithUnitsCell } from './NumericWithUnitsCell';
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
export function PercentageCell({ attributeCode, fractionDigits = 0, ...props }) {
    return _jsx(NumericWithUnitsCell, { attributeCode: attributeCode, unit: "%", fractionDigits: fractionDigits, ...props });
}
//# sourceMappingURL=PercentageCell.js.map