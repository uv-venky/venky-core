import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* Copyright (c) 2024-present VENKY Corp. */
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '../../../components/ui/dropdown-menu';
import { Label } from '../../../components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { SettingsIcon, PlusIcon, TrashIcon } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState, useTransition, useId } from 'react';
import { Checkbox } from '../../../components/ui/checkbox';
import { keys } from '../../../lib/core/common/isEmpty';
import { usePivotColumnsContext, usePivotSettingsContext, usePivotSettingsSetterContext, } from '../../../components/core/pivot/PivotContext';
import { DENSITY_PROPS } from '../../../components/core/pivot/PivotTypes';
import { aggregators } from '../../../components/core/pivot/PivotUtils';
import { ReorderableComboboxNoPopover } from '../../../components/core/common/reorderable-combobox';
const DIMENSIONS = 'dimensions';
const PIVOTS = 'pivots';
const METRICS = 'metrics';
const UI = 'ui';
const FORMULA_OPERATIONS = [
    { value: 'sum', label: 'Sum' },
    { value: 'count', label: 'Count' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'uniqueCount', label: 'Unique Count' },
];
const MATH_OPERATORS = [
    { value: '/', label: 'Divide (/)' },
    { value: '*', label: 'Multiply (*)' },
    { value: '+', label: 'Add (+)' },
    { value: '-', label: 'Subtract (-)' },
    { value: '%', label: 'Percentage (%)' },
];
function CalculatedColumnDialog({ open, onOpenChange, columns, calculatedColumn, onSave, }) {
    const [name, setName] = useState(calculatedColumn?.name ?? '');
    const [numeratorOp, setNumeratorOp] = useState(calculatedColumn?.formula.numerator.operation ?? 'sum');
    const [numeratorColumn, setNumeratorColumn] = useState(calculatedColumn?.formula.numerator.column ?? '');
    const [denominatorOp, setDenominatorOp] = useState(calculatedColumn?.formula.denominator.operation ?? 'count');
    const [denominatorColumn, setDenominatorColumn] = useState(calculatedColumn?.formula.denominator.column ?? '');
    const [mathOperator, setMathOperator] = useState(calculatedColumn?.formula.mathOperator ?? '/');
    const [width, setWidth] = useState(calculatedColumn?.width ?? 200);
    useEffect(() => {
        if (calculatedColumn && calculatedColumn.formula.type === 'aggregation') {
            setName(calculatedColumn.name);
            setNumeratorOp(calculatedColumn.formula.numerator.operation);
            setNumeratorColumn(calculatedColumn.formula.numerator.column);
            setDenominatorOp(calculatedColumn.formula.denominator.operation);
            setDenominatorColumn(calculatedColumn.formula.denominator.column);
            setMathOperator(calculatedColumn.formula.mathOperator ?? '/');
            setWidth(calculatedColumn.width ?? 200);
        }
        else {
            setName('');
            setNumeratorOp('sum');
            setNumeratorColumn('');
            setDenominatorOp('count');
            setDenominatorColumn('');
            setMathOperator('/');
            setWidth(200);
        }
    }, [calculatedColumn, open]);
    const numberColumns = columns.filter((c) => c.dataType === 'Number');
    const allColumns = columns;
    const handleSave = () => {
        if (name && numeratorColumn && denominatorColumn) {
            const widthNum = typeof width === 'number' ? width : Number(width);
            onSave({
                id: calculatedColumn?.id ?? `calc-${Date.now()}`,
                name,
                width: Number.isFinite(widthNum) && widthNum >= 50 ? widthNum : undefined,
                formula: {
                    type: 'aggregation',
                    numerator: {
                        operation: numeratorOp,
                        column: numeratorColumn,
                    },
                    denominator: {
                        operation: denominatorOp,
                        column: denominatorColumn,
                    },
                    mathOperator: mathOperator === '/' ? undefined : mathOperator, // '/' is default
                    // Don't set multiplier for '%' operator - it already multiplies by 100 internally
                    multiplier: undefined,
                },
            });
            onOpenChange(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: calculatedColumn ? 'Edit Calculated Column' : 'Add Calculated Column' }), _jsx(DialogDescription, { children: "Create a calculated column using aggregations and math operations on value columns" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Column Name" }), _jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., Conversion Rate" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Width (px)" }), _jsx(Input, { type: "number", min: 50, value: width === '' ? '' : width, onChange: (e) => {
                                        const v = e.target.value;
                                        setWidth(v === '' ? '' : Number(v));
                                    }, placeholder: "200" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Numerator" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: numeratorOp, onValueChange: (value) => setNumeratorOp(value), children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: FORMULA_OPERATIONS.map((op) => (_jsx(SelectItem, { value: op.value, children: op.label }, op.value))) })] }), _jsxs(Select, { value: numeratorColumn, onValueChange: (value) => setNumeratorColumn(value), children: [_jsx(SelectTrigger, { className: "flex-1", children: _jsx(SelectValue, { placeholder: "Select column" }) }), _jsx(SelectContent, { children: (numeratorOp === 'sum' || numeratorOp === 'avg' || numeratorOp === 'min' || numeratorOp === 'max'
                                                        ? numberColumns
                                                        : allColumns).map((col) => (_jsx(SelectItem, { value: col.key, children: col.label }, col.key))) })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Operator" }), _jsxs(Select, { value: mathOperator, onValueChange: (value) => setMathOperator(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: MATH_OPERATORS.map((op) => (_jsx(SelectItem, { value: op.value, children: op.label }, op.value))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Denominator" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: denominatorOp, onValueChange: (value) => setDenominatorOp(value), children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: FORMULA_OPERATIONS.map((op) => (_jsx(SelectItem, { value: op.value, children: op.label }, op.value))) })] }), _jsxs(Select, { value: denominatorColumn, onValueChange: (value) => setDenominatorColumn(value), children: [_jsx(SelectTrigger, { className: "flex-1", children: _jsx(SelectValue, { placeholder: "Select column" }) }), _jsx(SelectContent, { children: (denominatorOp === 'sum' ||
                                                        denominatorOp === 'avg' ||
                                                        denominatorOp === 'min' ||
                                                        denominatorOp === 'max'
                                                        ? numberColumns
                                                        : allColumns).map((col) => (_jsx(SelectItem, { value: col.key, children: col.label }, col.key))) })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { onClick: handleSave, disabled: !name || !numeratorColumn || !denominatorColumn, children: calculatedColumn ? 'Update' : 'Add' })] })] }) }));
}
function PivotSettings() {
    const columns = usePivotColumnsContext();
    const settings = usePivotSettingsContext();
    const [localSettings, setLocalSettings] = useState(settings);
    const applySettings = usePivotSettingsSetterContext();
    const [pending, startTransition] = useTransition();
    const [selectedTab, setSelectedTab] = useState(DIMENSIONS);
    const [open, setOpen] = useState(false);
    const [calcColDialogOpen, setCalcColDialogOpen] = useState(false);
    const [editingCalcCol, setEditingCalcCol] = useState();
    const noneId = useId();
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);
    const measures = columns.filter((c) => c.canBeMeasure === true);
    return (_jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(SettingsIcon, { className: "h-4 w-4" }) }) }), _jsx(PopoverContent, { className: "rounded-xl border-0 bg-transparent p-0", side: "bottom", align: "end", children: _jsxs(Card, { className: "w-[350px]", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pivot Settings" }) }), _jsx(CardContent, { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 h-[calc(var(--radix-popover-content-available-height)-180px)] overflow-y-auto", children: _jsxs(Tabs, { defaultValue: selectedTab, className: "flex h-full min-h-0 flex-col", onValueChange: (value) => setSelectedTab(value), children: [_jsxs(TabsList, { className: "mb-4 grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: DIMENSIONS, children: "Rows" }), _jsx(TabsTrigger, { value: PIVOTS, children: "Columns" }), _jsx(TabsTrigger, { value: METRICS, children: "Values" }), _jsx(TabsTrigger, { value: UI, children: "UI" })] }), _jsx(TabsContent, { value: DIMENSIONS, className: "flex flex-1 flex-col overflow-hidden rounded-md border", children: _jsx(ReorderableComboboxNoPopover, { onChange: (keys) => {
                                                // @ts-expect-error keys is an array of TColumnKey
                                                setLocalSettings((prevSettings) => ({
                                                    ...prevSettings,
                                                    rows: keys,
                                                }));
                                            }, options: columns
                                                .filter((c) => c.canBeRow !== false)
                                                .map((column) => ({
                                                value: column.key,
                                                label: column.label,
                                            })), values: localSettings.rows }) }), _jsx(TabsContent, { value: PIVOTS, className: "flex flex-1 flex-col overflow-hidden rounded-md border", children: _jsx(ReorderableComboboxNoPopover, { onChange: (keys) => {
                                                // @ts-expect-error keys is an array of TColumnKey
                                                setLocalSettings((prevSettings) => ({
                                                    ...prevSettings,
                                                    cols: keys,
                                                }));
                                            }, options: columns
                                                .filter((c) => c.canBeColumn !== false)
                                                .map((column) => ({
                                                value: column.key,
                                                label: column.label,
                                            })), values: localSettings.cols }) }), _jsxs(TabsContent, { value: METRICS, className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md border", children: [_jsx("div", { className: "min-h-[140px] shrink-0", children: _jsx(ReorderableComboboxNoPopover, { onChange: (keys) => {
                                                        // @ts-expect-error keys is an array of TColumnKey
                                                        setLocalSettings((prevSettings) => ({
                                                            ...prevSettings,
                                                            values: keys,
                                                        }));
                                                    }, options: columns
                                                        .filter((c) => c.dataType === 'Number' && c.canBeValue !== false)
                                                        .map((column) => ({
                                                        value: column.key,
                                                        label: column.label,
                                                    })), values: localSettings.values }) }), localSettings.values.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Label, { className: "mt-4 mb-2", children: "Values Position" }), _jsxs(RadioGroup, { value: localSettings.valuesPosition ?? 'columns', onValueChange: (value) => {
                                                            setLocalSettings((prevSettings) => ({
                                                                ...prevSettings,
                                                                valuesPosition: value,
                                                            }));
                                                        }, children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "columns", id: "values-position-columns" }), _jsx(Label, { htmlFor: "values-position-columns", children: "Show as Columns" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "rows", id: "values-position-rows" }), _jsx(Label, { htmlFor: "values-position-rows", children: "Show as Rows" })] })] })] })), localSettings.cols.length > 0 &&
                                                (localSettings.valuesPosition ?? 'columns') === 'columns' &&
                                                (localSettings.values.length > 1 || (localSettings.calculatedColumns?.length ?? 0) > 0) && (_jsxs("div", { className: "mt-4 flex items-start space-x-2", children: [_jsx(Checkbox, { id: "columns-before-values", checked: localSettings.columnsBeforeValues !== false, onCheckedChange: (checked) => {
                                                            setLocalSettings((prevSettings) => ({
                                                                ...prevSettings,
                                                                columnsBeforeValues: checked === true,
                                                            }));
                                                        } }), _jsxs("div", { className: "grid gap-1 leading-none", children: [_jsx(Label, { htmlFor: "columns-before-values", children: "Columns before Values" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "For each value measure, show column dimensions (e.g. channel, year). Uncheck for column dimensions outermost with values nested." })] })] })), measures.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Label, { className: "mt-4 mb-2", children: "Measure" }), _jsxs(RadioGroup, { defaultValue: localSettings.measure ?? 'none', onValueChange: (value) => {
                                                            setLocalSettings((prevSettings) => ({
                                                                ...prevSettings,
                                                                measure: value === 'none' ? undefined : value,
                                                            }));
                                                        }, children: [measures.map((column) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: column.key, id: column.key }), _jsx(Label, { htmlFor: column.key, children: column.label })] }, column.key))), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "none", id: noneId }), _jsx(Label, { htmlFor: noneId, children: "None" })] })] })] })), _jsxs("div", { className: "mt-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "font-semibold", children: "Calculated Columns" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                    setEditingCalcCol(undefined);
                                                                    setCalcColDialogOpen(true);
                                                                }, children: [_jsx(PlusIcon, { className: "mr-2 h-4 w-4" }), "Add"] })] }), localSettings.calculatedColumns && localSettings.calculatedColumns.length > 0 ? (_jsx("div", { className: "space-y-2", children: localSettings.calculatedColumns.map((calcCol) => (_jsxs("div", { className: "flex items-center justify-between rounded-md border p-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: calcCol.name }), calcCol.formula.type === 'aggregation' && (_jsxs("div", { className: "text-muted-foreground text-xs", children: [FORMULA_OPERATIONS.find((o) => o.value === calcCol.formula.numerator.operation)
                                                                                    ?.label ?? calcCol.formula.numerator.operation, "(", calcCol.formula.numerator.column, ") ", calcCol.formula.mathOperator ?? '/', ' ', FORMULA_OPERATIONS.find((o) => o.value === calcCol.formula.denominator.operation)
                                                                                    ?.label ?? calcCol.formula.denominator.operation, "(", calcCol.formula.denominator.column, ")", calcCol.formula.mathOperator === '%' && ' %'] }))] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
                                                                                setEditingCalcCol(calcCol);
                                                                                setCalcColDialogOpen(true);
                                                                            }, children: _jsx(SettingsIcon, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
                                                                                const nextSettings = {
                                                                                    ...localSettings,
                                                                                    calculatedColumns: localSettings.calculatedColumns?.filter((c) => c.id !== calcCol.id),
                                                                                };
                                                                                setLocalSettings(nextSettings);
                                                                                setOpen(false);
                                                                                startTransition(() => {
                                                                                    applySettings(nextSettings);
                                                                                });
                                                                            }, children: _jsx(TrashIcon, { className: "h-3 w-3" }) })] })] }, calcCol.id))) })) : (_jsx("p", { className: "text-muted-foreground text-sm", children: "No calculated columns added" }))] })] }), _jsxs(TabsContent, { value: UI, className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex min-h-0 flex-1 flex-col overflow-y-auto", children: [_jsx(Label, { className: "mb-4 font-semibold", children: "Density Preference" }), _jsx(RadioGroup, { onValueChange: (value) => {
                                                    setLocalSettings((prevSettings) => ({
                                                        ...prevSettings,
                                                        density: value,
                                                    }));
                                                }, value: localSettings.density ?? 'default', children: ['default', 'roomy', 'compact', 'spacious'].map((density) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: density, id: density }), _jsx(Label, { htmlFor: density, children: DENSITY_PROPS[density].label })] }, density))) }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "show-row-totals", checked: localSettings.showRowTotals !== false, onCheckedChange: (checked) => {
                                                                    setLocalSettings((prevSettings) => ({
                                                                        ...prevSettings,
                                                                        showRowTotals: checked === true,
                                                                    }));
                                                                } }), _jsxs("div", { className: "grid gap-1 leading-none", children: [_jsx(Label, { htmlFor: "show-row-totals", children: "Show row totals" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Show the row totals column on the right." })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "show-column-totals", checked: localSettings.showColumnTotals !== false, onCheckedChange: (checked) => {
                                                                    setLocalSettings((prevSettings) => ({
                                                                        ...prevSettings,
                                                                        showColumnTotals: checked === true,
                                                                    }));
                                                                } }), _jsxs("div", { className: "grid gap-1 leading-none", children: [_jsx(Label, { htmlFor: "show-column-totals", children: "Show column totals" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Show the column totals row at the bottom." })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "show-grand-total", checked: localSettings.showGrandTotal !== false, onCheckedChange: (checked) => {
                                                                    setLocalSettings((prevSettings) => ({
                                                                        ...prevSettings,
                                                                        showGrandTotal: checked === true,
                                                                    }));
                                                                } }), _jsxs("div", { className: "grid gap-1 leading-none", children: [_jsx(Label, { htmlFor: "show-grand-total", children: "Show grand total" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Show the grand total cell (bottom-right corner)." })] })] })] }), _jsxs("div", { className: "mt-4 flex items-start space-x-2", children: [_jsx(Checkbox, { id: "flatten-layout", checked: localSettings.flattenLayout ?? false, onCheckedChange: (checked) => {
                                                            setLocalSettings((prevSettings) => ({
                                                                ...prevSettings,
                                                                flattenLayout: checked === true,
                                                            }));
                                                        } }), _jsxs("div", { className: "grid gap-1 leading-none", children: [_jsx(Label, { htmlFor: "flatten-layout", children: "Flatten pivot layout" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Repeat row labels to mimic Excel's classic PivotTable layout." })] })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between gap-2", children: [selectedTab === METRICS ? (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", children: localSettings.aggregatorName }) }), _jsxs(DropdownMenuContent, { className: "w-56", children: [_jsx(DropdownMenuLabel, { children: "Appearance" }), _jsx(DropdownMenuSeparator, {}), keys(aggregators).map((value) => (_jsx(DropdownMenuCheckboxItem, { checked: localSettings.aggregatorName === value, onCheckedChange: () => {
                                                        setLocalSettings((prevSettings) => ({
                                                            ...prevSettings,
                                                            aggregatorName: value,
                                                        }));
                                                    }, children: value }, value)))] })] })) : (_jsx("div", { className: "flex-1" })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }), _jsx(Button, { onClick: () => {
                                                setOpen(false);
                                                startTransition(() => {
                                                    applySettings(localSettings);
                                                });
                                            }, disabled: pending, children: "Apply" })] })] })] }) }), _jsx(CalculatedColumnDialog, { open: calcColDialogOpen, onOpenChange: setCalcColDialogOpen, columns: columns, calculatedColumn: editingCalcCol, onSave: (calcCol) => {
                    if (editingCalcCol) {
                        // Update existing
                        const nextSettings = {
                            ...localSettings,
                            calculatedColumns: localSettings.calculatedColumns?.map((c) => (c.id === calcCol.id ? calcCol : c)) ?? [
                                calcCol,
                            ],
                        };
                        setLocalSettings(nextSettings);
                        setOpen(false);
                        startTransition(() => {
                            applySettings(nextSettings);
                        });
                    }
                    else {
                        // Add new
                        const nextSettings = {
                            ...localSettings,
                            calculatedColumns: [...(localSettings.calculatedColumns ?? []), calcCol],
                        };
                        setLocalSettings(nextSettings);
                        setOpen(false);
                        startTransition(() => {
                            applySettings(nextSettings);
                        });
                    }
                } })] }));
}
export default React.memo(PivotSettings);
//# sourceMappingURL=PivotSettings.js.map