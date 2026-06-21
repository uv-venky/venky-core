/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { useRowValue } from '../../../../components/core/hooks/useStoreHooks';
import { useCurrentStore } from '../../../../components/core/page/RowIdProvider';
import { assertExists } from '../../../../components/core/utils/assert';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/badge';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';
/**
 * Outline badge for short values like currency codes, categories.
 *
 * @example
 * ```tsx
 * // Currency code (monospace by default)
 * <BadgeOutlineCell attributeCode="currency" {...props} />
 *
 * // Category (no monospace)
 * <BadgeOutlineCell attributeCode="category" mono={false} {...props} />
 * ```
 */
export function BadgeOutlineCell({ attributeCode, mono = true, className, feedbackMask, row }) {
  const store = useCurrentStore();
  assertExists(store, 'Store not found in BadgeOutlineCell');
  const value = useRowValue(store, row.id, attributeCode);
  if (value == null || value === '') {
    return EMPTY_CELL;
  }
  const stringValue = String(value);
  return _jsx(Cell, {
    attributeCode: attributeCode,
    store: store,
    rowId: row.id,
    feedbackMask: feedbackMask,
    children: _jsx(Badge, { variant: 'outline', className: cn(mono && 'font-mono', className), children: stringValue }),
  });
}
//# sourceMappingURL=BadgeOutlineCell.js.map
