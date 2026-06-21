import { type SearchInputMode } from '../../../components/core/smart-search/SearchModeToggle';
import type { Column, SavedSearchAction } from '../../../components/core/smart-search/types';
import type { Filters, SingleFilter } from '../../../lib/core/common/ds/types/filter';
import type { SavedSearchPayload } from '../../../lib/common/ds/types/core/SavedSearch';
export type OnSearchCallback<T extends object> = (payload: SavedSearchPayload<T>, action: SavedSearchAction) => void;
interface Props<T extends object> {
  columns: Column<T>[];
  border?: 'full' | 'bottom' | 'none';
  className?: string;
  filters: Filters<T>;
  headerFilters?: SingleFilter<T>[];
  hideSearchButton?: boolean;
  isBusy?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  roundedCorners?: boolean;
  searchOnBlur?: boolean;
  onSearch: OnSearchCallback<T>;
  savedSearch?: React.ReactNode;
  stickyFilters?: (keyof T)[];
  /** Per-page opt-in for natural-language / voice search. Blocked when config sets `features.naturalLanguageSearch: false`. Defaults to `DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH` from AppContext (false unless overridden on AppProvider). */
  enableNaturalLanguageSearch?: boolean;
  /** Placeholder for natural-language mode. Chips mode uses `placeholder`. */
  nlPlaceholder?: string;
  /** Initial input mode when NL search is enabled. Defaults to `'chips'`. */
  defaultSearchInputMode?: SearchInputMode;
}
declare const _default: <T extends object>(props: Props<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=SmartSearch.d.ts.map
