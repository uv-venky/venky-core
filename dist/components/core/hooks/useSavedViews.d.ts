import type { SavedSearch } from '../../../lib/common/ds/types/core/SavedSearch';
import type { NewRow } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
export default function useSavedViews<T extends object>(pageId: string, itemId: string, onDefaultView: ((row: SavedSearch<T>) => void) | undefined, dataStore: Store<any>): {
    savedSearches: SavedSearch<T>[];
    createSavedSearch: (item: NewRow<SavedSearch<T>>) => Promise<SavedSearch<T>>;
    updateSavedSearch: (item: SavedSearch<T>) => Promise<SavedSearch<T>>;
    deleteSavedSearch: (id: string) => Promise<SavedSearch<T> | undefined>;
    isLoading: boolean;
};
//# sourceMappingURL=useSavedViews.d.ts.map