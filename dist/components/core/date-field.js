'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Input } from '../../components/ui/input';
import { isValid, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { isEmpty } from '../../lib/core/common/isEmpty';
import { maskDate } from '../../components/core/utils/demoMask';
export function DatePicker({ value, onChange, placeholder = 'Pick a date', className, }) {
    return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', className: cn('w-[240px] justify-start text-left font-normal', !value && 'text-muted-foreground', className), children: [_jsx(CalendarIcon, {}), value ? maskDate(format(value, 'PPP')) : _jsx("span", { children: placeholder })] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: value, onSelect: onChange, initialFocus: true, required: true }) })] }));
}
function convertISOToDateTimeLocal(value, showTime) {
    const date = typeof value === 'string' ? parseISO(value) : value;
    return format(date, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd');
}
export function DateInput({ className, value, onChange, ref, style, dataTestId, disabled, placeholder, id, onFocus, onBlur, min, max, autoFocus, showTime = false, onKeyDown, onPaste, }) {
    const [localValue, setLocalValue] = useState(() => (value ? convertISOToDateTimeLocal(value, showTime) : ''));
    const [keyDown, setKeyDown] = useState(false);
    useEffect(() => {
        setLocalValue(value ? convertISOToDateTimeLocal(value, showTime) : '');
    }, [value, showTime]);
    return (_jsx(Input, { autoFocus: autoFocus, onFocus: onFocus, onBlur: onBlur, id: id, placeholder: placeholder, "data-testid": dataTestId, ref: ref, className: cn(className), type: showTime ? 'datetime-local' : 'date', style: style, onKeyDown: (e) => {
            setKeyDown(true);
            onKeyDown?.(e);
        }, onChange: onChange
            ? (e) => {
                const usingPicker = !keyDown;
                setKeyDown(false);
                const val = e.currentTarget.value;
                //console.log('val', val);
                if (val) {
                    const date = parse(val, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd', new Date());
                    //console.log('val', val, date);
                    if (isValid(date)) {
                        const minDate = min ? (typeof min === 'string' ? parseISO(min) : min) : undefined;
                        const maxDate = max ? (typeof max === 'string' ? parseISO(max) : max) : undefined;
                        if ((minDate && isBefore(date, minDate)) || (maxDate && isAfter(date, maxDate))) {
                            setLocalValue(val);
                            return;
                        }
                        onChange(showTime ? date.toISOString() : val, usingPicker);
                    }
                }
                else if (isEmpty(val)) {
                    onChange(undefined, usingPicker);
                }
                setLocalValue(val);
            }
            : undefined, value: localValue, disabled: disabled, min: min ? convertISOToDateTimeLocal(min, showTime) : undefined, max: max ? convertISOToDateTimeLocal(max, showTime) : undefined, onPaste: onPaste
            ? (value) => {
                value.preventDefault();
                onPaste(value.clipboardData.getData('text/plain'), 'Date');
            }
            : undefined }));
}
export function TimeInput({ className, value, onChange, ref, style, dataTestId, disabled, placeholder, id, onFocus, onBlur, step, }) {
    const [localValue, setLocalValue] = useState(() => value ?? '');
    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);
    return (_jsx(Input, { onFocus: onFocus, onBlur: onBlur, id: id, placeholder: placeholder, "data-testid": dataTestId, ref: ref, className: cn(className), type: "time", style: style, onChange: onChange
            ? (e) => {
                let val = e.currentTarget.value;
                if (val.length === 5) {
                    val = `${val}:00`;
                }
                onChange(val);
                setLocalValue(val);
            }
            : undefined, defaultValue: localValue, disabled: disabled, step: step }));
}
//# sourceMappingURL=date-field.js.map