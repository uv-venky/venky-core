import { type DispatchFn, type SmartSearchState } from '../../../components/core/smart-search/SmartSearchTypes';
import type { Column, SavedSearchAction } from '../../../components/core/smart-search/types';
import { type FilterEntry, type Filters, type SingleFilter } from '../../../lib/core/common/ds/types/filter';
import type { SavedSearchPayload } from '../../../lib/common/ds/types/core/SavedSearch';
export declare function useSmartSearchState<T extends object>(): SmartSearchState<T>;
export declare function useSmartSearchDispatcher<T extends object>(): DispatchFn<T>;
export declare function SmartSearchProvider<T extends object>(props: {
    children: React.ReactNode;
    filters?: Filters<T>;
    headerFilters?: SingleFilter<T>[];
    searchOnBlur?: boolean;
    stickyFilters?: (keyof T)[];
    onSearch: (payload: SavedSearchPayload<T>, action: SavedSearchAction) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function useSmartSearchColumns<T extends object, O extends object>(): Column<T, O>[];
export declare function SmartSearchColumnsProvider<T extends object, O extends object>(props: {
    children: React.ReactNode;
    columns: ReadonlyArray<Column<T, O>>;
}): import("react/jsx-runtime").JSX.Element;
export declare function isComplete<T extends Record<string, unknown>>(filter: FilterEntry<T>): boolean;
//# sourceMappingURL=context.d.ts.map