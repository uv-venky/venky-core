/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { Cell } from '../table-cell';

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
export function BooleanYesNoCell<T extends object>({
  attributeCode,
  trueLabel = 'Yes',
  falseLabel = 'No',
  nullAsFalse = true,
  checkedAsNegative = false,
  className,
  feedbackMask,
  row,
}: BooleanYesNoCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in BooleanYesNoCell');

  const value = useRowValue(store, row.id, attributeCode);

  // Normalize value to boolean
  const boolValue = value === true || value === 'true' || value === 1 || value === '1';
  const isNull = value == null;

  // If null and not treating as false, show empty
  if (isNull && !nullAsFalse) {
    return <div className={cn('px-2 py-1 text-muted-foreground text-xs', className)}>—</div>;
  }

  if (boolValue) {
    const negative = checkedAsNegative;
    return (
      <Cell
        attributeCode={attributeCode}
        store={store}
        rowId={row.id}
        className={cn('justify-center', className)}
        feedbackMask={feedbackMask}
      >
        <div className="flex items-center justify-center gap-1.5">
          {negative ? (
            <>
              <div className="flex size-5 items-center justify-center rounded-full bg-destructive/10">
                <Check className="size-3 text-destructive" />
              </div>
              <span className="text-destructive text-sm">{trueLabel}</span>
            </>
          ) : (
            <>
              <div className="flex size-5 items-center justify-center rounded-full bg-green-500/10">
                <Check className="size-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-green-700 text-sm dark:text-green-400">{trueLabel}</span>
            </>
          )}
        </div>
      </Cell>
    );
  }

  return (
    <Cell attributeCode={attributeCode} store={store} rowId={row.id} className={cn('justify-center', className)}>
      <div className="flex items-center justify-center gap-1.5">
        <div className="flex size-5 items-center justify-center rounded-full bg-slate-500/10">
          <X className="size-3 text-slate-400" />
        </div>
        <span className="text-muted-foreground text-sm">{falseLabel}</span>
      </div>
    </Cell>
  );
}
