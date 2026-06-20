/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { Table, VisibilityState } from '@tanstack/react-table';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  applyTablePageSize,
  createTableColumnPreferences,
  getDefaultPageSize,
  getDefaultTableColumnPreferences,
  type TableColumnPreferences,
} from '@/components/core/page/table-column-preferences';
import { getDefaultColumnOrder, getDefaultColumnVisibility } from '@/components/core/page/useTable';

export type ColumnViewsTab = 'columns' | 'density' | 'sticky';

export interface ColumnViewsDraft {
  displayedColumnIds: string[];
  columnVisibility: Record<string, boolean>;
  preferences: TableColumnPreferences;
  pageSize: number;
}

interface ColumnViewsSnapshot {
  draft: ColumnViewsDraft;
  columnOrder: string[];
  columnVisibility: VisibilityState;
}

function getHideableColumnOptions<T extends object>(table: Table<T>) {
  return table
    .getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      value: column.id,
      label: (column.columnDef.meta as { label?: string })?.label ?? column.id,
    }));
}

function buildDisplayedColumnIds<T extends object>(table: Table<T>): string[] {
  const { columnOrder, columnVisibility } = table.getState();
  const options = getHideableColumnOptions(table);
  const optionSet = new Set(options.map((o) => o.value));
  return columnOrder.filter((id) => {
    if (!optionSet.has(id)) return false;
    if (id in columnVisibility) return columnVisibility[id] !== false;
    return true;
  });
}

function buildDraftFromTableState<T extends object>(
  table: Table<T>,
  preferences: TableColumnPreferences,
): ColumnViewsDraft {
  const { columnVisibility, pagination } = table.getState();
  const visibility: Record<string, boolean> = {};
  for (const column of table.getAllColumns()) {
    if (!column.getCanHide()) continue;
    visibility[column.id] = columnVisibility[column.id] !== false;
  }
  return {
    displayedColumnIds: buildDisplayedColumnIds(table),
    columnVisibility: visibility,
    preferences: { ...preferences },
    pageSize: pagination.pageSize,
  };
}

export function createDraftFromTable<T extends object>(
  table: Table<T>,
  preferences: TableColumnPreferences,
): ColumnViewsDraft {
  return buildDraftFromTableState(table, preferences);
}

function createSnapshot<T extends object>(table: Table<T>, preferences: TableColumnPreferences): ColumnViewsSnapshot {
  const { columnOrder, columnVisibility } = table.getState();
  return {
    draft: buildDraftFromTableState(table, preferences),
    columnOrder: [...columnOrder],
    columnVisibility: { ...columnVisibility },
  };
}

function bumpTableUpdate<T extends object>(table: Table<T>) {
  const meta = table.options.meta as { updateProxy: { count: number }; resizeProxy?: { count: number } };
  meta.updateProxy.count++;
  if (meta.resizeProxy) {
    meta.resizeProxy.count++;
  }
}

function applyDraftToTable<T extends object>(
  table: Table<T>,
  draft: ColumnViewsDraft,
  onPreferencesChange: (prefs: TableColumnPreferences) => void,
) {
  const { columnOrder } = table.getState();
  const displayedSet = new Set(draft.displayedColumnIds);

  for (const column of table.getAllColumns()) {
    if (!column.getCanHide()) continue;
    const shouldShow = displayedSet.has(column.id);
    if (column.getIsVisible() !== shouldShow) {
      column.toggleVisibility(shouldShow);
    }
  }

  const hiddenIds = columnOrder.filter((id) => !displayedSet.has(id));
  table.setColumnOrder([...draft.displayedColumnIds, ...hiddenIds]);
  onPreferencesChange(draft.preferences);
  bumpTableUpdate(table);
}

async function restoreSnapshot<T extends object>(
  table: Table<T>,
  snapshot: ColumnViewsSnapshot,
  onPreferencesChange: (prefs: TableColumnPreferences) => void,
) {
  table.setColumnOrder(snapshot.columnOrder);
  table.setColumnVisibility(snapshot.columnVisibility);
  onPreferencesChange(snapshot.draft.preferences);
  await applyTablePageSize(table, snapshot.draft.pageSize);
  bumpTableUpdate(table);
}

function resolveDefaultPreferences<T extends object>(
  table: Table<T>,
  defaultPreferences?: Partial<TableColumnPreferences>,
): TableColumnPreferences {
  const baseline = getDefaultTableColumnPreferences(table);
  return defaultPreferences ? createTableColumnPreferences({ ...baseline, ...defaultPreferences }) : baseline;
}

