import type { SavedSearch } from '../../../lib/common/ds/types/core/SavedSearch';
type Props<T extends object> = {
    readOnly?: boolean;
    savedSearches: ReadonlyArray<SavedSearch<T>>;
    isLoading: boolean;
    onDeleteView: (id: string) => Promise<SavedSearch<T> | undefined>;
    onUpdateView: (view: SavedSearch<T>) => Promise<SavedSearch<T>>;
    onCreateView: (view: Exclude<SavedSearch<T>, 'id'>) => Promise<SavedSearch<T>>;
    stickyFilters?: (keyof T)[];
};
export default function SavedSearchComponent<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SavedSearch.d.ts.map