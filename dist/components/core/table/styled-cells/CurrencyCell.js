/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
/**
 * Currency cell with dynamic currency code from another field.
 *
 * @example
 * ```tsx
 * // Dynamic currency from row field
 * <CurrencyCell
 *   attributeCode="budgetAmount"
 *   currencyField="budgetCurrency"
 *   icon={<Banknote className="size-3.5" />}
 *   {...props}
 * />
 *
 * // Static currency
 * <CurrencyCell
 *   attributeCode="amount"
 *   currency="USD"
 *   {...props}
 * />
 *
 * // Hourly rate with unit suffix
 * <CurrencyCell
 *   attributeCode="hourlyRate"
 *   currencyField="currency"
 *   unit="/hr"
 *   icon={<Banknote className="size-3.5" />}
 *   {...props}
 * />
 * ```
 */
export function CurrencyCell({
  attributeCode,
  currencyField,
  currency: staticCurrency = 'USD',
  icon,
  iconClass = 'text-emerald-600',
  fractionDigits = 0,
  unit,
  className,
  feedbackMask,
  row,
}) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in CurrencyCell');
  const value = useRowValue(store, row.id, attributeCode);
  // Always call hook unconditionally, use attributeCode as fallback when currencyField not provided
  const currencyValue = useRowValue(store, row.id, currencyField ?? attributeCode);
  if (value == null) {
    return EMPTY_CELL;
  }
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return EMPTY_CELL;
  }
  // Use currencyField value only if currencyField was provided, otherwise use static currency
  const currencyCode = currencyField ? currencyValue || staticCurrency : staticCurrency;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numericValue);
  return _jsx(Cell, {
    attributeCode: attributeCode,
    store: store,
    rowId: row.id,
    className: cn('justify-end', className),
    feedbackMask: feedbackMask,
    children: _jsxs('div', {
      className: 'flex items-center gap-1.5',
      children: [
        icon && _jsx('span', { className: cn('shrink-0', iconClass), children: icon }),
        _jsx('span', { className: 'font-medium tabular-nums', children: formatted }),
        unit && _jsx('span', { className: 'text-muted-foreground text-xs', children: unit }),
      ],
    }),
  });
}
//# sourceMappingURL=CurrencyCell.js.map
