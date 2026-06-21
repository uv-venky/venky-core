import type { SavedSearch } from '../../../lib/common/ds/types/core/SavedSearch';
type Props<T extends object> = {
    view: SavedSearch<T>;
    activeView?: SavedSearch<T>;
    onDeleteView: (id: string) => Promise<void>;
    onSelectView: (view?: SavedSearch<T>) => void;
};
export default function SavedViewItem<T extends object>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SavedViewItem.d.ts.map