import type { Table, VisibilityState } from '@tanstack/react-table';
import { type TableColumnPreferences } from '../../../components/core/page/table-column-preferences';
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
export declare function createDraftFromTable<T extends object>(table: Table<T>, preferences: TableColumnPreferences): ColumnViewsDraft;
export declare function isColumnsTabDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean;
export declare function isDensityTabDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean;
export declare function isStickyTabDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean;
export declare function isSessionDraftDirty(baseline: ColumnViewsDraft, draft: ColumnViewsDraft): boolean;
/** True when the table state at dialog open differs from page defaults (saved/applied customization). */
export declare function hasPersistedTableCustomization<T extends object>(table: Table<T>, snapshot: ColumnViewsSnapshot, defaultPreferences?: Partial<TableColumnPreferences>): boolean;
export declare function useColumnViewsDraft<T extends object>({ table, preferences, onPreferencesChange, defaultPreferences, }: {
    table: Table<T>;
    preferences: TableColumnPreferences;
    onPreferencesChange: (prefs: TableColumnPreferences) => void;
    defaultPreferences?: Partial<TableColumnPreferences>;
}): {
    open: boolean;
    activeTab: ColumnViewsTab;
    setActiveTab: import("react").Dispatch<import("react").SetStateAction<ColumnViewsTab>>;
    draft: ColumnViewsDraft;
    updateDraft: (updater: ColumnViewsDraft | ((prev: ColumnViewsDraft) => ColumnViewsDraft)) => void;
    updatePageSize: (pageSize: number) => Promise<void>;
    isPageSizeBusy: boolean;
    columnOptions: {
        value: string;
        label: string;
    }[];
    handleOpenChange: (nextOpen: boolean) => void;
    handleCancel: () => void;
    handleApply: () => void;
    handleResetTab: (tab: ColumnViewsTab) => void;
    handleResetAll: () => void;
    columnsDirty: boolean;
    densityDirty: boolean;
    stickyDirty: boolean;
    applyDisabled: boolean;
    resetDisabled: boolean;
};
export {};
//# sourceMappingURL=use-column-views-draft.d.ts.map