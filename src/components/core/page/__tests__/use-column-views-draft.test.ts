/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it } from 'vitest';
import {
  createTableColumnPreferences,
  type TableColumnPreferences,
} from '@/components/core/page/table-column-preferences';
import {
  createDraftFromTable,
  hasPersistedTableCustomization,
  isSessionDraftDirty,
  type ColumnViewsDraft,
} from '@/components/core/page/use-column-views-draft';
import type { Table } from '@tanstack/react-table';

const defaultPreferences = createTableColumnPreferences({ tableVariant: 'spacious' });

function createMockTable(preferences: TableColumnPreferences = defaultPreferences, pageSize = 20) {
  const columns = [
    { id: 'name', getCanHide: () => true, columnDef: { meta: { label: 'Name' } } },
    { id: 'status', getCanHide: () => true, columnDef: { meta: { label: 'Status' } } },
  ];
  return {
    getAllColumns: () => columns,
    getState: () => ({
      columnOrder: ['name', 'status'],
      columnVisibility: { name: true, status: true },
      pagination: { pageSize, pageIndex: 0 },
    }),
    options: {
      meta: {
        tableColumns: [
          { accessorKey: 'name', id: 'name' },
          { accessorKey: 'status', id: 'status' },
        ],
        defaultVisibleColumnOrder: undefined,
        defaultPreferences,
        defaultPageSize: pageSize,
        preferences,
      },
    },
  } as unknown as Table<object>;
}

function createSnapshotDraft(table: Table<object>, preferences: TableColumnPreferences): ColumnViewsDraft {
  return createDraftFromTable(table, preferences);
}

describe('isSessionDraftDirty', () => {
  it('returns false when draft matches session baseline', () => {
    const baseline: ColumnViewsDraft = {
      displayedColumnIds: ['name', 'status'],
      columnVisibility: { name: true, status: true },
      preferences: defaultPreferences,
      pageSize: 20,
    };
    expect(isSessionDraftDirty(baseline, { ...baseline })).toBe(false);
  });

  it('returns true when density changed in session', () => {
    const baseline: ColumnViewsDraft = {
      displayedColumnIds: ['name', 'status'],
      columnVisibility: { name: true, status: true },
      preferences: defaultPreferences,
      pageSize: 20,
    };
    const draft: ColumnViewsDraft = {
      ...baseline,
      preferences: { ...defaultPreferences, tableVariant: 'compact' },
    };
    expect(isSessionDraftDirty(baseline, draft)).toBe(true);
  });
});

describe('hasPersistedTableCustomization', () => {
  it('returns false when session snapshot matches page defaults', () => {
    const table = createMockTable();
    const snapshot = {
      draft: createSnapshotDraft(table, defaultPreferences),
      columnOrder: ['name', 'status'],
      columnVisibility: { name: true, status: true },
    };
    expect(hasPersistedTableCustomization(table, snapshot)).toBe(false);
  });

  it('returns true when session snapshot has non-default density', () => {
    const table = createMockTable();
    const customized = createTableColumnPreferences({ tableVariant: 'compact' });
    const snapshot = {
      draft: createSnapshotDraft(table, customized),
      columnOrder: ['name', 'status'],
      columnVisibility: { name: true, status: true },
    };
    expect(hasPersistedTableCustomization(table, snapshot)).toBe(true);
  });
});
