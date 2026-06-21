'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading, } from '../../components/ui/command';
import clientLogger from '../../lib/core/client/client-logger';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { getErrorMessage } from '../../lib/core/common/error';
import { cn } from '../../lib/utils';
import { ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '../../components/ui/checkbox';
export function MultiCombobox(props) {
    const { bottomGroup, className, dataTestId, disabled, emptyText = 'No options found', getLabel, getOptions, getValue, groupHeading, id, minSearchLength = 3, onOpenChange, onSelect, open, placeholder = 'Select options...', required, searchPlaceholder = 'Search for an option...', value, isLoading: isLoadingProp, getOptionsForValue, disableSortByLabel = false, trigger, topContent, } = props;
    const [filter, setFilter] = useState('');
    const [options, setOptions] = useState(props.options ?? []);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(isLoadingProp ?? false);
    const deferredFilter = useDeferredValue(filter);
    useEffect(() => {
        if (isLoadingProp != null) {
            setIsLoading(isLoadingProp);
        }
    }, [isLoadingProp]);
    useEffect(() => {
        if (!getOptions || deferredFilter.length < minSearchLength)
            return;
        setIsLoading(true);
        getOptions(deferredFilter)
            .then(setOptions)
            .catch((error) => {
            clientLogger.error({ message: 'fetch options error', error });
            toast.error(`Error fetching options: ${getErrorMessage(error)}`);
        })
            .finally(() => setIsLoading(false));
    }, [deferredFilter, getOptions, minSearchLength]);
    useEffect(() => {
        const nextOptions = disableSortByLabel
            ? (props.options ?? [])
            : [...(props.options ?? [])].sort((a, b) => getLabel(a).localeCompare(getLabel(b)));
        if (!nextOptions || nextOptions.length === 0) {
            setOptions(nextOptions);
            return;
        }
        const allIndex = nextOptions.findIndex((option) => getValue(option) === '(All)');
        if (allIndex === -1) {
            setOptions(nextOptions);
            return;
        }
        const allOption = nextOptions[allIndex];
        const remaining = [...nextOptions.slice(0, allIndex), ...nextOptions.slice(allIndex + 1)];
        setOptions([allOption, ...remaining]);
    }, [getLabel, props.options, disableSortByLabel, getValue]);
    useEffect(() => {
        if (!value.length) {
            setSelectedOptions([]);
            return;
        }
        const selectedOptions = value.map((v) => options.find((o) => getValue(o) === v) ?? null).filter(Boolean);
        if (selectedOptions) {
            setSelectedOptions(selectedOptions);
        }
        else if (options.length === 0) {
            getOptionsForValue?.(value).then((options) => {
                if (options) {
                    setSelectedOptions(options);
                }
            });
        }
    }, [options, value, getValue, getOptionsForValue]);
    const valueSet = useMemo(() => new Set(value), [value]);
    const valueOptionMap = useMemo(() => {
        const map = new Map();
        options.forEach((option) => {
            map.set(getValue(option), option);
        });
        return map;
    }, [options, getValue]);
    const filteredOptions = useMemo(() => {
        if (!filter)
            return options;
        const matches = options.filter((o) => getLabel(o).toLowerCase().includes(filter.toLowerCase()));
        const allOption = matches.find((option) => getValue(option) === '(All)');
        if (!allOption) {
            return matches;
        }
        return [allOption, ...matches.filter((option) => getValue(option) !== '(All)')];
    }, [filter, options, getLabel, getValue]);
    return (_jsxs(Popover, { open: open, onOpenChange: onOpenChange, children: [_jsx(PopoverTrigger, { asChild: true, children: trigger ?? (_jsxs(Button, { id: id, variant: "outline", role: "combobox", "aria-expanded": open, className: cn('w-full justify-between', className), "data-testid": dataTestId, disabled: disabled, children: [_jsx("span", { className: cn('min-w-0 flex-1 truncate text-left', (value.length === 0 || selectedOptions.length === 0) && 'font-normal text-muted-foreground'), children: value.length > 0 && selectedOptions.length > 0
                                ? selectedOptions.map((o) => getLabel(o)).join(', ')
                                : placeholder }), _jsxs("div", { className: "flex flex-row items-center gap-2", children: [value.length > 0 && !(required && value.length === 1) && (_jsx("div", { role: "button", className: "cursor-pointer p-2 opacity-50", "data-testid": dataTestId ? `${dataTestId}-clear` : undefined, onClick: (e) => {
                                        e.stopPropagation();
                                        onSelect([], []);
                                    }, children: _jsx(X, { className: "size-3.5" }) })), _jsx(ChevronsUpDown, { className: "opacity-50" })] })] })) }), _jsx(PopoverContent, { align: "start", className: "w-[max(var(--radix-popper-anchor-width),14rem)] max-w-[min(24rem,calc(100vw-2rem))] overflow-hidden p-0", onWheel: (e) => e.stopPropagation(), children: _jsxs(Command, { shouldFilter: false, className: "w-full min-w-0", children: [_jsxs("div", { className: "sticky top-0 z-10 bg-popover", children: [_jsx(CommandInput, { value: filter, placeholder: searchPlaceholder, className: "h-9", onValueChange: setFilter }), topContent ? _jsx("div", { className: "border-b bg-popover", children: topContent }) : null] }), _jsxs(CommandList, { className: "max-h-[calc(var(--radix-popper-available-height)-56px)] overflow-y-auto", children: [isLoading && (_jsx(CommandLoading, { children: _jsxs("div", { className: "flex flex-row items-center gap-2", children: [_jsx(Loader2, { className: "size-4 animate-spin" }), " loading..."] }) })), !isLoading && _jsx(CommandEmpty, { children: emptyText }), _jsx(CommandGroup, { heading: groupHeading, onClick: (e) => e.stopPropagation(), children: filteredOptions.length === 0 ? (_jsx(CommandItem, { disabled: true, children: emptyText })) : (filteredOptions.map((option) => (_jsx(CommandItem, { value: getValue(option), "data-testid": `combobox-item-${getValue(option)}`, onSelect: () => {
                                            const val = getValue(option);
                                            const checked = !valueSet.has(val);
                                            if (!checked && required && value.length === 1) {
                                                return;
                                            }
                                            const newValues = !checked ? value.filter((v) => v !== val) : [...value, val];
                                            onSelect(newValues, newValues.map((v) => valueOptionMap.get(v) ?? {}));
                                        }, className: "cursor-pointer", children: _jsxs("div", { className: "flex w-full items-center gap-2", children: [_jsx(Checkbox, { checked: valueSet.has(getValue(option)), tabIndex: -1, "aria-hidden": true, className: "pointer-events-none" }), _jsx("span", { className: "flex-1 truncate text-left", children: getLabel(option) })] }) }, getValue(option))))) }), bottomGroup] })] }) })] }));
}
export function MultiComboboxField({ className, dataTestId, disabled, emptyText, getLabel, getValue, groupHeading, id, onSelect, options, placeholder, required, searchPlaceholder, value, isLoading, disableSortByLabel, }) {
    const [open, setOpen] = useState(false);
    return (_jsx(MultiCombobox, { className: className, dataTestId: dataTestId, disabled: disabled, emptyText: emptyText, getLabel: getLabel, getValue: getValue, groupHeading: groupHeading, id: id, onOpenChange: setOpen, onSelect: onSelect, open: open, options: options, placeholder: placeholder, required: required, searchPlaceholder: searchPlaceholder, value: value, isLoading: isLoading, disableSortByLabel: disableSortByLabel }));
}
export function AsyncMultiComboboxField({ className, dataTestId, disabled, emptyText, getLabel, getOptions, getValue, groupHeading, id, minSearchLength = 3, onSelect, placeholder, required, searchPlaceholder, value, getOptionsForValue, disableSortByLabel = false, }) {
    const [open, setOpen] = useState(false);
    return (_jsx(MultiCombobox, { className: className, dataTestId: dataTestId, disabled: disabled, emptyText: emptyText, getLabel: getLabel, getOptions: getOptions, getValue: getValue, groupHeading: groupHeading, id: id, minSearchLength: minSearchLength, onOpenChange: setOpen, onSelect: onSelect, open: open, placeholder: placeholder, required: required, searchPlaceholder: searchPlaceholder, value: value, getOptionsForValue: getOptionsForValue, disableSortByLabel: disableSortByLabel }));
}
//# sourceMappingURL=multi-combobox.js.map