import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { useMemo, useState } from 'react';
import { Combobox } from '../../../components/core/combobox';
import assert from '../../../components/core/utils/assert';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';
function OptionItem({ column, value, onRemove, }) {
    const option = column.options.find((option) => column.getOptionValue(option) === value);
    return (_jsxs("div", { className: "flex max-h-[24px] items-center rounded-full border bg-default pl-1", "data-testid": "multi-select-value", children: [(option && column.getOptionLabel(option)) ?? value, _jsx(Button, { className: "h-6 w-6", onClick: (e) => {
                    e.stopPropagation();
                    onRemove();
                }, variant: "ghost", size: "icon", "data-testid": "multi-select-remove-value", children: _jsx(X, {}) })] }));
}
export function MultiSelectInput(props) {
    const [expanded, setExpanded] = useState(false);
    const values = useMemo(() => {
        assert(Array.isArray(props.value), "MultiTextInput's value must be an array");
        if (props.value.length && !expanded) {
            return [props.value[0]];
        }
        else {
            return props.value;
        }
    }, [expanded, props.value]);
    return (_jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-1 divide-x bg-paper pl-1", children: [values.map((val, index) => (_jsx(OptionItem
            // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
            , { column: props.column, value: val, onRemove: () => {
                    const val = [...values];
                    val.splice(index, 1);
                    props.onChange(val);
                } }, index))), props.value.length > 1 && !expanded && (_jsxs(Button, { className: "h-6 w-6", onClick: (e) => {
                    e.stopPropagation();
                    setExpanded(true);
                }, "data-tip": "Show all", variant: "ghost", size: "icon", "data-testid": "multi-select-show-all", children: ["+", props.value.length - 1] })), _jsx(Combobox, { dataTestId: "multi-select-input", options: props.column.options.filter((option) => !props.value.includes(props.column.getOptionValue(option))), getValue: props.column.getOptionValue, getLabel: props.column.getOptionLabel, onSelect: (item) => props.onChange(item ? [...props.value, item] : props.value, false), className: "border-none", disableSortByLabel: props.column.disableSortByLabel })] }));
}
//# sourceMappingURL=MultiSelectInput.js.map