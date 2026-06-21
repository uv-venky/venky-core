/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DENSITY_PROPS } from '../../../components/core/pivot/PivotTypes';
import { PAGE_SIZE_OPTIONS } from '../../../components/core/page/table-column-preferences';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Loader2 } from 'lucide-react';
const TABLE_VARIANTS = ['compact', 'default', 'roomy', 'spacious'];
export function ColumnViewsDensityTab({ value, onChange, pageSize, onPageSizeChange, pageSizeOptions = PAGE_SIZE_OPTIONS, pageSizeDisabled = false, }) {
    return (_jsxs("div", { className: "flex flex-col gap-6 px-1 py-2", children: [_jsx("p", { className: "text-muted-foreground text-sm", children: "Adjust row height and how many rows load per page." }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "Row height" }), _jsx(RadioGroup, { value: value, onValueChange: (v) => onChange(v), className: "gap-3", children: TABLE_VARIANTS.map((variant) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RadioGroupItem, { value: variant, id: `density-${variant}`, "data-testid": `column-views-density-${variant}` }), _jsx(Label, { htmlFor: `density-${variant}`, className: "cursor-pointer font-normal", children: DENSITY_PROPS[variant].label })] }, variant))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "Rows per page" }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs(Select, { value: `${pageSize}`, disabled: pageSizeDisabled, onValueChange: (v) => onPageSizeChange(Number(v)), children: [_jsx(SelectTrigger, { className: "h-8 w-[5.5rem]", "data-testid": "column-views-page-size-trigger", "aria-label": "Rows per page", children: pageSizeDisabled ? (_jsx(Loader2, { className: "size-4 animate-spin", "aria-hidden": "true" })) : (_jsx(SelectValue, { placeholder: pageSize })) }), _jsx(SelectContent, { side: "top", children: pageSizeOptions.map((option) => (_jsx(SelectItem, { value: `${option}`, "data-testid": `column-views-page-size-option-${option}`, children: option }, option))) })] }) })] })] }));
}
//# sourceMappingURL=column-views-density-tab.js.map