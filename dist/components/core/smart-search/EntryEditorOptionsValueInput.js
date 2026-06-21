import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
export function EntryEditorOptionsValueInput(props) {
    const { options, ref, open, onOpenChange } = props;
    return (_jsxs(Select, { value: props.value, open: open, onOpenChange: onOpenChange, onValueChange: (val) => {
            props.onChange(val, true);
        }, children: [_jsx(SelectTrigger, { className: "cursor-pointer truncate border-none focus:outline-1 focus:ring-4", ref: ref, children: _jsx(SelectValue, { placeholder: "Choose an option", "data-testid": "select-value" }) }), _jsx(SelectContent, { children: _jsx(SelectGroup, { children: options.map((option) => (_jsx(SelectItem, { value: option.value, className: "cursor-pointer", "data-testid": `select-item-${option.value}`, children: option.label }, option.value))) }) })] }));
}
//# sourceMappingURL=EntryEditorOptionsValueInput.js.map