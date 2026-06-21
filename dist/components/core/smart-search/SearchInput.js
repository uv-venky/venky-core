import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { cn } from '../../../lib/utils';
import { useEffect, useRef } from 'react';
import { isSamePath } from '../../../components/core/mutX/ImmutableTypes';
import { getIn } from '../../../components/core/mutX/ImmutableUtils';
import { EMPTY_ARRAY } from '../../../lib/core/common/isEmpty';
import Entry from '../../../components/core/smart-search/Entry';
import EntryEditor from '../../../components/core/smart-search/EntryEditor';
import {
  isComplete,
  useSmartSearchDispatcher,
  useSmartSearchState,
} from '../../../components/core/smart-search/context';
import { isStickyFilter } from '../../../components/core/smart-search/utils';
export function SearchInput(props) {
  const { readOnly, placeholder, stickyFilters, excludeStickyFilters, searchInputMode, focusInputToken = 0 } = props;
  const searchInputRef = useRef(null);
  const prevSearchInputModeRef = useRef(searchInputMode);
  const state = useSmartSearchState();
  const dispatch = useSmartSearchDispatcher();
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
  return !state.activeView || state.showFilters || props.readOnly
    ? _jsxs('div', {
        role: 'button',
        tabIndex: 0,
        className: cn(
          'search-input relative flex max-w-full flex-1 flex-wrap items-center gap-1',
          props.readOnly ? 'cursor-default' : 'cursor-text',
        ),
        'data-testid': 'search-input-container',
        onClick: (e) => {
          e.stopPropagation();
          searchInputRef.current?.focus();
        },
        children: [
          state.filters.map((filter, index) => {
            return !readOnly &&
              isSamePath([index], state.activePath) &&
              state.editing &&
              !isStickyFilter(filter, stickyFilters)
              ? _jsx(
                  EntryEditor,
                  {
                    stickyFilters: stickyFilters,
                    path: EMPTY_ARRAY,
                    index: index,
                    filter: filter,
                    activeSection: state.activeSection,
                  },
                  index,
                )
              : excludeStickyFilters && isStickyFilter(filter, stickyFilters)
                ? null
                : _jsx(
                    Entry,
                    // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
                    {
                      readOnly: readOnly,
                      path: EMPTY_ARRAY,
                      index: index,
                      filter: filter,
                      stickyFilters: stickyFilters,
                      active: isSamePath([index], state.activePath),
                    },
                    index,
                  );
          }),
          !isEditingIncomplete() &&
            (!readOnly
              ? _jsxs(_Fragment, {
                  children: [
                    _jsx('input', {
                      'data-testid': 'search-input',
                      type: 'text',
                      ref: searchInputRef,
                      className: 'w-2 border-none bg-transparent p-0 focus:border-none focus:shadow-none focus:ring-0',
                      onFocus: () => {
                        dispatch({
                          type: 'onSearchInputFocus',
                        });
                      },
                    }),
                    _jsx('span', {
                      className: cn('select-none text-secondary-foreground text-sm'),
                      children: placeholder ?? 'Search...',
                    }),
                  ],
                })
              : !state.filters.length &&
                _jsx('span', { className: cn('select-none text-muted-foreground text-sm'), children: placeholder })),
        ],
      })
    : _jsx('div', { className: 'flex-1' });
}
//# sourceMappingURL=SearchInput.js.map
