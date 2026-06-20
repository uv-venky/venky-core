/* Copyright (c) 2023-present Venky Corp. */

import { createContext, use, useEffect, useState } from 'react';
import { useLatest } from '@/components/core/hooks/useLatest';
import { EMPTY_ARRAY, emptyFunction, isEmpty, keys } from '@/lib/core/common/isEmpty';
import { hasEditor, isMultiOperator } from '@/components/core/smart-search/operators';
import { type DispatchFn, INITIAL_STATE, type SmartSearchState } from '@/components/core/smart-search/SmartSearchTypes';
import type { Column, SavedSearchAction } from '@/components/core/smart-search/types';
import useSmartSearchReducer from '@/components/core/smart-search/useSmartSearchReducer';
// import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import { type FilterEntry, type Filters, isNestedFilter, type SingleFilter } from '@/lib/core/common/ds/types/filter';
import type { SavedSearchPayload } from '@/lib/common/ds/types/core/SavedSearch';

const SmartSearchStateContext = createContext<SmartSearchState<any>>(INITIAL_STATE<any>());

export function useSmartSearchState<T extends object>(): SmartSearchState<T> {
  return use(SmartSearchStateContext) as SmartSearchState<T>;
}

const SmartSearchDispatcherContext = createContext<any>(emptyFunction);

export function useSmartSearchDispatcher<T extends object>(): DispatchFn<T> {
  return use(SmartSearchDispatcherContext) as DispatchFn<T>;
}

export function SmartSearchProvider<T extends object>(props: {
  children: React.ReactNode;
  filters?: Filters<T>;
  headerFilters?: SingleFilter<T>[];
  searchOnBlur?: boolean;
  stickyFilters?: (keyof T)[];
  onSearch: (payload: SavedSearchPayload<T>, action: SavedSearchAction) => void;
}) {
  // useWhyDidYouUpdate('SmartSearchProvider', props);
  const { onSearch, searchOnBlur = true, filters, headerFilters, stickyFilters } = props;
  const [state, dispatch] = useSmartSearchReducer<T>();

  useEffect(() => {
    dispatch({ type: 'setFilters', filters: filters ?? EMPTY_ARRAY });
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch({ type: 'setHeaderFilters', headerFilters });
  }, [dispatch, headerFilters]);

  const onSearchRef = useLatest(onSearch);

  useEffect(() => {
    dispatch({
      type: 'config',
      searchOnBlur,
      onSearch: onSearchRef,
      stickyFilters,
    });
  }, [dispatch, searchOnBlur, onSearchRef, stickyFilters]);

  // Handle pending search requests (moved out of reducer to avoid side effects)
  useEffect(() => {
    if (state.pendingSearch) {
      const { payload, action } = state.pendingSearch;
      onSearchRef.current(payload, action);
      dispatch({ type: 'clearPendingSearch' });
    }
  }, [state.pendingSearch, onSearchRef, dispatch]);

  return (
    <SmartSearchDispatcherContext value={dispatch}>
      <SmartSearchStateContext value={state}>{props.children}</SmartSearchStateContext>
    </SmartSearchDispatcherContext>
  );
}

const SmartSearchColumnsContext = createContext<ReadonlyArray<Column<any, any>>>(EMPTY_ARRAY);

export function useSmartSearchColumns<T extends object, O extends object>() {
  return use(SmartSearchColumnsContext) as Column<T, O>[];
}

export function SmartSearchColumnsProvider<T extends object, O extends object>(props: {
  children: React.ReactNode;
  columns: ReadonlyArray<Column<T, O>>;
}) {
  const [columns, setColumns] = useState<ReadonlyArray<Column<T, O>>>(EMPTY_ARRAY);
  useEffect(() => {
    setColumns([...props.columns].sort((a, b) => a.label.localeCompare(b.label)));
  }, [props.columns]);
  return <SmartSearchColumnsContext.Provider value={columns}>{props.children}</SmartSearchColumnsContext.Provider>;
}

export function isComplete<T extends Record<string, unknown>>(filter: FilterEntry<T>) {
  if (!filter || Array.isArray(filter) || isNestedFilter(filter)) {
    return true;
  }
  const [attr] = keys(filter);
  const obj = filter[attr];
  if (!obj) return false;
  const [op] = keys(obj);
  if (!op) return false;
  if (!hasEditor(op as string)) return true;
  // @ts-expect-error TODO: fix this
  const value = obj[op];
  if (op === 'bn') {
    return Array.isArray(value) && value.length === 2 && !isEmpty(value[0]) && !isEmpty(value[1]);
  }
  if (isMultiOperator(op as string)) {
    return Array.isArray(value) && value.length > 0 && !isEmpty(value[0]);
  }
  return !isEmpty(value);
}
