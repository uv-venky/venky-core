/* Copyright (c) 2023-present Venky Corp. */

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { isSamePath } from '@/components/core/mutX/ImmutableTypes';
import { getIn } from '@/components/core/mutX/ImmutableUtils';
import { EMPTY_ARRAY } from '@/lib/core/common/isEmpty';
import Entry from '@/components/core/smart-search/Entry';
import EntryEditor from '@/components/core/smart-search/EntryEditor';
import type { SearchInputMode } from '@/components/core/smart-search/SearchModeToggle';
import { isComplete, useSmartSearchDispatcher, useSmartSearchState } from '@/components/core/smart-search/context';
import { isStickyFilter } from '@/components/core/smart-search/utils';

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

export function SearchInput<T extends object>(props: Props<T>) {
  const { readOnly, placeholder, stickyFilters, excludeStickyFilters, searchInputMode, focusInputToken = 0 } = props;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevSearchInputModeRef = useRef(searchInputMode);
  const state = useSmartSearchState<T>();
  const dispatch = useSmartSearchDispatcher<T>();

  // Close in-progress chip editing when leaving pill mode (EntryEditor unmounts without blur).
  useEffect(() => {
    const prevMode = prevSearchInputModeRef.current;
    prevSearchInputModeRef.current = searchInputMode;
    if (prevMode !== 'nl' && searchInputMode === 'nl' && (state.editing || state.activePath.length > 0)) {
      dispatch({ type: 'onClickOutside' });
    }
  }, [searchInputMode, state.editing, state.activePath.length, dispatch]);

  useEffect(() => {
    if (focusInputToken === 0) return;
    searchInputRef.current?.focus();
  }, [focusInputToken, searchInputMode]);

  function isEditingIncomplete() {
    if (!state.activePath.length) return false;
    return !isComplete(getIn(state.filters, state.activePath, undefined));
  }

  if (searchInputMode === 'nl' && !readOnly) {
    return null;
  }

  return !state.activeView || state.showFilters || props.readOnly ? (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'search-input relative flex max-w-full flex-1 flex-wrap items-center gap-1',
        props.readOnly ? 'cursor-default' : 'cursor-text',
      )}
      data-testid="search-input-container"
      onClick={(e) => {
        e.stopPropagation();
        searchInputRef.current?.focus();
      }}
    >
      {state.filters.map((filter, index) => {
        return !readOnly &&
          isSamePath([index], state.activePath) &&
          state.editing &&
          !isStickyFilter(filter, stickyFilters) ? (
          <EntryEditor
            stickyFilters={stickyFilters}
            // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
            key={index}
            path={EMPTY_ARRAY}
            index={index}
            filter={filter}
            activeSection={state.activeSection}
          />
        ) : excludeStickyFilters && isStickyFilter(filter, stickyFilters) ? null : (
          <Entry
            // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
            key={index}
            readOnly={readOnly}
            path={EMPTY_ARRAY}
            index={index}
            filter={filter}
            stickyFilters={stickyFilters}
            active={isSamePath([index], state.activePath)}
          />
        );
      })}
      {!isEditingIncomplete() &&
        (!readOnly ? (
          <>
            <input
              data-testid="search-input"
              type="text"
              ref={searchInputRef}
              className="w-2 border-none bg-transparent p-0 focus:border-none focus:shadow-none focus:ring-0"
              onFocus={() => {
                dispatch({
                  type: 'onSearchInputFocus',
                });
              }}
            />
            <span className={cn('select-none text-secondary-foreground text-sm')}>{placeholder ?? 'Search...'}</span>
          </>
        ) : (
          !state.filters.length && (
            <span className={cn('select-none text-muted-foreground text-sm')}>{placeholder}</span>
          )
        ))}
    </div>
  ) : (
    <div className="flex-1" />
  );
}
