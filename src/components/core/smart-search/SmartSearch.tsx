/* Copyright (c) 2023-present Venky Corp. */

import { cn } from '@/lib/utils';
import { ClearButton } from '@/components/core/smart-search/ClearButton';
import { SearchButton } from '@/components/core/smart-search/SearchButton';
import { SearchInput } from '@/components/core/smart-search/SearchInput';
import { type SearchInputMode, SearchModeToggle } from '@/components/core/smart-search/SearchModeToggle';
import { SmartSearchColumnsProvider, SmartSearchProvider } from '@/components/core/smart-search/context';
import type { Column, SavedSearchAction } from '@/components/core/smart-search/types';
import type { Filters, SingleFilter } from '@/lib/core/common/ds/types/filter';
import type { SavedSearchPayload } from '@/lib/common/ds/types/core/SavedSearch';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAppContext } from '@/components/sidebar/app-provider';
import { deepEqual } from '@/lib/core/common/deepUtils';

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

function SmartSearch<T extends object>(props: Props<T>) {
  const {
    onSearch,
    columns,
    filters,
    headerFilters,
    searchOnBlur = true,
    savedSearch,
    placeholder,
    readOnly,
    border,
    className,
    roundedCorners,
    hideSearchButton,
    isBusy,
    stickyFilters,
    enableNaturalLanguageSearch: enableNaturalLanguageSearchProp,
    nlPlaceholder,
    defaultSearchInputMode: defaultSearchInputModeProp,
  } = props;
  const { naturalLanguageSearchEnabled, DEFAULT_SEARCH_INPUT_MODE, DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH } =
    useAppContext();
  const enableNaturalLanguageSearchPropWithDefault =
    enableNaturalLanguageSearchProp ?? DEFAULT_ENABLE_NATURAL_LANGUAGE_SEARCH;
  const defaultSearchInputMode = defaultSearchInputModeProp ?? DEFAULT_SEARCH_INPUT_MODE;
  const enableNaturalLanguageSearch = naturalLanguageSearchEnabled && enableNaturalLanguageSearchPropWithDefault;

  const [searchInputMode, setSearchInputMode] = useState<SearchInputMode>(
    enableNaturalLanguageSearch ? defaultSearchInputMode : 'chips',
  );
  const [focusInputToken, setFocusInputToken] = useState(0);
  const prevFiltersRef = useRef(filters);

  // Programmatic filter updates (metric cards, saved searches, etc.) should show chip UI.
  useEffect(() => {
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;

    if (!enableNaturalLanguageSearch || searchInputMode !== 'nl') return;
    if (deepEqual(prev, filters)) return;
    if (filters.length > 0) {
      setSearchInputMode('chips');
    }
  }, [enableNaturalLanguageSearch, filters, searchInputMode]);

  const handleSearchInputModeChange = useCallback((mode: SearchInputMode) => {
    setSearchInputMode(mode);
  }, []);
  const handleSearchInputModeToggle = useCallback((mode: SearchInputMode) => {
    setSearchInputMode(mode);
    setFocusInputToken((token) => token + 1);
  }, []);
  const showModeToggle = enableNaturalLanguageSearch && !readOnly;
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <SmartSearchColumnsProvider columns={columns}>
        <SmartSearchProvider
          filters={filters}
          headerFilters={headerFilters}
          searchOnBlur={searchOnBlur}
          onSearch={onSearch}
          stickyFilters={stickyFilters}
        >
          <div
            data-smart-search={true}
            className={cn('smart-search flex min-h-[40px] w-full gap-2 p-1', className, {
              border: border === 'full',
              'border-b': border === 'bottom',
              'rounded-md': roundedCorners && border === 'full',
            })}
          >
            {savedSearch != null ? <div className={cn(searchInputMode === 'nl' && 'hidden')}>{savedSearch}</div> : null}
            <SearchInput
              placeholder={placeholder}
              nlPlaceholder={nlPlaceholder}
              readOnly={readOnly}
              stickyFilters={stickyFilters}
              searchInputMode={showModeToggle ? searchInputMode : undefined}
              onSearchInputModeChange={handleSearchInputModeChange}
              focusInputToken={focusInputToken}
            />
            {!readOnly && (
              <>
                {showModeToggle && (
                  <SearchModeToggle
                    mode={searchInputMode}
                    onModeChange={handleSearchInputModeToggle}
                    disabled={isBusy}
                  />
                )}
                <ClearButton stickyFilters={stickyFilters} />
                {!hideSearchButton && <SearchButton isBusy={isBusy} />}
              </>
            )}
          </div>
        </SmartSearchProvider>
      </SmartSearchColumnsProvider>
    </ErrorBoundary>
  );
}

export default memo(SmartSearch) as <T extends object>(props: Props<T>) => React.ReactNode;
