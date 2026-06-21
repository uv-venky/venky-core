import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { useEffect, useMemo, useState } from 'react';
import { MultiSelectInput } from './MultiSelectInput';
import { isSelectLookupColumn, isSelectOptionsColumn } from '../../../components/core/smart-search/types';
import { getLookupsByType } from '../../../lib/core/client/lookups';
function MultiSelectInputLookup(props) {
  const { column: columnProp, ...restProps } = props;
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
  return _jsx(MultiSelectInput, { column: column, ...restProps });
}
export function MultiSelectInputMayBeLookup({ column, ...rest }) {
  if (isSelectOptionsColumn(column)) {
    return _jsx(MultiSelectInput, { column: column, ...rest });
  }
  if (isSelectLookupColumn(column)) {
    return _jsx(MultiSelectInputLookup, { column: column, ...rest });
  }
  return _jsx('div', { className: 'text-red-500', children: 'Invalid select type' });
}
//# sourceMappingURL=MultiSelectInputMayBeLookup.js.map
