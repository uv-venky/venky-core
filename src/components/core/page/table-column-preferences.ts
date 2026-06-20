/* Copyright (c) 2024-present Venky Corp. */

import { ACTIONS_COLUMN_ID } from '@/components/core/table/actions-column-def';
import type { TableVariant } from '@/components/core/common/types';
import type { SavedTableColumnCustom as SavedTableColumnCustomPayload } from '@/lib/common/ds/types/core/SavedTableColumnCustom';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import type { Dispatch, SetStateAction } from 'react';

export interface TableColumnPreferences {
  tableVariant: TableVariant;
  stickyLeftCount: 0 | 1 | 2 | 3;
  stickyRightCount: 0 | 1 | 2 | 3;
}

export type SavedTableColumnCustom = SavedTableColumnCustomPayload;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const DEFAULT_TABLE_COLUMN_PREFERENCES: TableColumnPreferences = {
  tableVariant: 'default',
  stickyLeftCount: 0,
  stickyRightCount: 0,
};

export function createTableColumnPreferences(overrides?: Partial<TableColumnPreferences>): TableColumnPreferences {
  return {
    ...DEFAULT_TABLE_COLUMN_PREFERENCES,
    ...overrides,
  };
}

/** Returns effective column id for TanStack Table (dots → underscores). */
export function getColumnId<T extends object>(column: AccessorKeyColumnDef<T>): string {
  if (column.id) return column.id;
  const key = column.accessorKey as string;
  return key ? key.replaceAll('.', '_') : '';
}

function getMetaStickyColumnKeys<T extends object>(
  tableColumns: AccessorKeyColumnDef<T>[],
): { left: string[]; right: string[] } {
  const left: string[] = [];
  const right: string[] = [];
  for (const column of tableColumns) {
    const id = getColumnId(column);
    if (!id) continue;
    if (column.meta?.sticky === 'left') left.push(id);
    else if (column.meta?.sticky === 'right') right.push(id);
  }
  const actionsIndex = right.indexOf(ACTIONS_COLUMN_ID);
  if (actionsIndex !== -1 && actionsIndex !== right.length - 1) {
    right.splice(actionsIndex, 1);
    right.push(ACTIONS_COLUMN_ID);
  }
  return { left, right };
}

/**
 * Resolves which column ids are sticky left/right, combining meta.sticky columns with
 * user-configured dynamic pinning (first N / last M visible middle columns).
 */
export function resolveEffectiveStickyColumns<T extends object>({
  visibleColumnIds,
  tableColumns,
  preferences,
}: {
  visibleColumnIds: string[];
  tableColumns: AccessorKeyColumnDef<T>[];
  preferences: TableColumnPreferences;
}): { left: string[]; right: string[] } {
  const metaSticky = getMetaStickyColumnKeys(tableColumns);
  const metaLeftSet = new Set(metaSticky.left);
  const metaRightSet = new Set(metaSticky.right);

  const middleVisible = visibleColumnIds.filter((id) => !metaLeftSet.has(id) && !metaRightSet.has(id));

  const dynamicLeft = middleVisible.slice(0, preferences.stickyLeftCount);
  const dynamicRight = preferences.stickyRightCount > 0 ? middleVisible.slice(-preferences.stickyRightCount) : [];

  const dynamicRightSet = new Set(dynamicRight);
  const dynamicLeftFiltered = dynamicLeft.filter((id) => !dynamicRightSet.has(id));

  const leftOrdered: string[] = [];
  const rightOrdered: string[] = [];
  const leftSeen = new Set<string>();
  const rightSeen = new Set<string>();

  for (const id of visibleColumnIds) {
    if ((metaLeftSet.has(id) || dynamicLeftFiltered.includes(id)) && !leftSeen.has(id)) {
      leftOrdered.push(id);
      leftSeen.add(id);
    }
  }

  for (let i = visibleColumnIds.length - 1; i >= 0; i--) {
    const id = visibleColumnIds[i];
    if ((metaRightSet.has(id) || dynamicRight.includes(id)) && !rightSeen.has(id) && !leftSeen.has(id)) {
      rightOrdered.unshift(id);
      rightSeen.add(id);
    }
  }

  // meta sticky columns not in visibleColumnIds still need pinning when hidden logic applies
  for (const id of metaSticky.left) {
    if (!leftSeen.has(id)) {
      leftOrdered.push(id);
      leftSeen.add(id);
    }
  }
  for (const id of metaSticky.right) {
    if (!rightSeen.has(id) && !leftSeen.has(id)) {
      rightOrdered.push(id);
      rightSeen.add(id);
    }
  }

  return { left: leftOrdered, right: rightOrdered };
}

export function isColumnStickyLeft(columnId: string, sticky: { left: string[]; right: string[] }): boolean {
  return sticky.left.includes(columnId);
}

