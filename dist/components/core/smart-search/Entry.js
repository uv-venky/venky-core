import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { EMPTY_ARRAY, keys } from '../../../lib/core/common/isEmpty';
import { CaseSensitive, X } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import { useSmartSearchColumns, useSmartSearchDispatcher } from '../../../components/core/smart-search/context';
import NestedEntry from '../../../components/core/smart-search/NestedEntry';
import { getOptionsForType, hasEditor } from '../../../components/core/smart-search/operators';
import { isSelectLookupColumn, isSelectOptionsColumn } from '../../../components/core/smart-search/types';
import { useConvertISOToLocalString } from '../../../components/core/hooks/useUserHooks';
import { clickOnEnterOrSpace } from '../../../components/core/hooks/useMove';
import { getLookupsByType } from '../../../lib/core/client/lookups';
function DisplaySelectValue(props) {
  const displayValue = useMemo(() => {
    const { options, getOptionLabel, getOptionValue } = props.column;
    const val = props.value;
    if (Array.isArray(val)) {
      return val
        .map((v) => {
          const option = options.find((o) => getOptionValue(o) === v);
          return option ? getOptionLabel(option) : v;
        })
        .join(', ');
    }
    const option = options.find((o) => getOptionValue(o) === val);
    return option ? getOptionLabel(option) : val;
  }, [props.column, props.value]);
  return _jsx(_Fragment, { children: displayValue });
}
function DisplaySelectValueLookup({ value, column: columnProp }) {
  const { lookupType } = columnProp;
  const [options, setOptions] = useState([]);
  const column = useMemo(() => {
    const { lookupType: _, ...rest } = columnProp;
    return {
      ...rest,
      options,
      getOptionLabel: (option) => option.label ?? option.value,
      getOptionValue: (option) => option.value,
    };
  }, [columnProp, options]);
  useEffect(() => {
    getLookupsByType(lookupType).then(setOptions);
  }, [lookupType]);
  return _jsx(DisplaySelectValue, { column: column, value: value });
}
function DisplaySelectValueMayBeLookup({ value, column }) {
  if (isSelectOptionsColumn(column)) {
    return _jsx(DisplaySelectValue, { column: column, value: value });
  }
  if (isSelectLookupColumn(column)) {
    return _jsx(DisplaySelectValueLookup, { column: column, value: value });
  }
  return _jsx('div', { className: 'text-red-500', children: 'Invalid select type' });
}
function DisplayValue(props) {
  return _jsx('div', {
    ref: props.valueRef,
    role: 'button',
    tabIndex: props.onClick ? -1 : undefined,
    className: cn('val max-w-[160px] shrink overflow-hidden overflow-ellipsis px-2 focus:outline', {
      'cursor-pointer': props.onClick,
    }),
    onClick: props.onClick,
    'data-testid': props.dataTestId,
    children:
      props.column.type !== 'Select' && props.column.type !== 'TextArray'
        ? Array.isArray(props.value)
          ? props.value.join(', ')
          : props.value
        : _jsx(DisplaySelectValueMayBeLookup, { ...props, column: props.column }),
  });
}
function SingleEntry({ column, filter, readOnly: ro, path, stickyFilters, attributeCode, active }) {
  const dispatch = useSmartSearchDispatcher();
  const readOnly = ro || stickyFilters?.includes(attributeCode);
  const operatorOptions = useMemo(() => {
    if (!column) return EMPTY_ARRAY;
    return getOptionsForType(column.type);
  }, [column]);
  const operator = useMemo(() => {
    const [key] = keys(filter[attributeCode] ?? {});
    return key;
  }, [attributeCode, filter]);
  const convertISOToLocalString = useConvertISOToLocalString();
  const displayValue = useMemo(() => {
    if (!column) return undefined;
    const obj = filter[column.key];
    if (!obj) return undefined;
    const [key] = keys(obj);
    // @ts-expect-error - key is valid
    let val = key ? obj[key] : undefined;
    if (val && column.type === 'Date') {
      if (Array.isArray(val)) {
        val = val.map((v) => convertISOToLocalString(v, column.showTime));
      } else {
        val = convertISOToLocalString(val, column.showTime);
      }
    }
    if (key === 'bn' && Array.isArray(val)) {
      return val.join(' & ');
    }
    if (val && column.type === 'YN') {
      val = val === 'Y' ? 'Checked' : 'Unchecked';
    }
    if (val && column.type === 'TF') {
      val = val === 'T' ? 'Checked' : 'Unchecked';
    }
    if (typeof val === 'boolean' && column.type === 'Boolean') {
      val = val ? 'True' : 'False';
    }
    return val;
  }, [column, filter, convertISOToLocalString]);
  const operatorLabel = useMemo(() => {
    if (!operator) return '';
    const ops = operatorOptions;
    const option = ops.find((o) => o.value === operator);
    return option ? option.label : '';
  }, [operator, operatorOptions]);
  const columnLabel = useMemo(() => {
    if (!column) return 'Choose an attribute';
    return column.label;
  }, [column]);
  function handleFieldClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (readOnly) return;
    dispatch({ type: 'editPath', path, activeSection: 'field' });
  }
  function handleValueClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (readOnly) return;
    dispatch({ type: 'editPath', path, activeSection: 'value' });
  }
  const outerRef = useRef(null);
  const valueRef = useRef(null);
  useEffect(() => {
    let timeout;
    if (active) {
      if (!outerRef.current?.contains(document.activeElement)) {
        outerRef.current?.focus();
      }
      timeout = setTimeout(() => {
        if (!outerRef.current?.contains(document.activeElement)) {
          outerRef.current?.focus();
        }
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [active]);
  return _jsxs('div', {
    ref: outerRef,
    role: 'button',
    tabIndex: 0,
    onClick: handleValueClick,
    onKeyDown: (e) => {
      e.stopPropagation();
      if (e.key === 'ArrowLeft') {
        dispatch({ type: 'navigateLeft' });
      } else if (e.key === 'ArrowRight') {
        dispatch({ type: 'navigateRight' });
      } else if (e.key === 'Home') {
        dispatch({ type: 'setActivePath', path: [0] });
      } else if (e.key === 'End') {
        dispatch({ type: 'navigateToEnd' });
      } else {
        clickOnEnterOrSpace(e, handleValueClick);
      }
    },
    className: cn(
      'entry flex max-w-full select-none items-center divide-x overflow-hidden whitespace-nowrap rounded-full border bg-default px-1 text-sm ring-ring focus:ring-2',
      { 'cursor-default': readOnly },
    ),
    style: { height: '30px' },
    'data-testid': `filter-entry-${path.join('-')}-${attributeCode}`,
    onFocus: () => {
      dispatch({ type: 'setActivePath', path });
    },
    children: [
      _jsx('div', {
        role: 'button',
        tabIndex: !readOnly ? -1 : undefined,
        className: cn('attr grow-0 px-2', !readOnly && 'cursor-pointer'),
        onClick: !readOnly ? handleFieldClick : undefined,
        onKeyDown: readOnly ? undefined : (e) => clickOnEnterOrSpace(e, handleFieldClick),
        'data-testid': `filter-field-${path.join('-')}-${attributeCode}`,
        children: columnLabel,
      }),
      _jsxs('div', {
        role: 'button',
        tabIndex: !readOnly ? -1 : undefined,
        className: cn('op flex grow-0 items-center gap-2 px-2 ring-ring focus:ring-2', !readOnly && 'cursor-pointer'),
        onClick: !readOnly
          ? (e) => {
              e.stopPropagation();
              e.preventDefault();
              dispatch({ type: 'editPath', path, activeSection: 'operator' });
            }
          : undefined,
        'data-testid': `filter-operator-${path.join('-')}-${attributeCode}`,
        children: [
          filter[attributeCode] &&
            'ignoreCase' in filter[attributeCode] &&
            filter[attributeCode].ignoreCase &&
            _jsx(CaseSensitive, { className: 'h-4 w-4 text-blue-600', 'data-tip': 'Ignore Case' }),
          operatorLabel,
        ],
      }),
      hasEditor(operator) &&
        _jsx(DisplayValue, {
          valueRef: valueRef,
          dataTestId: `filter-value-${path.join('-')}-${attributeCode}`,
          value: displayValue,
          column: column,
          onClick: !readOnly ? handleValueClick : undefined,
        }),
      !readOnly &&
        _jsx(Button, {
          tabIndex: -1,
          'data-testid': `filter-remove-${path.join('-')}-${attributeCode}`,
          onClick: (e) => {
            e.stopPropagation();
            dispatch({ type: 'removeFilter', path });
          },
          className: 'shrink-0',
          variant: 'ghost',
          size: 'icon',
          children: _jsx(X, {}),
        }),
    ],
  });
}
function Entry(props) {
  const { readOnly: ro, filter, index, stickyFilters } = props;
  useWhyDidYouUpdate('Entry', { ...props });
  const columns = useSmartSearchColumns();
  const attributeCode = useMemo(() => {
    const [key] = keys(filter);
    return key;
  }, [filter]);
  const readOnly = ro || stickyFilters?.includes(attributeCode);
  const column = useMemo(() => {
    return columns.find((c) => c.key === attributeCode);
  }, [columns, attributeCode]);
  const path = useMemo(() => {
    if (['allof', 'anyof', 'noneof'].includes(attributeCode)) {
      return [...props.path, index, attributeCode];
    }
    return [...props.path, index];
  }, [props.path, index, attributeCode]);
  return ['allof', 'anyof', 'noneof'].includes(attributeCode)
    ? _jsx(NestedEntry, { readOnly: readOnly, path: path, stickyFilters: stickyFilters })
    : column &&
        _jsx(SingleEntry, { ...props, column: column, path: path, attributeCode: attributeCode, filter: filter });
}
export default memo(Entry);
//# sourceMappingURL=Entry.js.map
