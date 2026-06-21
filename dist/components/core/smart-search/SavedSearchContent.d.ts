import type { SavedSearch } from '../../../lib/common/ds/types/core/SavedSearch';
type Props<T extends object> = {
    readOnly?: boolean;
    savedSearches: ReadonlyArray<SavedSearch<T>>;
    isLoading?: boolean;
    onDeleteView: (id: string) => Promise<void>;
    onUpdateView: (view: SavedSearch<T>) => Promise<void>;
    onSelectView: (view?: SavedSearch<T>) => void;
    onCreateView: (view: Exclude<SavedSearch<T>, 'id'>) => Promise<void>;
    forSmartSearch?: boolean;
    activeView?: SavedSearch<T>;
    stickyFilters?: (keyof T)[];
};
export default function SavedViewContent<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SavedSearchContent.d.ts.map