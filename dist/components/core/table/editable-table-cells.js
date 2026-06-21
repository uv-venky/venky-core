import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';
import { useEffect, useState } from 'react';
import { useCellErrors, useCurrentRowId, useDBRows, useIsStoreLoading, useRowValue, useValue, useValueSetter, } from '../../../components/core/hooks/useStoreHooks';
import { ComboboxField } from '../../../components/core/combobox';
import TableCell, { DirtyCellIndicator } from '../../../components/core/table/table-cell';
import { DateInput } from '../../../components/core/date-field';
import { normalizeTextFieldWhitespace } from '../../../lib/core/common/normalizeTextFieldWhitespace';
import { isValid, parse } from 'date-fns';
const toISO = (date) => {
    const isoDate = parse(date, 'MM/dd/yyyy', new Date());
    if (isValid(isoDate)) {
        isoDate.setHours(12, 0, 0, 0);
        return isoDate.toISOString();
    }
    return null;
};
export async function onDataPaste(data, store, dataType, attributeCode) {
    const pastedValues = data.trim().split(/\r\n|\n|\r/);
    if (pastedValues.length === 0) {
        return;
    }
    const allRowIds = store.rowIds();
    const currentRowId = store.currentRowId();
    const startIndex = allRowIds.indexOf(currentRowId ?? '');
    if (startIndex === -1) {
        console.error('Current row ID not found.');
        return;
    }
    for (const [index, value] of pastedValues.entries()) {
        const targetRowIndex = startIndex + index;
        let targetRowId;
        let parsedValue = value;
        switch (dataType) {
            case 'Number':
                parsedValue = Number.isNaN(Number(value)) ? 0 : Number(value);
                break;
            case 'Date':
                parsedValue = toISO(value);
                break;
        }
        const partialRecord = {
            [attributeCode]: parsedValue,
        };
        if (targetRowIndex < allRowIds.length) {
            targetRowId = allRowIds[targetRowIndex];
            store.updateRow(targetRowId, partialRecord);
        }
        else {
            targetRowId = await store.createNew({
                partialRecord,
                addOnTop: false,
            });
        }
        //fetchDetailsAndUpdateRow(targetRowId??'', value);
    }
}
export function EditableNumberCell(props) {
    const { row, store, disabled, feedbackMask } = props;
    const currentRowId = useCurrentRowId(store);
    const rowId = row.id;
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (focused && currentRowId !== rowId) {
            setFocused(false);
        }
    }, [focused, currentRowId, rowId]);
    if (currentRowId !== rowId || disabled) {
        return (_jsx("div", { className: "h-full w-full", onClickCapture: () => {
                setFocused(true);
            }, children: _jsx(TableCell, { ...props, type: "Number", className: "cursor-text" }) }));
    }
    return _jsx(NumberInputCell, { ...props, autoFocus: focused, feedbackMask: feedbackMask });
}
function NumberInputCell(props) {
    const { attributeCode, className, disabled, store, autoFocus, row, onPaste, doValidate, feedbackMask } = props;
    const value = useRowValue(store, row.id, attributeCode);
    const onChange = useValueSetter(store, attributeCode);
    const errorMsg = useCellErrors(store, row.id, attributeCode);
    return (_jsx(DirtyCellIndicator, { rowId: row.id, store: store, attributeCode: attributeCode, feedbackMask: feedbackMask, children: _jsx(Input, { type: "number", value: value ?? '', className: cn('relative h-full rounded-none bg-background px-2 py-0 text-right', className, errorMsg != null && 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500'), onChange: (e) => {
                const value = Number(e.target.value);
                if (Number.isNaN(value)) {
                    return;
                }
                doValidate?.(e.target.value);
                onChange(value);
            }, disabled: disabled, autoFocus: autoFocus, onFocus: (e) => {
                e.target.select();
            }, onPaste: onPaste
                ? (value) => {
                    value.preventDefault();
                    onPaste(value.clipboardData.getData('text/plain'), 'Number');
                }
                : undefined }) }));
}
export function EditableTextCell(props) {
    const { row, store, disabled, feedbackMask } = props;
    const currentRowId = useCurrentRowId(store);
    const rowId = row.id;
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (focused && currentRowId !== rowId) {
            setFocused(false);
        }
    }, [focused, currentRowId, rowId]);
    if (currentRowId !== rowId || disabled) {
        return (_jsx("div", { className: "h-full w-full", onClickCapture: () => {
                setFocused(true);
            }, children: _jsx(TableCell, { ...props, type: "Text" }) }));
    }
    return _jsx(TextInputCell, { ...props, autoFocus: focused, feedbackMask: feedbackMask });
}
function TextInputCell(props) {
    const { attributeCode, className, disabled, store, autoFocus, row, onPaste, doValidate, feedbackMask } = props;
    const value = useValue(store, attributeCode);
    const onChange = useValueSetter(store, attributeCode);
    const errorMsg = useCellErrors(store, row.id, attributeCode);
    return (_jsx(DirtyCellIndicator, { rowId: row.id, store: store, attributeCode: attributeCode, feedbackMask: feedbackMask, children: _jsx(Input, { type: "text", value: value ?? '', className: cn('h-full rounded-none bg-background px-2 py-0', className, errorMsg != null && 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500'), onChange: (e) => {
                onChange(e.target.value);
                doValidate?.(e.target.value);
            }, disabled: disabled, autoFocus: autoFocus, onFocus: (e) => {
                e.target.select();
            }, onBlur: () => {
                const normalized = normalizeTextFieldWhitespace(value === '' ? undefined : value);
                if (normalized !== value) {
                    onChange(normalized);
                    doValidate?.(normalized);
                }
            }, onPaste: onPaste
                ? (pasteEv) => {
                    pasteEv.preventDefault();
                    onPaste(pasteEv.clipboardData.getData('text/plain'), 'Text');
                }
                : undefined }) }));
}
export function EditableComboboxInputCell(props) {
    const { row, store, disabled, feedbackMask } = props;
    const currentRowId = useCurrentRowId(store);
    const rowId = row.id;
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (focused && currentRowId !== rowId) {
            setFocused(false);
        }
    }, [focused, currentRowId, rowId]);
    if (currentRowId !== rowId || disabled) {
        return (_jsx("div", { className: "h-full w-full", onClickCapture: () => {
                setFocused(true);
            }, children: _jsx(TableCell, { ...props, type: "Text" }) }));
    }
    return _jsx(ComboboxInputCell, { ...props, feedbackMask: feedbackMask });
}
function ComboboxInputCell(props) {
    const { attributeCode, className, disabled, store, optionsStore, row, label, getLabel, getOptionValue, feedbackMask, } = props;
    const value = useValue(store, attributeCode);
    const onChange = useValueSetter(store, attributeCode);
    const isPlanLoading = useIsStoreLoading(optionsStore);
    const comboboxOptions = useDBRows(optionsStore);
    return (_jsx(DirtyCellIndicator, { rowId: row.id, store: store, attributeCode: attributeCode, feedbackMask: feedbackMask, children: _jsx(ComboboxField, { className: cn('h-full w-full bg-background px-2 py-0', className), value: value, options: comboboxOptions, getValue: getOptionValue, getLabel: getLabel, onSelect: (optionValue) => {
                onChange(optionValue);
            }, placeholder: `Select a ${label}...`, searchPlaceholder: `Search for a ${label}...`, emptyText: `No ${label}s found`, isLoading: isPlanLoading, disabled: disabled }) }));
}
export function EditableYNCell(props) {
    const { row, store, attributeCode, disabled, handleClick } = props;
    const rowId = row.id;
    const value = useValue(store, attributeCode);
    return (_jsx("div", { className: cn('h-full w-full', !disabled && 'cursor-pointer'), onClickCapture: () => {
            if (disabled) {
                return;
            }
            store.setValue(attributeCode, value === 'Y' ? 'N' : 'Y', rowId);
            handleClick?.();
        }, children: _jsx(TableCell, { ...props, type: "YN" }) }));
}
export function EditableBooleanCell(props) {
    const { row, store, attributeCode, disabled } = props;
    const rowId = row.id;
    const value = useValue(store, attributeCode);
    return (_jsx("div", { className: cn('h-full w-full', !disabled && 'cursor-pointer'), onClickCapture: () => {
            if (disabled) {
                return;
            }
            store.setValue(attributeCode, !value, rowId);
        }, children: _jsx(TableCell, { ...props, type: "Boolean" }) }));
}
export function EditableTFCell(props) {
    const { row, store, attributeCode, disabled } = props;
    const rowId = row.id;
    const value = useValue(store, attributeCode);
    return (_jsx("div", { className: cn('h-full w-full', !disabled && 'cursor-pointer'), onClickCapture: () => {
            if (disabled) {
                return;
            }
            store.setValue(attributeCode, value === 'T' ? 'F' : 'T', rowId);
        }, children: _jsx(TableCell, { ...props, type: "TF" }) }));
}
export function EditableDateCell(props) {
    const { row, store, disabled, feedbackMask } = props;
    const currentRowId = useCurrentRowId(store);
    const rowId = row.id;
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (focused && currentRowId !== rowId) {
            setFocused(false);
        }
    }, [focused, currentRowId, rowId]);
    if (currentRowId !== rowId || disabled) {
        return (_jsx("div", { className: "h-full w-full", onClickCapture: () => {
                setFocused(true);
            }, children: _jsx(TableCell, { ...props, type: "Date" }) }));
    }
    return _jsx(DateInputCell, { ...props, autoFocus: focused, feedbackMask: feedbackMask });
}
function DateInputCell(props) {
    const { attributeCode, className, disabled, store, autoFocus, row, min, max, onPaste, doValidate, feedbackMask } = props;
    const value = useValue(store, attributeCode);
    const onChange = useValueSetter(store, attributeCode);
    const errorMsg = useCellErrors(store, row.id, attributeCode);
    return (_jsx(DirtyCellIndicator, { rowId: row.id, store: store, attributeCode: attributeCode, feedbackMask: feedbackMask, children: _jsx(DateInput, { value: value ?? '', className: cn('h-full rounded-none bg-background px-2 py-0', className, errorMsg != null && 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500'), onChange: (value) => {
                doValidate?.(value);
                onChange(value);
            }, disabled: disabled, autoFocus: autoFocus, min: min, max: max, onPaste: onPaste }) }));
}
//# sourceMappingURL=editable-table-cells.js.map