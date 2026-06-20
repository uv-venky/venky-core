/* Copyright (c) 2024-present VENKY Corp. */

import { useReducer } from 'react';
import { getIn, hasIn, removeIn, setIn } from '@/components/core/mutX/ImmutableUtils';
import { EMPTY_ARRAY, EMPTY_OBJECT, isEmpty, keys } from '@/lib/core/common/isEmpty';
import { isComplete } from '@/components/core/smart-search/context';
import {
  CASE_SENSITIVE_OPS,
  getDefaultOperator,
  getDefaultValue,
  hasEditor,
  isMultiOperator,
} from '@/components/core/smart-search/operators';
import type { Action, DispatchFn, SmartSearchState } from '@/components/core/smart-search/SmartSearchTypes';
import { INITIAL_STATE } from '@/components/core/smart-search/SmartSearchTypes';
import { isNestedFilter, splitFilter, type Filters } from '@/lib/core/common/ds/types/filter';
import { isSamePath, type Path } from '@/components/core/mutX';
import CONSTANTS from '@/lib/core/client/constants';

const { IGNORE_CASE_DEFAULT } = CONSTANTS;

// Counter for generating unique pendingSearch IDs
let pendingSearchId = 0;

function removeEmptyNestedFilters<T extends object>(props: { filters: Filters<T>; path: Path }) {
  let filters = props.filters;
  let path = props.path;
  const p = [...props.path];
  p.pop();
  while (p.length > 1) {
    if (getIn(filters, p, EMPTY_ARRAY).length === 0) {
      p.pop();
      filters = removeIn(filters, p);
      p.pop();
      path = p;
    } else {
      break;
    }
  }
  return { filters, path };
}

