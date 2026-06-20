/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it, vi } from 'vitest';
import {
  applySavedPageSize,
  applySavedTablePreferences,
  applyTablePageSize,
  createTableColumnPreferences,
  getTablePreferencesCustomPayload,
  resolveSavedViewPageSize,
  syncTablePageSize,
} from '@/components/core/page/table-column-preferences';
import { resetTableColumnLayout } from '@/components/core/page/useTable';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';

function createMockTable(
  preferences = createTableColumnPreferences(),
  pageSize = 20,
  defaultPreferences = preferences,
) {
  const setPreferences = vi.fn();
  const updateProxy = { count: 0 };
  const table = {
    getState: () => ({
      columnOrder: ['a', 'b'],
      columnVisibility: { a: true, b: false },
      columnSizing: { a: 100 },
      pagination: { pageSize, pageIndex: 0 },
    }),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    options: {
      meta: {
        preferences,
        defaultPreferences,
        setPreferences,
        updateProxy,
        defaultPageSize: 20,
        store: { setLimit: vi.fn().mockResolvedValue(undefined) },
      },
    },
  } as unknown as Table<object>;
  return { table, setPreferences, updateProxy };
}

describe('getTablePreferencesCustomPayload', () => {
  it('includes column layout, density/sticky preferences, and page size', () => {
    const preferences = createTableColumnPreferences({
      tableVariant: 'compact',
      stickyLeftCount: 2,
      stickyRightCount: 1,
    });
    const { table } = createMockTable(preferences, 50);
    expect(getTablePreferencesCustomPayload(table)).toEqual({
      columnOrder: ['a', 'b'],
      columnVisibility: { a: true, b: false },
      columnSizing: { a: 100 },
      tableVariant: 'compact',
      stickyLeftCount: 2,
      stickyRightCount: 1,
      pageSize: 50,
    });
  });

  it('omits page size when it matches the table default', () => {
    const { table } = createMockTable();
    expect(getTablePreferencesCustomPayload(table).pageSize).toBeUndefined();
  });
});

describe('syncTablePageSize', () => {
  it('updates table pagination and store limit without calling setLimit', () => {
    const setLimit = vi.fn().mockResolvedValue(undefined);
    const store = { limit: 20, setLimit };
    const table = {
      getState: () => ({ pagination: { pageSize: 20, pageIndex: 2 } }),
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      options: { meta: { store } },
    } as unknown as Table<object>;

    syncTablePageSize(table, 100);

    expect(table.setPageIndex).toHaveBeenCalledWith(0);
    expect(table.setPageSize).toHaveBeenCalledWith(100);
    expect(store.limit).toBe(100);
    expect(setLimit).not.toHaveBeenCalled();
  });

  it('syncs store limit even when table page size is unchanged', () => {
    const store = { limit: 20, setLimit: vi.fn() };
    const table = {
      getState: () => ({ pagination: { pageSize: 50, pageIndex: 0 } }),
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      options: { meta: { store } },
    } as unknown as Table<object>;

    syncTablePageSize(table, 50);

    expect(table.setPageIndex).not.toHaveBeenCalled();
    expect(table.setPageSize).not.toHaveBeenCalled();
    expect(store.limit).toBe(50);
  });
});

describe('applyTablePageSize', () => {
  it('updates table pagination and store limit when page size changes', async () => {
    const setLimit = vi.fn().mockResolvedValue(undefined);
    const table = {
      getState: () => ({ pagination: { pageSize: 20, pageIndex: 2 } }),
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      options: { meta: { store: { setLimit } } },
    } as unknown as Table<object>;

    await applyTablePageSize(table, 100);

    expect(table.setPageIndex).toHaveBeenCalledWith(0);
    expect(table.setPageSize).toHaveBeenCalledWith(100);
    expect(setLimit).toHaveBeenCalledWith(100);
  });

  it('skips store update when page size is unchanged', async () => {
    const setLimit = vi.fn().mockResolvedValue(undefined);
    const table = {
      getState: () => ({ pagination: { pageSize: 50, pageIndex: 0 } }),
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      options: { meta: { store: { setLimit } } },
    } as unknown as Table<object>;

    await applyTablePageSize(table, 50);

    expect(table.setPageIndex).not.toHaveBeenCalled();
    expect(table.setPageSize).not.toHaveBeenCalled();
    expect(setLimit).not.toHaveBeenCalled();
  });
});

