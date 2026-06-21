import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { createContext, use, useEffect, useState } from 'react';
import { useLatest } from '../../../components/core/hooks/useLatest';
import { EMPTY_ARRAY, emptyFunction, isEmpty, keys } from '../../../lib/core/common/isEmpty';
import { hasEditor, isMultiOperator } from '../../../components/core/smart-search/operators';
import { INITIAL_STATE } from '../../../components/core/smart-search/SmartSearchTypes';
import useSmartSearchReducer from '../../../components/core/smart-search/useSmartSearchReducer';
// import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import { isNestedFilter } from '../../../lib/core/common/ds/types/filter';
const SmartSearchStateContext = createContext(INITIAL_STATE());
export function useSmartSearchState() {
  return use(SmartSearchStateContext);
}
const SmartSearchDispatcherContext = createContext(emptyFunction);
export function useSmartSearchDispatcher() {
  return use(SmartSearchDispatcherContext);
}
export function SmartSearchProvider(props) {
  // useWhyDidYouUpdate('SmartSearchProvider', props);
  const { onSearch, searchOnBlur = true, filters, headerFilters, stickyFilters } = props;
  const [state, dispatch] = useSmartSearchReducer();
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
  return _jsx(SmartSearchDispatcherContext, {
    value: dispatch,
    children: _jsx(SmartSearchStateContext, { value: state, children: props.children }),
  });
}
const SmartSearchColumnsContext = createContext(EMPTY_ARRAY);
export function useSmartSearchColumns() {
  return use(SmartSearchColumnsContext);
}
export function SmartSearchColumnsProvider(props) {
  const [columns, setColumns] = useState(EMPTY_ARRAY);
  useEffect(() => {
    setColumns([...props.columns].sort((a, b) => a.label.localeCompare(b.label)));
  }, [props.columns]);
  return _jsx(SmartSearchColumnsContext.Provider, { value: columns, children: props.children });
}
export function isComplete(filter) {
  if (!filter || Array.isArray(filter) || isNestedFilter(filter)) {
    return true;
  }
  const [attr] = keys(filter);
  const obj = filter[attr];
  if (!obj) return false;
  const [op] = keys(obj);
  if (!op) return false;
  if (!hasEditor(op)) return true;
  // @ts-expect-error TODO: fix this
  const value = obj[op];
  if (op === 'bn') {
    return Array.isArray(value) && value.length === 2 && !isEmpty(value[0]) && !isEmpty(value[1]);
  }
  if (isMultiOperator(op)) {
    return Array.isArray(value) && value.length > 0 && !isEmpty(value[0]);
  }
  return !isEmpty(value);
}
//# sourceMappingURL=context.js.map
