/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
/**
 * Monospace display for IDs, codes, and technical values.
 *
 * @example
 * ```tsx
 * // Default styling
 * <CodeCell attributeCode="taxId" {...props} />
 *
 * // Custom colors
 * <CodeCell
 *   attributeCode="referenceCode"
 *   bgClass="bg-blue-50 dark:bg-blue-900"
 *   textClass="text-blue-700 dark:text-blue-300"
 *   {...props}
 * />
 * ```
 */
export function CodeCell({ attributeCode, bgClass = 'bg-slate-100 dark:bg-slate-800', textClass = 'text-slate-700 dark:text-slate-300', className, truncate = true, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in CodeCell');
    const value = useRowValue(store, row.id, attributeCode);
    if (value == null || value === '') {
        return EMPTY_CELL;
    }
    const stringValue = String(value);
    return (_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: cn(truncate && 'max-w-full', className), feedbackMask: feedbackMask, children: _jsx("code", { className: cn('inline-block rounded px-2 py-1 font-medium font-mono text-xs', truncate && 'max-w-full truncate', bgClass, textClass), children: stringValue }) }));
}
//# sourceMappingURL=CodeCell.js.map