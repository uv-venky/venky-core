import type { SearchInputMode } from '../../../components/core/smart-search/SearchModeToggle';
interface Props<T extends object> {
  readOnly?: boolean;
  placeholder?: string;
  nlPlaceholder?: string;
  stickyFilters?: (keyof T)[];
  excludeStickyFilters?: boolean;
  searchInputMode?: SearchInputMode;
  onSearchInputModeChange?: (mode: SearchInputMode) => void;
  /** Increment to focus the active search input (e.g. after mode toggle). */
  focusInputToken?: number;
}
export declare function SearchInput<T extends object>(props: Props<T>): import('react/jsx-runtime').JSX.Element | null;
export {};
//# sourceMappingURL=SearchInput.d.ts.map
