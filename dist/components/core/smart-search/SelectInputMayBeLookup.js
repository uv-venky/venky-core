import { jsx as _jsx } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { useEffect, useMemo, useState } from 'react';
import { SelectInput } from './SelectInput';
import { isSelectLookupColumn, isSelectOptionsColumn, } from '../../../components/core/smart-search/types';
import { getLookupsByType } from '../../../lib/core/client/lookups';
function SelectInputLookup(props) {
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
    return _jsx(SelectInput, { column: column, ...restProps });
}
export function SelectInputMayBeLookup({ column, ...rest }) {
    if (isSelectOptionsColumn(column)) {
        return _jsx(SelectInput, { column: column, ...rest });
    }
    if (isSelectLookupColumn(column)) {
        return _jsx(SelectInputLookup, { column: column, ...rest });
    }
    return _jsx("div", { className: "text-red-500", children: "Invalid select type" });
}
//# sourceMappingURL=SelectInputMayBeLookup.js.map