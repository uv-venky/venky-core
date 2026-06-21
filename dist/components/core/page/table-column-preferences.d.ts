import type { TableVariant } from '../../../components/core/common/types';
import type { SavedTableColumnCustom as SavedTableColumnCustomPayload } from '../../../lib/common/ds/types/core/SavedTableColumnCustom';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import type { SetStateAction } from 'react';
export interface TableColumnPreferences {
    tableVariant: TableVariant;
    stickyLeftCount: 0 | 1 | 2 | 3;
    stickyRightCount: 0 | 1 | 2 | 3;
}
export type SavedTableColumnCustom = SavedTableColumnCustomPayload;
export declare const PAGE_SIZE_OPTIONS: readonly [10, 20, 50, 100, 200];
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const DEFAULT_TABLE_COLUMN_PREFERENCES: TableColumnPreferences;
export declare function createTableColumnPreferences(overrides?: Partial<TableColumnPreferences>): TableColumnPreferences;
/** Returns effective column id for TanStack Table (dots → underscores). */
export declare function getColumnId<T extends object>(column: AccessorKeyColumnDef<T>): string;
/**
 * Resolves which column ids are sticky left/right, combining meta.sticky columns with
 * user-configured dynamic pinning (first N / last M visible middle columns).
 */
export declare function resolveEffectiveStickyColumns<T extends object>({ visibleColumnIds, tableColumns, preferences, }: {
    visibleColumnIds: string[];
    tableColumns: AccessorKeyColumnDef<T>[];
    preferences: TableColumnPreferences;
}): {
    left: string[];
    right: string[];
};
export declare function isColumnStickyLeft(columnId: string, sticky: {
    left: string[];
    right: string[];
}): boolean;
export declare function isColumnStickyRight(columnId: string, sticky: {
    left: string[];
    right: string[];
}): boolean;
export declare function getTablePreferencesCustomPayload<T extends object>(table: Table<T>): SavedTableColumnCustom;
export declare function getDefaultPageSize<T extends object>(table: Table<T>): number;
/** Baseline table preferences for reset and saved-view fallbacks (from useTable / AppProvider). */
export declare function getDefaultTableColumnPreferences<T extends object>(table: Table<T>): TableColumnPreferences;
/** Page size from saved view custom payload, if present. */
export declare function getSavedViewPageSize(custom?: SavedTableColumnCustom): number | undefined;
/** Resolve page size when activating a saved view (saved value or table default). */
export declare function resolveSavedViewPageSize<T extends object>(table: Table<T>, custom?: SavedTableColumnCustom): number;
/** Update table pagination and store limit without triggering a query (use before executeQuery). */
export declare function syncTablePageSize<T extends object>(table: Table<T>, pageSize?: number): void;
export declare function applyTablePageSize<T extends object>(table: Table<T>, pageSize: number): Promise<void>;
/** Apply page size from a saved view; reverts to the table default when omitted. */
export declare function applySavedPageSize<T extends object>(table: Table<T>, pageSize?: number): Promise<void>;
export declare function applySavedTablePreferences<T extends object>(table: Table<T>, custom?: SavedTableColumnCustom): void;
/** Read per-table preferences from a table created by `useTable`. */
export declare function getTablePreferences<T extends object>(table: Table<T>): TableColumnPreferences;
/** Update per-table preferences without changing `useTable`'s return type. */
export declare function setTablePreferences<T extends object>(table: Table<T>, updater: SetStateAction<TableColumnPreferences>): void;
//# sourceMappingURL=table-column-preferences.d.ts.map