function applyDefaultColumnsState<T extends object>(
  table: Table<T>,
  defaultPreferences?: Partial<TableColumnPreferences>,
  keepPreferences?: TableColumnPreferences,
  keepPageSize?: number,
): ColumnViewsDraft {
  const meta = table.options.meta as {
    tableColumns?: Parameters<typeof getDefaultColumnOrder>[0];
    defaultVisibleColumnOrder?: Parameters<typeof getDefaultColumnOrder>[1];
  };
  const tableColumns = meta.tableColumns ?? [];
  const defaultVisibleColumnOrder = meta.defaultVisibleColumnOrder;
  table.setColumnOrder(getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder));
  table.setColumnVisibility(getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder));
  const preferences = keepPreferences ?? resolveDefaultPreferences(table, defaultPreferences);
  const draft = buildDraftFromTableState(table, preferences);
  return keepPageSize != null ? { ...draft, pageSize: keepPageSize } : draft;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function isColumnsTabDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean {
  if (!arraysEqual(baseline.displayedColumnIds, draft.displayedColumnIds)) return true;
  const keys = new Set([...Object.keys(baseline.columnVisibility), ...Object.keys(draft.columnVisibility)]);
  for (const key of keys) {
    if (baseline.columnVisibility[key] !== draft.columnVisibility[key]) return true;
  }
  return false;
}

export function isDensityTabDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean {
  return baseline.preferences.tableVariant !== draft.preferences.tableVariant || baseline.pageSize !== draft.pageSize;
}

export function isStickyTabDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean {
  return (
    baseline.preferences.stickyLeftCount !== draft.preferences.stickyLeftCount ||
    baseline.preferences.stickyRightCount !== draft.preferences.stickyRightCount
  );
}

export function isSessionDraftDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean {
  return isColumnsTabDirty(baseline, draft) || isDensityTabDirty(baseline, draft) || isStickyTabDirty(baseline, draft);
}

function buildDefaultDraft<T extends object>(
  table: Table<T>,
  defaultPreferences?: Partial<TableColumnPreferences>,
): ColumnViewsDraft {
  const meta = table.options.meta as {
    tableColumns?: Parameters<typeof getDefaultColumnOrder>[0];
    defaultVisibleColumnOrder?: Parameters<typeof getDefaultColumnOrder>[1];
  };
  const tableColumns = meta.tableColumns ?? [];
  const defaultVisibleColumnOrder = meta.defaultVisibleColumnOrder;
  const defaultOrder = getDefaultColumnOrder(tableColumns, defaultVisibleColumnOrder);
  const defaultVisibility = getDefaultColumnVisibility(tableColumns, defaultVisibleColumnOrder);
  const preferences = resolveDefaultPreferences(table, defaultPreferences);
  const pageSize = getDefaultPageSize(table);

  const options = getHideableColumnOptions(table);
  const optionSet = new Set(options.map((o) => o.value));
  const displayedColumnIds = defaultOrder.filter((id) => {
    if (!optionSet.has(id)) return false;
    if (id in defaultVisibility) return defaultVisibility[id] !== false;
    return true;
  });

  const columnVisibility: Record<string, boolean> = {};
  for (const column of table.getAllColumns()) {
    if (!column.getCanHide()) continue;
    columnVisibility[column.id] = defaultVisibility[column.id] !== false;
  }

  return {
    displayedColumnIds,
    columnVisibility,
    preferences,
    pageSize,
  };
}

/** True when the table state at dialog open differs from page defaults (saved/applied customization). */
export function hasPersistedTableCustomization<T extends object>(
  table: Table<T>,
  snapshot: ColumnViewsSnapshot,
  defaultPreferences?: Partial<TableColumnPreferences>,
): boolean {
  const defaultDraft = buildDefaultDraft(table, defaultPreferences);
  return isSessionDraftDirty(defaultDraft, snapshot.draft);
}