function reducer<T extends object>(state: SmartSearchState<T>, action: Action<T>): SmartSearchState<T> {
  switch (action.type) {
    case 'config': {
      const newState = { ...state };
      newState.onSearch = action.onSearch;
      newState.searchOnBlur = action.searchOnBlur ?? false;
      newState.stickyFilters = action.stickyFilters ?? EMPTY_ARRAY;
      return newState;
    }
    case 'clearSearch': {
      const newState = { ...state };
      newState.activePath = EMPTY_ARRAY;
      newState.editing = false;
      const stickyFilters = newState.stickyFilters;
      if (stickyFilters.length) {
        newState.filters = newState.filters.filter((f) => stickyFilters.includes(keys(f)[0]));
      } else {
        newState.filters = EMPTY_ARRAY;
      }
      newState.activeView = undefined;
      newState.pendingSearch = {
        payload: { filters: newState.filters },
        action: 'clear-filters',
        id: ++pendingSearchId,
      };
      return newState;
    }
    case 'setFilters': {
      const newState = { ...state };
      newState.filters = action.filters;
      return newState;
    }
    case 'setHeaderFilters': {
      const newState = { ...state };
      newState.headerFilters = action.headerFilters;
      return newState;
    }
    case 'setActiveView': {
      const newState = { ...state };
      const { activeView } = action;
      newState.activeView = activeView;
      const stickyFilters = newState.filters.filter((f) => state.stickyFilters.includes(splitFilter(f).attributeCode));
      const newFiltersWithoutSticky = (activeView?.payload?.filters ?? EMPTY_ARRAY).filter(
        (f) => !state.stickyFilters.includes(splitFilter(f).attributeCode),
      );
      newState.filters = [...stickyFilters, ...newFiltersWithoutSticky];
      newState.activePath = EMPTY_ARRAY;
      newState.editing = false;
      newState.pendingSearch = {
        payload: { filters: newState.filters, custom: activeView?.payload.custom },
        action: activeView ? 'saved-search-activated' : 'saved-search-deactivated',
        id: ++pendingSearchId,
      };
      return newState;
    }
    case 'onSearchInputFocus': {
      const newState = { ...state };
      newState.activePath = [state.filters.length];
      newState.filters = [...state.filters, EMPTY_OBJECT];
      newState.editing = true;
      return newState;
    }
    case 'removeFilter': {
      const newState = { ...state };
      const { path } = action;
      if (!isComplete(getIn(newState.filters, newState.activePath, undefined))) {
        newState.filters = removeIn(newState.filters, newState.activePath);
        if (!isSamePath(path, newState.activePath)) {
          newState.filters = removeIn(newState.filters, path);
        }
      } else {
        newState.filters = removeIn(newState.filters, path);
      }
      const { filters, path: newPath } = removeEmptyNestedFilters({
        filters: newState.filters,
        path,
      });
      newState.filters = filters;

      newState.activePath = updatePathAfterRemove<T>(filters, newPath);

      newState.editing = false;
      newState.activeSection = 'field';
      if (state.searchOnBlur) {
        newState.pendingSearch = {
          payload: { filters: newState.filters },
          action: 'search-blur',
          id: ++pendingSearchId,
        };
      }
      return newState;
    }
    case 'removeNestedFilter': {
      const newState = { ...state };
      const { path } = action;
      newState.editing = false;
      const p = [...path];
      p.pop();
      newState.filters = removeIn(newState.filters, p);
      const { filters, path: newPath } = removeEmptyNestedFilters({
        filters: newState.filters,
        path: p,
      });
      newState.filters = filters;
      newState.activePath = updatePathAfterRemove<T>(filters, newPath);
      if (state.searchOnBlur) {
        newState.pendingSearch = {
          payload: { filters: newState.filters },
          action: 'search-blur',
          id: ++pendingSearchId,
        };
      }
      return newState;
    }
    case 'editPath': {
      const newState = { ...state };
      const { path, activeSection } = action;
      if (!isComplete(getIn(newState.filters, newState.activePath, undefined))) {
        newState.filters = removeIn(newState.filters, newState.activePath);
      }
      newState.activePath = [...path];
      newState.activeSection = activeSection;
      newState.editing = true;
      return newState;
    }
    case 'setMatchCase': {
      const newState = { ...state };
      const { ignoreCase, column, path, index } = action;
      const val = ignoreCase ? true : undefined;
      newState.filters = setIn(newState.filters, [...path, index, column.key, 'ignoreCase'], val);
      return newState;
    }
    case 'setColumn': {
      const newState = { ...state };
      const { path, index, column } = action;
      const op = getDefaultOperator(column);
      const val = getDefaultValue(column.type);

      const ignoreCaseEnabled = column.type === 'Text' && CASE_SENSITIVE_OPS.includes(op);

      newState.filters = setIn(newState.filters, [...path, index], {
        [column.key]: { [op]: val },
      });

      if (ignoreCaseEnabled) {
        newState.filters = setIn(newState.filters, [...path, index, column.key, 'ignoreCase'], IGNORE_CASE_DEFAULT);
      }

      newState.activeSection = undefined;
      return newState;
    }
    case 'setOperator': {
      const newState = { ...state };
      const { path, index, operator, value, column } = action;

      let val = value;
      const ed = hasEditor(operator);
      if (!ed && column) {
        val = getDefaultValue(column.type, true);
      }
      if (isMultiOperator(operator)) {
        if (!Array.isArray(val)) {
          if (isEmpty(val)) {
            val = EMPTY_ARRAY;
          } else {
            val = [val];
          }
        }
        if (operator === 'bn' && Array.isArray(val) && val.length > 2) {
          val = val.slice(0, 2);
        }
      } else if (Array.isArray(val)) {
        if (val.length) {
          val = val[0];
        } else if (column) {
          val = getDefaultValue(column.type);
        } else {
          val = undefined;
        }
      }
      newState.filters = setIn(newState.filters, [...path, index], {
        [column.key]: { [operator]: val },
      });

      const ignoreCaseEnabled = column.type === 'Text' && CASE_SENSITIVE_OPS.includes(operator);

      if (ignoreCaseEnabled) {
        newState.filters = setIn(newState.filters, [...path, index, column.key, 'ignoreCase'], IGNORE_CASE_DEFAULT);
      }
      newState.activeSection = undefined;
      if (!ed) {
        if (path.length > 1) {
          // nested
          newState.activePath = path;
          newState.editing = true;
        } else {
          newState.activePath = EMPTY_ARRAY;
          newState.editing = false;
          if (newState.searchOnBlur) {
            newState.pendingSearch = {
              payload: { filters: newState.filters },
              action: 'search-blur',
              id: ++pendingSearchId,
            };
          }
        }
      }
      return newState;
    }
    case 'setValue': {
      const newState = { ...state };
      const { path, index, operator, value, ignoreCase, column, done } = action;

      newState.filters = setIn(newState.filters, [...path, index], {
        [column.key]: {
          [operator]: value,
          ignoreCase: ignoreCase ? true : undefined,
        },
      });
      newState.activeSection = undefined;
      if (done) {
        if (path.length > 1) {
          // nested
          newState.activePath = [...path, index];
          newState.editing = false;
        } else {
          newState.activePath = [index];
          newState.editing = false;
          if (newState.searchOnBlur) {
            newState.pendingSearch = {
              payload: { filters: newState.filters },
              action: 'search-blur',
              id: ++pendingSearchId,
            };
          }
        }
      }
      return newState;
    }
    case 'newCombiner': {
      const newState = { ...state };
      const { path, combiner } = action;
      newState.filters = setIn(newState.filters, path, {
        [combiner]: [EMPTY_OBJECT],
      });
      newState.activePath = [...path, combiner, 0];
      newState.editing = true;
      return newState;
    }
    case 'setCombiner': {
      const newState = { ...state };
      const { path, combiner } = action;
      const p = [...path];
      const filters = getIn(state.filters, p, [EMPTY_OBJECT]);
      p.pop();
      newState.filters = setIn(newState.filters, p, { [combiner]: filters });
      const lastIndex = newState.activePath[newState.activePath.length - 1];
      newState.activePath = typeof lastIndex === 'number' ? [...p, combiner, lastIndex] : [...p, combiner];
      return newState;
    }
    case 'onClickOutside': {
      const newState = { ...state };

      if (!isComplete(getIn(newState.filters, newState.activePath, undefined))) {
        newState.filters = removeIn(newState.filters, newState.activePath);
        const { filters } = removeEmptyNestedFilters({
          filters: newState.filters,
          path: newState.activePath,
        });
        newState.filters = filters;
      }
      newState.activePath = EMPTY_ARRAY;
      newState.editing = false;

      if (newState.searchOnBlur) {
        newState.pendingSearch = {
          payload: { filters: newState.filters },
          action: 'search-blur',
          id: ++pendingSearchId,
        };
      }

      return newState;
    }
    case 'addNestedFilter': {
      const newState = { ...state };
      const { path } = action;

      newState.activePath = [...path, getIn(state.filters, path, EMPTY_ARRAY).length];
      newState.filters = setIn(newState.filters, path, [...getIn(state.filters, path, EMPTY_ARRAY), EMPTY_OBJECT]);
      newState.editing = true;

      return newState;
    }
    case 'doSearch': {
      const { reason } = action;
      let newState = state;
      if (state.activePath.length) {
        newState = { ...state };
        if (!isComplete(getIn(newState.filters, newState.activePath, undefined))) {
          newState.filters = removeIn(newState.filters, newState.activePath);
        }
        newState.activePath = EMPTY_ARRAY;
        newState.editing = false;
      } else {
        // Need to create new state to trigger effect
        newState = { ...state };
      }
      newState.pendingSearch = {
        payload: { filters: newState.filters },
        action: reason,
        id: ++pendingSearchId,
      };
      return newState;
    }
    case 'clearPendingSearch': {
      if (!state.pendingSearch) {
        return state;
      }
      const newState = { ...state };
      newState.pendingSearch = undefined;
      return newState;
    }
    case 'setShowFilters': {
      const newState = { ...state };
      newState.showFilters = action.showFilters;
      return newState;
    }
    case 'navigateLeft': {
      const newState = { ...state };
      newState.activePath = moveLeft(newState.filters, newState.activePath);
      return newState;
    }
    case 'navigateRight': {
      const newState = { ...state };
      newState.activePath = moveRight(newState.filters, newState.activePath);
      return newState;
    }
    case 'navigateToEnd': {
      const newState = { ...state };
      newState.activePath = checkAndAdjustNestedPath(newState.filters, [newState.filters.length - 1]);
      return newState;
    }
    case 'escape': {
      const newState = { ...state };
      if (!isComplete(getIn(newState.filters, newState.activePath, undefined))) {
        newState.filters = removeIn(newState.filters, newState.activePath);
      }
      newState.activePath = updatePathAfterRemove<T>(newState.filters, newState.activePath);
      newState.editing = false;
      return newState;
    }
    case 'setActivePath': {
      const newState = { ...state };
      if (!isComplete(getIn(newState.filters, newState.activePath, undefined))) {
        newState.filters = removeIn(newState.filters, newState.activePath);
      }
      newState.activePath = checkAndAdjustNestedPath(newState.filters, action.path);
      return newState;
    }
  }
}

