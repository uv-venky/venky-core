import type { SavedSearch } from '../../../lib/common/ds/types/core/SavedSearch';
type Props<T extends object> = {
    onClose: () => void;
    onCreate: (view: SavedSearch<T>) => Promise<void>;
    onUpdate: (view: SavedSearch<T>) => Promise<void>;
    view: SavedSearch<T>;
    forSmartSearch?: boolean;
    stickyFilters?: (keyof T)[];
};
export default function SavedSearchPopup<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SavedSearchPopup.d.ts.map