export function useColumnViewsDraft<T extends object>({
  table,
  preferences,
  onPreferencesChange,
  defaultPreferences,
}: {
  table: Table<T>;
  preferences: TableColumnPreferences;
  onPreferencesChange: (prefs: TableColumnPreferences) => void;
  defaultPreferences?: Partial<TableColumnPreferences>;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ColumnViewsTab>('columns');
  const [draft, setDraft] = useState<ColumnViewsDraft>(() => createDraftFromTable(table, preferences));
  const [isPageSizeBusy, setIsPageSizeBusy] = useState(false);
  const sessionStartRef = useRef<ColumnViewsSnapshot>(createSnapshot(table, preferences));
  const sessionActiveRef = useRef(false);
  const applyingRef = useRef(false);

  const columnOptions = useMemo(() => getHideableColumnOptions(table), [table]);

  const updateDraft = useCallback(
    (updater: ColumnViewsDraft | ((prev: ColumnViewsDraft) => ColumnViewsDraft)) => {
      setDraft((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        applyDraftToTable(table, next, onPreferencesChange);
        return next;
      });
    },
    [table, onPreferencesChange],
  );

  const updatePageSize = useCallback(
    async (pageSize: number) => {
      setIsPageSizeBusy(true);
      try {
        await applyTablePageSize(table, pageSize);
        setDraft((prev) => ({ ...prev, pageSize }));
      } finally {
        setIsPageSizeBusy(false);
      }
    },
    [table],
  );

  const replaceDraft = useCallback((next: ColumnViewsDraft) => {
    setDraft(next);
  }, []);

  const openPopover = useCallback(() => {
    const currentPreferences =
      (table.options.meta as { preferences?: TableColumnPreferences }).preferences ?? preferences;
    if (!sessionActiveRef.current) {
      sessionStartRef.current = createSnapshot(table, currentPreferences);
      sessionActiveRef.current = true;
    }
    setDraft(buildDraftFromTableState(table, currentPreferences));
    setActiveTab('columns');
    setOpen(true);
  }, [table, preferences]);

  const revertToSessionStart = useCallback(async () => {
    setIsPageSizeBusy(true);
    try {
      await restoreSnapshot(table, sessionStartRef.current, onPreferencesChange);
      setDraft(sessionStartRef.current.draft);
    } finally {
      setIsPageSizeBusy(false);
    }
  }, [table, onPreferencesChange]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openPopover();
        return;
      }
      if (applyingRef.current) {
        applyingRef.current = false;
        setOpen(false);
        return;
      }
      setOpen(false);
    },
    [openPopover],
  );

  const handleCancel = useCallback(() => {
    void revertToSessionStart();
    sessionActiveRef.current = false;
    setOpen(false);
  }, [revertToSessionStart]);

  const handleApply = useCallback(() => {
    sessionStartRef.current = createSnapshot(table, draft.preferences);
    sessionActiveRef.current = false;
    applyingRef.current = true;
    setOpen(false);
  }, [table, draft.preferences]);

  const handleResetTab = useCallback(
    (tab: ColumnViewsTab) => {
      if (tab === 'columns') {
        setDraft((prev) => {
          const nextDraft = applyDefaultColumnsState(table, defaultPreferences, prev.preferences, prev.pageSize);
          onPreferencesChange(prev.preferences);
          bumpTableUpdate(table);
          return nextDraft;
        });
        return;
      }
      if (tab === 'density') {
        const defaultPageSize = getDefaultPageSize(table);
        const resolvedDefaults = resolveDefaultPreferences(table, defaultPreferences);
        void (async () => {
          setIsPageSizeBusy(true);
          try {
            await applyTablePageSize(table, defaultPageSize);
            updateDraft((prev) => ({
              ...prev,
              pageSize: defaultPageSize,
              preferences: {
                ...prev.preferences,
                tableVariant: resolvedDefaults.tableVariant,
              },
            }));
          } finally {
            setIsPageSizeBusy(false);
          }
        })();
        return;
      }
      const resolvedDefaults = resolveDefaultPreferences(table, defaultPreferences);
      updateDraft((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          stickyLeftCount: resolvedDefaults.stickyLeftCount,
          stickyRightCount: resolvedDefaults.stickyRightCount,
        },
      }));
    },
    [defaultPreferences, table, updateDraft, onPreferencesChange],
  );

  const handleResetAll = useCallback(() => {
    const preferences = resolveDefaultPreferences(table, defaultPreferences);
    const defaultPageSize = getDefaultPageSize(table);
    void (async () => {
      setIsPageSizeBusy(true);
      try {
        const nextDraft = applyDefaultColumnsState(table, defaultPreferences, preferences, defaultPageSize);
        onPreferencesChange(preferences);
        await applyTablePageSize(table, defaultPageSize);
        bumpTableUpdate(table);
        replaceDraft({ ...nextDraft, pageSize: defaultPageSize });
        sessionStartRef.current = createSnapshot(table, preferences);
      } finally {
        setIsPageSizeBusy(false);
      }
    })();
  }, [defaultPreferences, table, replaceDraft, onPreferencesChange]);

  const baseline = sessionStartRef.current.draft;
  const columnsDirty = open && isColumnsTabDirty(baseline, draft);
  const densityDirty = open && isDensityTabDirty(baseline, draft);
  const stickyDirty = open && isStickyTabDirty(baseline, draft);
  const sessionDirty = open && isSessionDraftDirty(baseline, draft);
  const resetDisabled =
    !open || isPageSizeBusy || !hasPersistedTableCustomization(table, sessionStartRef.current, defaultPreferences);
  const applyDisabled = !open || isPageSizeBusy || !sessionDirty;

  return {
    open,
    activeTab,
    setActiveTab,
    draft,
    updateDraft,
    updatePageSize,
    isPageSizeBusy,
    columnOptions,
    handleOpenChange,
    handleCancel,
    handleApply,
    handleResetTab,
    handleResetAll,
    columnsDirty,
    densityDirty,
    stickyDirty,
    applyDisabled,
    resetDisabled,
  };
}
