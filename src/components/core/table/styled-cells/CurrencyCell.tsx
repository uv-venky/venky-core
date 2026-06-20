/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';

export interface CurrencyCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the amount field */
  attributeCode: StringKeyof<T>;
  /** Attribute code for the currency field (e.g., 'budgetCurrency') */
  currencyField?: StringKeyof<T>;
  /** Static currency code (used if currencyField not provided) */
  currency?: string;
  /** Icon to display before value */
  icon?: ReactNode;
  /** Icon color class */
  iconClass?: string;
  /** Number of decimal places (default: 0) */
  fractionDigits?: number;
  /** Unit suffix (e.g., "/hr", "/mo") */
  unit?: string;
  /** Additional class names */
  className?: string;
  feedbackMask?: boolean;
}

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
export function CurrencyCell<T extends object>({
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
}: CurrencyCellProps<T>) {
  const store = useCurrentStore<T>();
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
  const currencyCode = currencyField ? (currencyValue as string) || staticCurrency : staticCurrency;

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numericValue);

  return (
    <Cell
      attributeCode={attributeCode}
      store={store}
      rowId={row.id}
      className={cn('justify-end', className)}
      feedbackMask={feedbackMask}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className={cn('shrink-0', iconClass)}>{icon}</span>}
        <span className="font-medium tabular-nums">{formatted}</span>
        {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
      </div>
    </Cell>
  );
}
