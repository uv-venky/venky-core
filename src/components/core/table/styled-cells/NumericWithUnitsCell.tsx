/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { ReactNode } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/components/core/utils/formatCurrency';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';

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
export function NumericWithUnitsCell<T extends object>({
  attributeCode,
  unit,
  icon,
  iconClass = 'text-slate-500',
  fractionDigits,
  currency: isCurrency,
  className,
  feedbackMask,
  row,
}: NumericWithUnitsCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in NumericWithUnitsCell');

  const value = useRowValue(store, row.id, attributeCode);

  if (value == null) {
    return EMPTY_CELL;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return EMPTY_CELL;
  }

  let displayValue: string;
  if (isCurrency) {
    displayValue = formatCurrency(numericValue);
  } else if (fractionDigits != null) {
    displayValue = formatNumber(numericValue, fractionDigits);
  } else {
    displayValue = String(numericValue);
  }

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
        <span className="font-medium tabular-nums">{displayValue}</span>
        {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
      </div>
    </Cell>
  );
}
