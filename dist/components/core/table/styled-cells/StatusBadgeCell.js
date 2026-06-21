/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/badge';
import { Cell } from '../table-cell';
import { EMPTY_CELL, STATUS_DEFAULTS } from './shared';
/**
 * Status badge cell with semantic color mapping.
 *
 * @example
 * ```tsx
 * // With custom config
 * <StatusBadgeCell
 *   attributeCode="status"
 *   statusConfig={{
 *     Active: { variant: 'success' },
 *     Inactive: { variant: 'secondary' },
 *   }}
 *   {...props}
 * />
 *
 * // With default styling (auto-detects common statuses)
 * <StatusBadgeCell attributeCode="status" {...props} />
 * ```
 */
export function StatusBadgeCell({ attributeCode, statusConfig, defaultConfig = { variant: 'secondary' }, cellClassName, feedbackMask, row, }) {
    const store = useCurrentStore();
    assertExists(store, 'Store not found in StatusBadgeCell');
    const value = useRowValue(store, row.id, attributeCode);
    if (value == null || value === '') {
        return EMPTY_CELL;
    }
    const stringValue = String(value);
    const config = statusConfig?.[stringValue] ?? STATUS_DEFAULTS[stringValue] ?? defaultConfig;
    const { variant, className } = config;
    return (_jsx(Cell, { attributeCode: attributeCode, store: store, rowId: row.id, className: cellClassName, feedbackMask: feedbackMask, children: _jsx(Badge, { variant: variant, className: cn(className), children: stringValue }) }));
}
//# sourceMappingURL=StatusBadgeCell.js.map