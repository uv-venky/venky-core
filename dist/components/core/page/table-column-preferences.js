/* Copyright (c) 2024-present Venky Corp. */
import { ACTIONS_COLUMN_ID } from '../../../components/core/table/actions-column-def';
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_TABLE_COLUMN_PREFERENCES = {
  tableVariant: 'default',
  stickyLeftCount: 0,
  stickyRightCount: 0,
};
export function createTableColumnPreferences(overrides) {
  return {
    ...DEFAULT_TABLE_COLUMN_PREFERENCES,
    ...overrides,
  };
}
/** Returns effective column id for TanStack Table (dots → underscores). */
export function getColumnId(column) {
  if (column.id) return column.id;
  const key = column.accessorKey;
  return key ? key.replaceAll('.', '_') : '';
}
function getMetaStickyColumnKeys(tableColumns) {
  const left = [];
  const right = [];
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
export function resolveEffectiveStickyColumns({ visibleColumnIds, tableColumns, preferences }) {
  const metaSticky = getMetaStickyColumnKeys(tableColumns);
  const metaLeftSet = new Set(metaSticky.left);
  const metaRightSet = new Set(metaSticky.right);
  const middleVisible = visibleColumnIds.filter((id) => !metaLeftSet.has(id) && !metaRightSet.has(id));
  const dynamicLeft = middleVisible.slice(0, preferences.stickyLeftCount);
  const dynamicRight = preferences.stickyRightCount > 0 ? middleVisible.slice(-preferences.stickyRightCount) : [];
  const dynamicRightSet = new Set(dynamicRight);
  const dynamicLeftFiltered = dynamicLeft.filter((id) => !dynamicRightSet.has(id));
  const leftOrdered = [];
  const rightOrdered = [];
  const leftSeen = new Set();
  const rightSeen = new Set();
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
export function isColumnStickyLeft(columnId, sticky) {
  return sticky.left.includes(columnId);
}
export function isColumnStickyRight(columnId, sticky) {
  return sticky.right.includes(columnId);
}
export function getTablePreferencesCustomPayload(table) {
  const meta = table.options.meta;
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
export function getDefaultPageSize(table) {
  const meta = table.options.meta;
  return meta.defaultPageSize ?? meta.store?.defaultLimit ?? DEFAULT_PAGE_SIZE;
}
/** Baseline table preferences for reset and saved-view fallbacks (from useTable / AppProvider). */
export function getDefaultTableColumnPreferences(table) {
  const meta = table.options.meta;
  return meta.defaultPreferences ?? DEFAULT_TABLE_COLUMN_PREFERENCES;
}
/** Page size from saved view custom payload, if present. */
export function getSavedViewPageSize(custom) {
  if (custom?.pageSize == null) return undefined;
  return Number(custom.pageSize);
}
/** Resolve page size when activating a saved view (saved value or table default). */
export function resolveSavedViewPageSize(table, custom) {
  return getSavedViewPageSize(custom) ?? getDefaultPageSize(table);
}
/** Update table pagination and store limit without triggering a query (use before executeQuery). */
export function syncTablePageSize(table, pageSize) {
  if (pageSize == null) return;
  const meta = table.options.meta;
  if (table.getState().pagination.pageSize !== pageSize) {
    table.setPageIndex(0);
    table.setPageSize(pageSize);
    meta.setPaginationPageSize?.(pageSize);
  }
  if (meta.store) {
    meta.store.limit = pageSize;
  }
}
export async function applyTablePageSize(table, pageSize) {
  if (table.getState().pagination.pageSize === pageSize) return;
  const meta = table.options.meta;
  table.setPageIndex(0);
  table.setPageSize(pageSize);
  meta.setPaginationPageSize?.(pageSize);
  await meta.store?.setLimit(pageSize);
}
/** Apply page size from a saved view; reverts to the table default when omitted. */
export function applySavedPageSize(table, pageSize) {
  return applyTablePageSize(table, pageSize ?? getDefaultPageSize(table));
}
export function applySavedTablePreferences(table, custom) {
  if (!custom) return;
  const meta = table.options.meta;
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
/** Read per-table preferences from a table created by `useTable`. */
export function getTablePreferences(table) {
  return table.options.meta.preferences;
}
/** Update per-table preferences without changing `useTable`'s return type. */
export function setTablePreferences(table, updater) {
  table.options.meta.setPreferences(updater);
}
//# sourceMappingURL=table-column-preferences.js.map
