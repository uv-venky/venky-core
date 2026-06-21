/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Check, X } from 'lucide-react';
import { Cell } from '../table-cell';
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
export function BooleanYesNoCell({
  attributeCode,
  trueLabel = 'Yes',
  falseLabel = 'No',
  nullAsFalse = true,
  checkedAsNegative = false,
  className,
  feedbackMask,
  row,
}) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in BooleanYesNoCell');
  const value = useRowValue(store, row.id, attributeCode);
  // Normalize value to boolean
  const boolValue = value === true || value === 'true' || value === 1 || value === '1';
  const isNull = value == null;
  // If null and not treating as false, show empty
  if (isNull && !nullAsFalse) {
    return _jsx('div', { className: cn('px-2 py-1 text-muted-foreground text-xs', className), children: '\u2014' });
  }
  if (boolValue) {
    const negative = checkedAsNegative;
    return _jsx(Cell, {
      attributeCode: attributeCode,
      store: store,
      rowId: row.id,
      className: cn('justify-center', className),
      feedbackMask: feedbackMask,
      children: _jsx('div', {
        className: 'flex items-center justify-center gap-1.5',
        children: negative
          ? _jsxs(_Fragment, {
              children: [
                _jsx('div', {
                  className: 'flex size-5 items-center justify-center rounded-full bg-destructive/10',
                  children: _jsx(Check, { className: 'size-3 text-destructive' }),
                }),
                _jsx('span', { className: 'text-destructive text-sm', children: trueLabel }),
              ],
            })
          : _jsxs(_Fragment, {
              children: [
                _jsx('div', {
                  className: 'flex size-5 items-center justify-center rounded-full bg-green-500/10',
                  children: _jsx(Check, { className: 'size-3 text-green-600 dark:text-green-400' }),
                }),
                _jsx('span', { className: 'text-green-700 text-sm dark:text-green-400', children: trueLabel }),
              ],
            }),
      }),
    });
  }
  return _jsx(Cell, {
    attributeCode: attributeCode,
    store: store,
    rowId: row.id,
    className: cn('justify-center', className),
    children: _jsxs('div', {
      className: 'flex items-center justify-center gap-1.5',
      children: [
        _jsx('div', {
          className: 'flex size-5 items-center justify-center rounded-full bg-slate-500/10',
          children: _jsx(X, { className: 'size-3 text-slate-400' }),
        }),
        _jsx('span', { className: 'text-muted-foreground text-sm', children: falseLabel }),
      ],
    }),
  });
}
//# sourceMappingURL=BooleanYesNoCell.js.map