function checkAndAdjustNestedPath<T extends object>(filters: Filters<T>, path: Path): Path {
  let f = getIn(filters, path, undefined);
  if (f != null && !isNestedFilter(f)) {
    return path;
  }
  const lastIndex = path[path.length - 1];
  let p = path;
  if (typeof lastIndex === 'number') {
    while (isNestedFilter(f)) {
      const combiner = keys(f)[0];
      p = [...p, combiner, 0];
      f = getIn(filters, p, undefined);
    }
    return p;
  } else {
    return EMPTY_ARRAY;
  }
}

function updatePathAfterRemove<T extends object>(filters: Filters<T>, path: Path): Path {
  if (hasIn(filters, path)) {
    return path;
  }
  const lastIndex = path[path.length - 1];
  if (typeof lastIndex === 'number' && lastIndex > 0) {
    let p = [...path];
    p.pop();
    p = [...p, lastIndex - 1];
    let f = getIn(filters, p, undefined);
    while (isNestedFilter(f)) {
      const combiner = keys(f)[0];
      p = [...p, combiner, 0];
      f = getIn(filters, p, undefined);
    }
    return p;
  } else {
    return EMPTY_ARRAY;
  }
}

function moveLeft<T extends object>(filters: Filters<T>, path: Path): Path {
  if (!hasIn(filters, path) || path.length === 0) {
    return EMPTY_ARRAY;
  }
  const lastIndex = path[path.length - 1];
  if (typeof lastIndex === 'number' && lastIndex > 0) {
    let p = [...path];
    p.pop();
    p = [...p, lastIndex - 1];
    let f = getIn(filters, p, undefined);
    while (isNestedFilter(f)) {
      const combiner = keys(f)[0];
      const arr = getIn(filters, [...p, combiner], EMPTY_ARRAY);
      p = [...p, combiner, arr.length - 1];
      f = getIn(filters, p, undefined);
    }
    return p;
  } else if (path.length > 2) {
    const p = path.slice(0, -2);
    return moveLeft(filters, p);
  } else {
    return path;
  }
}

function moveRight<T extends object>(filters: Filters<T>, path: Path): Path {
  if (!hasIn(filters, path) || path.length === 0) {
    return EMPTY_ARRAY;
  }
  const lastIndex = path[path.length - 1];
  if (typeof lastIndex === 'number') {
    let p = [...path];
    p.pop();
    p = [...p, lastIndex + 1];
    let f = getIn(filters, p, undefined);
    if (f == null) {
      if (p.length > 2) {
        p = p.slice(0, -2);
        return moveRight(filters, p);
      }
      return path;
    }
    while (isNestedFilter(f)) {
      const combiner = keys(f)[0];
      p = [...p, combiner, 0];
      f = getIn(filters, p, undefined);
    }
    return p;
  } else {
    return path;
  }
}

export default function useSmartSearchReducer<T extends object>(): [SmartSearchState<T>, DispatchFn<T>] {
  return useReducer(reducer, INITIAL_STATE<T>());
}
