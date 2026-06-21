import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
export function MultiNumberInput(props) {
    const [expanded, setExpanded] = useState(false);
    const values = useMemo(() => {
        if (!Array.isArray(props.value)) {
            throw new Error("MultiNumberInput's value must be an array");
        }
        if (props.value.length && !expanded) {
            return [props.value[0]];
        }
        else {
            return props.value;
        }
    }, [expanded, props.value]);
    return (_jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-1 divide-x bg-paper pl-1", children: [values.map((val, index) => (_jsxs("div", { className: "flex max-h-[24px] items-center rounded-full border bg-default pl-1", "data-testid": "multi-number-value", children: [val, _jsx(Button, { className: "h-6 w-6", onClick: (e) => {
                            e.stopPropagation();
                            const val = [...props.value];
                            val.splice(index, 1);
                            props.onChange(val);
                        }, variant: "ghost", size: "icon", "data-testid": "multi-number-remove", children: _jsx(X, {}) })] }, index))), props.value.length > 1 && !expanded && (_jsxs(Button, { className: "h-6 w-6", onClick: (e) => {
                    e.stopPropagation();
                    setExpanded(true);
                }, "data-tip": "Show all", variant: "ghost", size: "icon", "data-testid": "multi-number-show-all", children: ["+", props.value.length - 1] })), _jsx(Input, { ref: props.ref, className: cn('flex-1 rounded-none border-none p-0 [appearance:textfield] placeholder:font-normal placeholder:text-secondary placeholder:text-sm focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none', props.className), style: { lineHeight: '20px', width: '80px' }, type: "number", "data-testid": "multi-number-input", onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                        if (e.currentTarget.value.trim().length === 0)
                            return;
                        e.preventDefault();
                        e.stopPropagation();
                        props.onChange([...props.value, Number(e.currentTarget.value)]);
                        e.currentTarget.value = '';
                        setExpanded(false);
                    }
                }, onBlur: (e) => {
                    if (e.currentTarget.value.trim().length === 0)
                        return;
                    props.onChange([...props.value, Number(e.currentTarget.value)]);
                    e.currentTarget.value = '';
                    setExpanded(false);
                }, placeholder: "... Tab or \u23CE" })] }));
}
//# sourceMappingURL=MultiNumberInput.js.map