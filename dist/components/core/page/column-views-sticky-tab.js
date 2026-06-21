/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
const STICKY_LEFT_OPTIONS = [
    { value: 0, label: 'None' },
    { value: 1, label: 'First column' },
    { value: 2, label: 'First two columns' },
    { value: 3, label: 'First three columns' },
];
const STICKY_RIGHT_OPTIONS = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Last column' },
    { value: 2, label: 'Last two columns' },
    { value: 3, label: 'Last three columns' },
];
export function ColumnViewsStickyTab({ stickyLeftCount, stickyRightCount, onStickyLeftChange, onStickyRightChange, }) {
    return (_jsxs("div", { className: "flex flex-col gap-6 px-1 py-2", children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "Select which columns stay frozen on your table." }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "First columns" }), _jsx(RadioGroup, { value: String(stickyLeftCount), onValueChange: (v) => onStickyLeftChange(Number(v)), className: "gap-3", children: STICKY_LEFT_OPTIONS.map((option) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RadioGroupItem, { value: String(option.value), id: `sticky-left-${option.value}`, "data-testid": `column-views-sticky-left-${option.value}` }), _jsx(Label, { htmlFor: `sticky-left-${option.value}`, className: "cursor-pointer font-normal", children: option.label })] }, option.value))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "Last columns" }), _jsx(RadioGroup, { value: String(stickyRightCount), onValueChange: (v) => onStickyRightChange(Number(v)), className: "gap-3", children: STICKY_RIGHT_OPTIONS.map((option) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RadioGroupItem, { value: String(option.value), id: `sticky-right-${option.value}`, "data-testid": `column-views-sticky-right-${option.value}` }), _jsx(Label, { htmlFor: `sticky-right-${option.value}`, className: "cursor-pointer font-normal", children: option.label })] }, option.value))) })] })] }));
}
//# sourceMappingURL=column-views-sticky-tab.js.map