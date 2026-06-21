'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading, } from '../../components/ui/command';
import clientLogger from '../../lib/core/client/client-logger';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { getErrorMessage } from '../../lib/core/common/error';
import { cn } from '../../lib/utils';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useDebounce from '../../components/core/hooks/useDebounce';
export function Combobox(props) {
    const { bottomGroup, className, dataTestId, disableSortByLabel = false, disabled, emptyText = 'No options found', getIcon, getLabel, getOptionForValue, getOptions, getValue, renderOption, groupHeading, id, isLoading: isLoadingProp, minSearchLength = 3, onOpenChange, onSelect, open, placeholder = 'Select an option...', required, searchPlaceholder = 'Search for an option...', value, } = props;
    const [filter, setFilter] = useState('');
    const [options, setOptions] = useState(props.options ?? []);
    const [selectedOption, setSelectedOption] = useState(undefined);
    const [isLoading, setIsLoading] = useState(isLoadingProp ?? false);
    const [deferredFilter, setDeferredFilter] = useState('');
    const [debouncedSetFilter] = useDebounce(setDeferredFilter);
    useEffect(() => {
        if (isLoadingProp != null) {
            setIsLoading(isLoadingProp);
        }
    }, [isLoadingProp]);
    useEffect(() => {
        debouncedSetFilter(600, filter);
    }, [filter, debouncedSetFilter]);
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
        if (disableSortByLabel) {
            setOptions(props.options ?? []);
        }
        else {
            setOptions([...(props.options ?? [])].sort((a, b) => getLabel(a).localeCompare(getLabel(b))));
        }
    }, [getLabel, props.options, disableSortByLabel]);
    useEffect(() => {
        if (!value) {
            setSelectedOption(undefined);
            return;
        }
        const selectedOption = options.find((o) => getValue(o) === value);
        if (selectedOption) {
            setSelectedOption(selectedOption);
        }
        else if (options.length === 0) {
            getOptionForValue?.(value).then((option) => {
                if (option) {
                    setSelectedOption(option);
                }
            });
        }
    }, [options, value, getValue, getOptionForValue]);
    const filteredOptions = useMemo(() => {
        if (!filter)
            return options;
        return options.filter((o) => getLabel(o).toLowerCase().includes(filter.toLowerCase()));
    }, [filter, options, getLabel]);
    return (_jsxs(Popover, { open: open, onOpenChange: onOpenChange, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { id: id, variant: "outline", role: "combobox", "aria-expanded": open, className: cn('justify-between', className), "data-testid": dataTestId ? `${dataTestId}-trigger` : undefined, disabled: disabled, children: [_jsx("div", { className: "flex min-w-0 flex-1 items-center gap-2 truncate whitespace-nowrap", children: value && selectedOption && renderOption ? (_jsx("span", { className: "min-w-0 flex-1 truncate", children: renderOption(selectedOption) })) : value && selectedOption ? (_jsxs(_Fragment, { children: [getIcon?.(selectedOption), _jsx("span", { className: "truncate", children: getLabel(selectedOption) })] })) : (_jsx("span", { className: cn('truncate', !value && 'font-normal text-muted-foreground'), children: value ? value : placeholder })) }), _jsxs("div", { className: "flex flex-row items-center gap-2", children: [value && !required && (_jsx("div", { role: "button", className: "cursor-pointer p-2 opacity-50", "data-testid": dataTestId ? `${dataTestId}-clear` : undefined, onClick: (e) => {
                                        e.stopPropagation();
                                        onSelect(undefined, undefined);
                                    }, children: _jsx(X, { className: "size-3.5" }) })), _jsx(ChevronsUpDown, { className: "opacity-50" })] })] }) }), _jsx(PopoverContent, { className: "p-0", onWheel: (e) => e.stopPropagation(), onKeyDown: (e) => {
                    e.stopPropagation();
                }, children: _jsxs(Command, { shouldFilter: false, className: "min-w-[var(--radix-popper-anchor-width)]", children: [_jsx(CommandInput, { value: filter, placeholder: searchPlaceholder, className: "h-9", onValueChange: setFilter, "data-testid": dataTestId ? `${dataTestId}-search` : undefined }), _jsxs(CommandList, { className: "max-h-[calc(var(--radix-popper-available-height)-56px)] overflow-y-auto", children: [isLoading && (_jsx(CommandLoading, { children: _jsxs("div", { className: "flex flex-row items-center gap-2", children: [_jsx(Loader2, { className: "size-4 animate-spin" }), " loading..."] }) })), !isLoading && _jsx(CommandEmpty, { children: emptyText }), _jsx(CommandGroup, { heading: groupHeading, onClick: (e) => e.stopPropagation(), children: filteredOptions.length === 0 ? (_jsx(CommandItem, { disabled: true, children: emptyText })) : (filteredOptions.map((option) => (_jsxs(CommandItem, { value: getValue(option), "data-testid": dataTestId ? `${dataTestId}-item-${getValue(option)}` : `combobox-item-${getValue(option)}`, onSelect: () => {
                                            onSelect(value && getValue(option) === value ? (required ? value : undefined) : getValue(option), value && getValue(option) === value ? (required ? option : undefined) : option);
                                            onOpenChange?.(false);
                                        }, className: "cursor-pointer", children: [renderOption ? (renderOption(option)) : (_jsxs(_Fragment, { children: [getIcon?.(option), getLabel(option)] })), _jsx(Check, { className: cn('ml-auto', value && value === getValue(option) ? 'opacity-100' : 'opacity-0') })] }, getValue(option))))) }), bottomGroup] })] }) })] }));
}
export function ComboboxField({ className, dataTestId, disableSortByLabel, disabled, emptyText, getLabel, getValue, getIcon, renderOption, groupHeading, id, isLoading, onSelect, options, placeholder, required, searchPlaceholder, value, }) {
    const [open, setOpen] = useState(false);
    return (_jsx(Combobox, { className: className, dataTestId: dataTestId, disableSortByLabel: disableSortByLabel, disabled: disabled, emptyText: emptyText, getLabel: getLabel, getValue: getValue, getIcon: getIcon, renderOption: renderOption, groupHeading: groupHeading, id: id, isLoading: isLoading, onOpenChange: setOpen, onSelect: onSelect, open: open, options: options, placeholder: placeholder, required: required, searchPlaceholder: searchPlaceholder, value: value }));
}
export function AsyncComboboxField({ className, dataTestId, disabled, emptyText, getIcon, getLabel, getOptions, getValue, renderOption, groupHeading, id, minSearchLength = 3, onSelect, placeholder, required, searchPlaceholder, value, getOptionForValue, disableSortByLabel, }) {
    const [open, setOpen] = useState(false);
    return (_jsx(Combobox, { className: className, dataTestId: dataTestId, disabled: disabled, emptyText: emptyText, getIcon: getIcon, getLabel: getLabel, getOptions: getOptions, getValue: getValue, renderOption: renderOption, groupHeading: groupHeading, id: id, minSearchLength: minSearchLength, onOpenChange: setOpen, onSelect: onSelect, open: open, placeholder: placeholder, required: required, searchPlaceholder: searchPlaceholder, value: value, getOptionForValue: getOptionForValue, disableSortByLabel: disableSortByLabel }));
}
//# sourceMappingURL=combobox.js.map