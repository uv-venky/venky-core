import { jsx as _jsx } from "react/jsx-runtime";
/* Copyright (c) 2023-present Venky Corp. */
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import { DateRangeInput } from '../../../components/core/smart-search/DateRangeInput';
import { DateTimeRangeInput } from '../../../components/core/smart-search/DateTimeRangeInput';
import { EntryEditorOptionsValueInput } from '../../../components/core/smart-search/EntryEditorOptionsValueInput';
import { MultiNumberInput } from '../../../components/core/smart-search/MultiNumberInput';
import { MultiTextInput } from '../../../components/core/smart-search/MultiTextInput';
import { NumberRangeInput } from '../../../components/core/smart-search/NumberRangeInput';
import { hasEditor } from '../../../components/core/smart-search/operators';
import { DateInput } from '../../../components/core/date-field';
import { MultiSelectInputMayBeLookup } from '../../../components/core/smart-search/MultiSelectInputMayBeLookup';
import { SelectInputMayBeLookup } from '../../../components/core/smart-search/SelectInputMayBeLookup';
const YNOptions = [
    { label: 'Checked', value: 'Y' },
    { label: 'Unchecked', value: 'N' },
];
const BooleanOptions = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
];
const TFOptions = [
    { label: 'Checked', value: 'T' },
    { label: 'Unchecked', value: 'F' },
];
export function EntryEditorValueInput(props) {
    const { ref, column, operator, onChange, value, className, open, onOpenChange } = props;
    let editor = null;
    if (column && hasEditor(operator)) {
        if (column.type === 'Select') {
            if (['in', 'nin'].includes(operator)) {
                editor = (_jsx(MultiSelectInputMayBeLookup, { ...props, value: value, onChange: onChange, column: column }));
            }
            else {
                editor = (_jsx(SelectInputMayBeLookup, { ...props, value: value, onChange: onChange, column: column }));
            }
        }
        else if (column.type === 'TextArray') {
            editor = (_jsx(MultiSelectInputMayBeLookup, { ...props, value: value ?? [], onChange: onChange, column: column }));
        }
        else if (column.type === 'Text') {
            if (['hasall', 'hasany', 'notany', 'in', 'nin'].includes(operator)) {
                editor = _jsx(MultiTextInput, { className: className, onChange: onChange, ref: ref, value: value });
            }
            else {
                editor = (_jsx(Input, { "data-testid": "text-input", ref: ref, className: cn('w-full rounded-none border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0', className), style: { height: '28px' }, type: "text", onInput: (e) => {
                        onChange(e.currentTarget.value);
                    }, onKeyDown: (e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                            e.preventDefault();
                            onChange(e.currentTarget.value, true);
                        }
                    }, value: value ?? '' }));
            }
        }
        else if (['Number'].includes(column.type)) {
            if (['in', 'nin'].includes(operator)) {
                editor = (_jsx(MultiNumberInput, { className: className, onChange: onChange, ref: ref, value: value, column: column }));
            }
            else if (['bn'].includes(operator)) {
                editor = (_jsx(NumberRangeInput, { className: className, onChange: onChange, ref: ref, value: value, column: column }));
            }
            else {
                editor = (_jsx(Input, { "data-testid": "number-input", ref: ref, className: cn('h-full w-full rounded-none border-none [appearance:textfield] focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none', className), type: "number", 
                    // style={{ height: '28px' }}
                    onInput: (e) => {
                        onChange((e.currentTarget.value ? Number(e.currentTarget.value) : 0));
                    }, onKeyDown: (e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                            e.preventDefault();
                            onChange((e.currentTarget.value ? Number(e.currentTarget.value) : 0), true);
                        }
                    }, value: value ?? '' }));
            }
        }
        else if (column.type === 'Date' && !column.showTime) {
            if (['bn'].includes(operator)) {
                editor = (_jsx(DateRangeInput, { className: className, onValueChange: (val, done) => onChange(val, done), ref: ref, value: value, column: column }));
            }
            else {
                editor = (_jsx(DateInput, { dataTestId: "date-input", ref: ref, className: cn('h-full w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0', className), onChange: (val) => {
                        // Don't pass usingPicker as done - the native date picker fires onChange
                        // when navigating months or selecting dates, but the user isn't done yet.
                        // Only close the editor on Enter key press (handled below).
                        onChange(val);
                    }, onKeyDown: (e) => {
                        if (e.key === 'Enter' && value) {
                            e.preventDefault();
                            onChange(value, true);
                        }
                    }, value: value }));
                // editor = (
                //   <DateField
                //     value={value ? parseISO(value as string) : undefined}
                //     onChange={(value) => {
                //       console.log('value', value?.toISOString());
                //       onChange(value?.toISOString() as unknown as T);
                //     }}
                //     className="border-none p-0"
                //   />
                // );
            }
        }
        else if (column.type === 'Date' && column.showTime) {
            if (['bn'].includes(operator)) {
                editor = (_jsx(DateTimeRangeInput, { className: className, onChange: onChange, ref: ref, value: value, column: column }));
            }
            else {
                editor = (_jsx(Input, { "data-testid": "datetime-input", style: { height: '28px' }, ref: ref, className: cn('flex-1 border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0', className), type: "datetime-local", onInput: (e) => {
                        const val = e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : undefined;
                        onChange(val);
                    }, onKeyDown: (e) => {
                        if (e.key === 'Enter' && value) {
                            e.preventDefault();
                            onChange(value, true);
                        }
                    }, value: value ? format(parseISO(value), `yyyy-MM-dd'T'hh:mm`) : '' }));
            }
        }
        else if (['YN', 'TF'].includes(column.type)) {
            editor = (_jsx(EntryEditorOptionsValueInput, { ...props, options: column.type === 'YN' ? YNOptions : TFOptions, value: value, ref: ref, open: open, onOpenChange: onOpenChange }));
        }
        else if (column.type === 'Boolean') {
            editor = (_jsx(EntryEditorOptionsValueInput, { ...props, options: BooleanOptions, value: value ? 'true' : 'false', ref: ref, open: open, onOpenChange: onOpenChange, onChange: (val, done) => {
                    onChange(val === 'true', done);
                } }));
        }
    }
    return editor;
}
//# sourceMappingURL=EntryEditorValueInput.js.map