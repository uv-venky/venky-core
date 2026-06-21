/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { formatCurrency, formatNumber } from '../../../../components/core/utils/formatCurrency';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
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
export function NumericWithUnitsCell({ attributeCode, unit, icon, iconClass = 'text-slate-500', fractionDigits, currency: isCurrency, className, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in NumericWithUnitsCell');
    const value = useRowValue(store, row.id, attributeCode);
    if (value == null) {
        return EMPTY_CELL;
    }
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numericValue)) {
        return EMPTY_CELL;
    }
    let displayValue;
    if (isCurrency) {
        displayValue = formatCurrency(numericValue);
    }
    else if (fractionDigits != null) {
        displayValue = formatNumber(numericValue, fractionDigits);
    }
    else {
        displayValue = String(numericValue);
    }
    return (_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: cn('justify-end', className), feedbackMask: feedbackMask, children: _jsxs("div", { className: "flex items-center gap-1.5", children: [icon && _jsx("span", { className: cn('shrink-0', iconClass), children: icon }), _jsx("span", { className: "font-medium tabular-nums", children: displayValue }), unit && _jsx("span", { className: "text-muted-foreground text-xs", children: unit })] }) }));
}
//# sourceMappingURL=NumericWithUnitsCell.js.map