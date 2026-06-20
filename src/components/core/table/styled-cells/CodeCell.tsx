/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { cn } from '@/lib/utils';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';

export interface CodeCellProps<T extends object> extends CellContext<T, unknown> {
  /** Attribute code for the field */
  attributeCode: StringKeyof<T>;
  /** Custom background class */
  bgClass?: string;
  /** Custom text class */
  textClass?: string;
  /** Additional class names for the container */
  className?: string;
  /** Enable text truncation with ellipsis (default: false) */
  truncate?: boolean;
  feedbackMask?: boolean;
}

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
export function CodeCell<T extends object>({
  attributeCode,
  bgClass = 'bg-slate-100 dark:bg-slate-800',
  textClass = 'text-slate-700 dark:text-slate-300',
  className,
  truncate = true,
  feedbackMask,
  row,
}: CodeCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in CodeCell');

  const value = useRowValue(store, row.id, attributeCode);

  if (value == null || value === '') {
    return EMPTY_CELL;
  }

  const stringValue = String(value);

  return (
    <Cell
      attributeCode={attributeCode}
      store={store}
      rowId={row.id}
      className={cn(truncate && 'max-w-full', className)}
      feedbackMask={feedbackMask}
    >
      <code
        className={cn(
          'inline-block rounded px-2 py-1 font-medium font-mono text-xs',
          truncate && 'max-w-full truncate',
          bgClass,
          textClass,
        )}
      >
        {stringValue}
      </code>
    </Cell>
  );
}