describe('resolveSavedViewPageSize', () => {
  it('uses saved page size when present', () => {
    const { table } = createMockTable();
    expect(resolveSavedViewPageSize(table, { pageSize: 10 })).toBe(10);
  });

  it('falls back to the table default when saved page size is omitted', () => {
    const { table } = createMockTable(createTableColumnPreferences(), 50);
    expect(resolveSavedViewPageSize(table, { columnOrder: ['a'] })).toBe(20);
  });
});

describe('applySavedPageSize', () => {
  it('reverts to the table default when page size is omitted', async () => {
    const { table } = createMockTable(createTableColumnPreferences(), 50);
    const meta = table.options.meta as unknown as {
      store: { setLimit: ReturnType<typeof vi.fn> };
    };
    await applySavedPageSize(table, undefined);
    expect(table.setPageSize).toHaveBeenCalledWith(20);
    expect(meta.store.setLimit).toHaveBeenCalledWith(20);
  });
});

describe('resetTableColumnLayout', () => {
  it('restores default column order, visibility, sizing, preferences, and page size', async () => {
    const setPreferences = vi.fn();
    const setLimit = vi.fn().mockResolvedValue(undefined);
    const updateProxy = { count: 0 };
    const tableColumns = [{ accessorKey: 'name', id: 'name' }] as AccessorKeyColumnDef<object>[];
    const defaultPreferences = createTableColumnPreferences({ tableVariant: 'spacious' });
    const table = {
      getState: () => ({ pagination: { pageSize: 100, pageIndex: 0 } }),
      setColumnOrder: vi.fn(),
      setColumnVisibility: vi.fn(),
      resetColumnSizing: vi.fn(),
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      options: {
        meta: {
          tableColumns,
          defaultVisibleColumnOrder: undefined,
          defaultPageSize: 20,
          defaultPreferences,
          setPreferences,
          updateProxy,
          store: { setLimit },
        },
      },
    } as unknown as Table<object>;

    await resetTableColumnLayout(table);

    expect(table.setColumnOrder).toHaveBeenCalled();
    expect(table.setColumnVisibility).toHaveBeenCalled();
    expect(table.resetColumnSizing).toHaveBeenCalled();
    expect(setPreferences).toHaveBeenCalledWith(defaultPreferences);
    expect(table.setPageSize).toHaveBeenCalledWith(20);
    expect(setLimit).toHaveBeenCalledWith(20);
    expect(updateProxy.count).toBe(1);
  });
});

describe('applySavedTablePreferences', () => {
  it('applies density and sticky from saved view', () => {
    const { table, setPreferences } = createMockTable(
      createTableColumnPreferences({ tableVariant: 'spacious', stickyLeftCount: 3, stickyRightCount: 2 }),
    );
    applySavedTablePreferences(table, {
      tableVariant: 'compact',
      stickyLeftCount: 1,
      stickyRightCount: 0,
    });
    expect(setPreferences).toHaveBeenCalledWith(
      createTableColumnPreferences({
        tableVariant: 'compact',
        stickyLeftCount: 1,
        stickyRightCount: 0,
      }),
    );
  });

  it('resets density and sticky to table defaults when older views omit them', () => {
    const defaultPreferences = createTableColumnPreferences({ tableVariant: 'spacious' });
    const { table, setPreferences } = createMockTable(
      createTableColumnPreferences({ tableVariant: 'roomy', stickyLeftCount: 2, stickyRightCount: 1 }),
      20,
      defaultPreferences,
    );
    applySavedTablePreferences(table, { columnOrder: ['a'] });
    expect(setPreferences).toHaveBeenCalledWith(defaultPreferences);
  });
});
