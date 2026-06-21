'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../components/ui/button';
import { DropdownMenu as DropdownMenuComponent, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, } from '../../components/ui/dropdown-menu';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
export function DropdownMenuField({ options, value, onChange, getLabel, getValue, placeholder = 'Select...', children, startIcon, open, onOpenChange, onCloseAutoFocus, dataTestId, iconTrigger = false, }) {
    const selected = useMemo(() => options.find((option) => getValue(option) === value), [options, value, getValue]);
    return (_jsxs(DropdownMenuComponent, { open: open, onOpenChange: onOpenChange, modal: false, children: [startIcon, _jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", "data-testid": dataTestId, size: iconTrigger ? 'icon' : 'default', "data-tip": iconTrigger && selected && typeof getLabel(selected) === 'string' ? getLabel(selected) : undefined, children: _jsxs("div", { className: "flex flex-row items-center justify-between gap-2", children: [children ?? (selected ? getLabel(selected) : placeholder), !iconTrigger && _jsx(ChevronDown, { className: "size-4" })] }) }) }), _jsx(DropdownMenuContent, { className: "max-h-[var(--radix-popper-available-height)] overflow-auto", onCloseAutoFocus: onCloseAutoFocus, onKeyDown: (e) => {
                    e.stopPropagation();
                }, children: _jsx(DropdownMenuRadioGroup, { value: value, onValueChange: onChange, children: options.map((option) => (_jsx(DropdownMenuRadioItem, { "data-testid": `dropdown-menu-item-${getValue(option)}`, value: getValue(option), className: "flex cursor-pointer items-center justify-between whitespace-nowrap", children: getLabel(option) }, getValue(option)))) }) })] }));
}
//# sourceMappingURL=dropdown-menu.js.map