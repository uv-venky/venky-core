/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
/**
 * Badge cell with value-to-label transformation.
 * Use when the stored value differs from the display label.
 *
 * @example
 * ```tsx
 * <LabelMappedBadgeCell
 *   attributeCode="billingType"
 *   labelMap={{
 *     FB: { label: 'Fixed Bid', className: 'bg-blue-500/10 text-blue-700' },
 *     'T&M': { label: 'Time & Material', className: 'bg-purple-500/10 text-purple-700' },
 *     MF: { label: 'Monthly Fixed', className: 'bg-teal-500/10 text-teal-700' },
 *   }}
 *   {...props}
 * />
 * ```
 */
export function LabelMappedBadgeCell({ attributeCode, labelMap, defaultClassName = '', cellClassName, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in LabelMappedBadgeCell');
    const value = useRowValue(store, row.id, attributeCode);
    if (value == null || value === '') {
        return EMPTY_CELL;
    }
    const stringValue = String(value);
    const mapping = labelMap[stringValue];
    const displayLabel = mapping?.label ?? stringValue;
    const badgeClassName = mapping?.className ?? defaultClassName;
    return (_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: cellClassName, feedbackMask: feedbackMask, children: _jsx(Badge, { variant: "secondary", className: cn(badgeClassName), children: displayLabel }) }));
}
//# sourceMappingURL=LabelMappedBadgeCell.js.map