export function isColumnStickyRight(columnId: string, sticky: { left: string[]; right: string[] }): boolean {
  return sticky.right.includes(columnId);
}

export function getTablePreferencesCustomPayload<T extends object>(table: Table<T>): SavedTableColumnCustom {
  const meta = table.options.meta as { preferences?: TableColumnPreferences };
  const { columnOrder, columnVisibility, columnSizing, pagination } = table.getState();
  const defaultPageSize = getDefaultPageSize(table);
  const pageSize = pagination.pageSize !== defaultPageSize ? pagination.pageSize : undefined;
  return {
    columnOrder,
    columnVisibility,
    columnSizing,
    tableVariant: meta.preferences?.tableVariant,
    stickyLeftCount: meta.preferences?.stickyLeftCount,
    stickyRightCount: meta.preferences?.stickyRightCount,
    pageSize,
  };
}

export function getDefaultPageSize<T extends object>(table: Table<T>): number {
  const meta = table.options.meta as { defaultPageSize?: number; store?: { defaultLimit?: number } };
  return meta.defaultPageSize ?? meta.store?.defaultLimit ?? DEFAULT_PAGE_SIZE;
}

/** Baseline table preferences for reset and saved-view fallbacks (from useTable / AppProvider). */
export function getDefaultTableColumnPreferences<T extends object>(table: Table<T>): TableColumnPreferences {
  const meta = table.options.meta as { defaultPreferences?: TableColumnPreferences };
  return meta.defaultPreferences ?? DEFAULT_TABLE_COLUMN_PREFERENCES;
}

/** Page size from saved view custom payload, if present. */
export function getSavedViewPageSize(custom?: SavedTableColumnCustom): number | undefined {
  if (custom?.pageSize == null) return undefined;
  return Number(custom.pageSize);
}

/** Resolve page size when activating a saved view (saved value or table default). */
export function resolveSavedViewPageSize<T extends object>(table: Table<T>, custom?: SavedTableColumnCustom): number {
  return getSavedViewPageSize(custom) ?? getDefaultPageSize(table);
}

/** Update table pagination and store limit without triggering a query (use before executeQuery). */
export function syncTablePageSize<T extends object>(table: Table<T>, pageSize?: number): void {
  if (pageSize == null) return;
  const meta = table.options.meta as {
    store?: { limit: number };
    setPaginationPageSize?: (pageSize: number) => void;
  };
  if (table.getState().pagination.pageSize !== pageSize) {
    table.setPageIndex(0);
    table.setPageSize(pageSize);
    meta.setPaginationPageSize?.(pageSize);
  }
  if (meta.store) {
    meta.store.limit = pageSize;
  }
}

export async function applyTablePageSize<T extends object>(table: Table<T>, pageSize: number): Promise<void> {
  if (table.getState().pagination.pageSize === pageSize) return;
  const meta = table.options.meta as {
    store?: { setLimit: (limit: number) => Promise<void> };
    setPaginationPageSize?: (pageSize: number) => void;
  };
  table.setPageIndex(0);
  table.setPageSize(pageSize);
  meta.setPaginationPageSize?.(pageSize);
  await meta.store?.setLimit(pageSize);
}

/** Apply page size from a saved view; reverts to the table default when omitted. */
export function applySavedPageSize<T extends object>(table: Table<T>, pageSize?: number): Promise<void> {
  return applyTablePageSize(table, pageSize ?? getDefaultPageSize(table));
}

export function applySavedTablePreferences<T extends object>(table: Table<T>, custom?: SavedTableColumnCustom): void {
  if (!custom) return;

  const meta = table.options.meta as {
    setPreferences?: Dispatch<SetStateAction<TableColumnPreferences>>;
    preferences?: TableColumnPreferences;
    updateProxy?: { count: number };
  };

  const defaults = getDefaultTableColumnPreferences(table);

  meta.setPreferences?.(
    createTableColumnPreferences({
      tableVariant: custom.tableVariant ?? defaults.tableVariant,
      stickyLeftCount: custom.stickyLeftCount ?? defaults.stickyLeftCount,
      stickyRightCount: custom.stickyRightCount ?? defaults.stickyRightCount,
    }),
  );

  if (meta.updateProxy) {
    meta.updateProxy.count++;
  }
}

type TablePreferencesMeta = {
  preferences: TableColumnPreferences;
  setPreferences: Dispatch<SetStateAction<TableColumnPreferences>>;
};

/** Read per-table preferences from a table created by `useTable`. */
export function getTablePreferences<T extends object>(table: Table<T>): TableColumnPreferences {
  return (table.options.meta as TablePreferencesMeta).preferences;
}

/** Update per-table preferences without changing `useTable`'s return type. */
export function setTablePreferences<T extends object>(
  table: Table<T>,
  updater: SetStateAction<TableColumnPreferences>,
): void {
  (table.options.meta as TablePreferencesMeta).setPreferences(updater);
}
