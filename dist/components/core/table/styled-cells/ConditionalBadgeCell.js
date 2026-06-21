/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { Cell } from '../table-cell';
/**
 * Badge cell that only displays when the value is truthy.
 * Use for flag fields like "isPreliminary", "isFeatured", etc.
 *
 * @example
 * ```tsx
 * <ConditionalBadgeCell
 *   attributeCode="isPreliminary"
 *   label="Preliminary"
 *   variant="outline"
 *   className="border-amber-500 text-amber-600"
 *   {...props}
 * />
 *
 * <ConditionalBadgeCell
 *   attributeCode="isFeatured"
 *   label="Featured"
 *   variant="default"
 *   className="bg-blue-600"
 *   {...props}
 * />
 * ```
 */
export function ConditionalBadgeCell({ attributeCode, label, variant = 'outline', className, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in ConditionalBadgeCell');
    const value = useRowValue(store, row.id, attributeCode);
    // Only show badge when truthy
    const isTruthy = value === true ||
        value === 'true' ||
        value === 1 ||
        value === '1' ||
        (typeof value === 'string' && value.length > 0);
    if (!isTruthy) {
        return _jsx("div", { className: "px-2 py-1" });
    }
    return (_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, feedbackMask: feedbackMask, children: _jsx(Badge, { variant: variant, className: cn(className), children: label }) }));
}
//# sourceMappingURL=ConditionalBadgeCell.js.map