import type { Filters, StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
import type { PivotSetting } from '../../../components/core/pivot/PivotTypes';
import type { Column, SavedSearchAction } from '../../../components/core/smart-search/types';
export declare function shouldExecuteSmartSearchQuery(filters: Filters<object> | undefined, action: SavedSearchAction): boolean;
export declare function PivotFilters<T extends object>({ store, settings, columns, pageId, itemId, border, roundedCorners, disableSavedSearches, onSearch, updateFilters, }: {
    store: Store<T>;
    settings: PivotSetting<StringKeyof<T>>;
    columns: Column<T>[];
    pageId: string;
    itemId: string;
    border?: 'full' | 'bottom' | 'none';
    roundedCorners?: boolean;
    disableSavedSearches?: boolean;
    updateFilters?: (filters: Filters<T>) => Filters<T>;
    onSearch: (props: {
        action: SavedSearchAction;
        filters?: Filters<T>;
        settings?: PivotSetting<StringKeyof<T>>;
    }) => Promise<void>;
}): import("react/jsx-runtime").JSX.Element;
export default function TableFilters<T extends object>({ store, table, columns, pageId, itemId, border, roundedCorners, disableSavedSearches, stickyFilters, searchOnBlur, updateFilters, enableNaturalLanguageSearch, nlPlaceholder, }: {
    store: Store<T>;
    table?: Table<T>;
    columns: Column<T>[];
    pageId: string;
    itemId: string;
    border?: 'full' | 'bottom' | 'none';
    roundedCorners?: boolean;
    disableSavedSearches?: boolean;
    stickyFilters?: (keyof T)[];
    searchOnBlur?: boolean;
    updateFilters?: (filters: Filters<T>) => Filters<T>;
    /** Per-page opt-in; passed through to SmartSearch (blocked when config sets `features.naturalLanguageSearch: false`). */
    enableNaturalLanguageSearch?: boolean;
    /** Placeholder for natural-language search mode. */
    nlPlaceholder?: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=filters.d.ts.map