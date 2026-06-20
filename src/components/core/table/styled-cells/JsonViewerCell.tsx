/* Copyright (c) 2024-present Venky Corp. */

'use client';

import JsonPreview, { type JsonTheme } from '@/components/core/common/json-preview';
import { useRowValue } from '@/components/core/hooks/useStoreHooks';
import { Popup } from '@/components/core/page/popup';
import { useCurrentStore } from '@/components/core/page/RowIdProvider';
import { assertExists } from '@/components/core/utils/assert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { CellContext } from '@tanstack/react-table';
import { Braces } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import { Cell } from '../table-cell';
import { EMPTY_CELL } from './shared';

export interface JsonViewerCellProps<T extends object> extends CellContext<T, unknown> {
  attributeCode: StringKeyof<T>;
  /** Title shown on the JSON viewer dialog */
  viewerTitle: string;
  className?: string;
  feedbackMask?: boolean;
}

/** Normalize DB/API JSON values (object or JSON string) for tree viewers. */
export function normalizeJsonForViewer(raw: unknown): unknown | null {
  if (raw == null) {
    return null;
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t === '') {
      return null;
    }
    try {
      return JSON.parse(t) as unknown;
    } catch {
      return raw;
    }
  }
  return raw;
}

/**
 * Table cell that opens a tree JSON viewer (JsonPreview) for object/array/primitive or JSON strings.
 */
export function JsonViewerCell<T extends object>({
  attributeCode,
  viewerTitle,
  className,
  feedbackMask,
  row,
}: JsonViewerCellProps<T>) {
  const store = useCurrentStore<T>();
  assertExists(store, 'Store not found in JsonViewerCell');

  const raw = useRowValue(store, row.id, attributeCode);
  const data = useMemo(() => normalizeJsonForViewer(raw), [raw]);
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const jsonTheme: JsonTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  if (data == null) {
    return EMPTY_CELL;
  }

  return (
    <>
      <Cell
        attributeCode={attributeCode}
        store={store}
        rowId={row.id}
        className={cn('min-w-0', className)}
        feedbackMask={feedbackMask}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => setOpen(true)}
        >
          <Braces className="size-3.5 shrink-0" />
          View
        </Button>
      </Cell>
      {open ? (
        <Popup
          title={viewerTitle}
          onClose={() => setOpen(false)}
          width={760}
          height={560}
          minWidth={400}
          minHeight={280}
          bodyClassName="flex min-h-0 flex-col overflow-hidden pb-4"
        >
          <JsonPreview value={data} theme={jsonTheme} className="max-h-none min-h-0 flex-1" />
        </Popup>
      ) : null}
    </>
  );
}
