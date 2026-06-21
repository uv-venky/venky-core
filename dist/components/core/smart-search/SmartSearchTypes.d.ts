import type { RefObject } from 'react';
import type { Path } from '../../../components/core/mutX/ImmutableTypes';
import type { Column, SavedSearchAction } from '../../../components/core/smart-search/types';
import type { Combiner, Filters, SingleFilter } from '../../../lib/core/common/ds/types/filter';
import type { SavedSearch, SavedSearchPayload } from '../../../lib/common/ds/types/core/SavedSearch';
export type ActiveSection = 'field' | 'operator' | 'value' | 'combiner';
/** Pending search to be executed via useEffect (avoids side effects in reducer) */
export interface PendingSearch<T extends object> {
    payload: SavedSearchPayload<T>;
    action: SavedSearchAction;
    /** Unique ID to trigger effect even for same payload/action */
    id: number;
}
export interface SmartSearchState<T extends object> {
    filters: Filters<T>;
    headerFilters?: SingleFilter<T>[];
    activePath: Path;
    showFilters: boolean;
    activeView?: SavedSearch<T>;
    searchOnBlur: boolean;
    onSearch: RefObject<(payload: SavedSearchPayload<T>, action: SavedSearchAction) => void>;
    activeSection?: ActiveSection;
    stickyFilters: (keyof T)[];
    editing: boolean;
    /** Pending search request - processed by useEffect in SmartSearchProvider */
    pendingSearch?: PendingSearch<T>;
}
export declare function INITIAL_STATE<T extends object>(): SmartSearchState<T>;
export type Action<T extends object> = Readonly<{
    type: 'clearSearch';
} | {
    type: 'setFilters';
    filters: Filters<T>;
} | {
    type: 'setActiveView';
    activeView?: SavedSearch<T>;
} | {
    type: 'setHeaderFilters';
    headerFilters?: SingleFilter<T>[];
} | {
    type: 'onSearchInputFocus';
} | {
    type: 'removeFilter';
    path: Path;
} | {
    type: 'removeNestedFilter';
    path: Path;
} | {
    type: 'editPath';
    path: Path;
    activeSection?: ActiveSection;
} | {
    type: 'setActivePath';
    path: Path;
} | {
    type: 'setMatchCase';
    path: Path;
    index: number;
    ignoreCase: boolean;
    column: Column<T, any>;
} | {
    type: 'setColumn';
    column: Column<T, any>;
    path: Path;
    index: number;
} | {
    type: 'newCombiner';
    path: Path;
    combiner: Combiner;
} | {
    type: 'setOperator';
    path: Path;
    index: number;
    operator: string;
    value: unknown;
    column: Column<T, any>;
} | {
    type: 'setValue';
    path: Path;
    index: number;
    operator: string;
    value: unknown;
    ignoreCase?: boolean;
    column: Column<T, any>;
    done?: boolean;
} | {
    type: 'setCombiner';
    path: Path;
    combiner: Combiner;
} | {
    type: 'onClickOutside';
} | {
    type: 'config';
    searchOnBlur?: boolean;
    onSearch: RefObject<(payload: SavedSearchPayload<T>, action: SavedSearchAction) => void>;
    stickyFilters?: (keyof T)[];
} | {
    type: 'addNestedFilter';
    path: Path;
} | {
    type: 'doSearch';
    reason: SavedSearchAction;
} | {
    type: 'setShowFilters';
    showFilters: boolean;
} | {
    type: 'navigateLeft';
} | {
    type: 'navigateRight';
} | {
    type: 'navigateToEnd';
} | {
    type: 'escape';
} | {
    type: 'clearPendingSearch';
}>;
export type DispatchFn<T extends object> = (action: Action<T>) => void;
export declare const COMBINER_OPTIONS: {
    label: string;
    value: Combiner;
    hint: string;
}[];
//# sourceMappingURL=SmartSearchTypes.d.ts.map