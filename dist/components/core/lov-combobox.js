/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { AsyncMultiComboboxField } from '../../components/core/multi-combobox';
import { cn } from '../../lib/utils';
export default function LOVCombobox({ open, onOpenChange, store: _store, onSelect, title = 'Select Values', placeholder = 'Select...', searchPlaceholder = 'Search...', getLabel, getValue, getOptions, getOptionsForValue, minSearchLength = 2, trigger, className, singleSelection = false, value = [], }) {
    const [selectedValues, setSelectedValues] = useState(value);
    const selectedOptionsRef = useRef([]);
    const shouldResetOnCloseRef = useRef(false);
    useEffect(() => {
        setSelectedValues(value);
    }, [value]);
    // Reset selection when popover closes after a successful confirmation
    useEffect(() => {
        if (!open && shouldResetOnCloseRef.current) {
            // Reset selection after popover closes (only if we confirmed)
            setSelectedValues([]);
            selectedOptionsRef.current = [];
            shouldResetOnCloseRef.current = false;
        }
    }, [open]);
    const handleSelect = (values, options) => {
        setSelectedValues(values);
        selectedOptionsRef.current = options;
        // For single selection, auto-submit and close
        if (singleSelection && values.length > 0) {
            onSelect(values, options);
            shouldResetOnCloseRef.current = true;
            onOpenChange(false);
        }
        // For multi-select, don't call onSelect yet - wait for user to click "Select" button
    };
    const handleConfirm = async () => {
        if (selectedValues.length === 0)
            return;
        // Get the full row data for selected values
        let rows = [];
        if (selectedOptionsRef.current.length > 0) {
            rows = selectedOptionsRef.current;
        }
        else if (getOptionsForValue) {
            // Fallback: fetch options if we don't have them in ref
            rows = await getOptionsForValue(selectedValues);
        }
        onSelect(selectedValues, rows);
        shouldResetOnCloseRef.current = true;
        onOpenChange(false);
        // Don't reset here - let the useEffect handle it when popover closes
    };
    const handleCancel = () => {
        shouldResetOnCloseRef.current = false; // Don't reset on cancel
        onOpenChange(false);
        // Keep selection for next time when cancelled
    };
    // If no trigger is provided, use a hidden button as trigger
    const triggerButton = trigger || (_jsx(Button, { variant: "outline", className: "sr-only", "aria-hidden": "true", children: title }));
    return (_jsxs(Popover, { open: open, onOpenChange: handleCancel, modal: true, children: [_jsx(PopoverTrigger, { asChild: true, children: triggerButton }), open && (_jsx(PopoverContent, { className: cn('w-[500px] p-0', className), align: "end", side: "bottom", sideOffset: -1, onInteractOutside: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, children: _jsxs("div", { className: "flex flex-col p-4", children: [_jsx("div", { className: "mb-3 font-semibold text-sm", children: title }), _jsx(AsyncMultiComboboxField, { value: selectedValues, onSelect: handleSelect, getOptions: getOptions, getLabel: getLabel, getValue: getValue, getOptionsForValue: getOptionsForValue, placeholder: placeholder, searchPlaceholder: searchPlaceholder, minSearchLength: minSearchLength, emptyText: "No options found", className: "w-full" }, `lov-combobox-${open}`), !singleSelection && (_jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: handleCancel, children: "Cancel" }), _jsxs(Button, { onClick: handleConfirm, disabled: selectedValues.length === 0, children: ["Select (", selectedValues.length, ")"] })] }))] }) }))] }));
}
//# sourceMappingURL=lov-combobox.js.map