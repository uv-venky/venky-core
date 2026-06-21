/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../../../components/ui/button';
import { Calendar } from '../../../components/ui/calendar';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { isEmpty } from '../../../lib/core/common/isEmpty';
import { normalizeTextFieldWhitespace } from '../../../lib/core/common/normalizeTextFieldWhitespace';
import { cn } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import { AlertTriangleIcon, CalendarIcon, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AsyncComboboxField, ComboboxField } from '../../../components/core/combobox';
import { DateInput as DateField, TimeInput as TimeField } from '../../../components/core/date-field';
import { useLatest } from '../../../components/core/hooks/useLatest';
import { AsyncMultiComboboxField, MultiComboboxField } from '../../../components/core/multi-combobox';
import { getLookupsByType } from '../../../lib/core/client/lookups';
import {
  useCellErrors,
  useCurrentRowId,
  useIsRowAttributeDirty,
  useRowValue,
} from '../../../components/core/hooks/useStoreHooks';
import { DIRTY_FIELD_INDICATOR_CLASS } from '../../../components/core/utils/dirty-indicator';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
function useStoreBackedField(store, rowId, attributeCode) {
  const currentRowId = useCurrentRowId(store);
  const resolvedRowId = rowId ?? currentRowId ?? '';
  const value = useRowValue(store, resolvedRowId, attributeCode);
  const onChange = useCallback(
    (v) => {
      store.setValue(attributeCode, v, resolvedRowId);
    },
    [store, attributeCode, resolvedRowId],
  );
  const isDirty = useIsRowAttributeDirty(store, resolvedRowId, attributeCode);
  const errorText = useCellErrors(store, resolvedRowId, attributeCode);
  return { value, onChange, isDirty, errorText };
}
export function InputShell({
  label,
  disabled = false,
  labelOnTop = false,
  helpText,
  required = false,
  children,
  className,
  errorText,
}) {
  const id = useId();
  const stackLabel = labelOnTop || label == null;
  return _jsxs('div', {
    className: cn(
      'relative grid min-w-0 self-start',
      stackLabel ? 'grid-cols-1 content-start items-start gap-2' : 'grid-cols-3 items-center gap-x-4 gap-y-2',
      className,
    ),
    children: [
      label &&
        _jsxs(Label, {
          htmlFor: id,
          className: cn(
            'flex items-center gap-2',
            labelOnTop ? 'flex-row text-left' : 'row-start-1 flex-row-reverse self-center text-right',
            disabled && 'text-muted-foreground',
          ),
          children: [
            label,
            ' ',
            required && _jsx('span', { className: 'font-bold', children: '*' }),
            errorText &&
              _jsx(AlertTriangleIcon, {
                className: 'h-4 items-center text-red-500',
                'data-tip': errorText,
                'data-tip-error': true,
              }),
          ],
        }),
      children({ id, required, disabled }),
      helpText &&
        _jsx('p', {
          className: cn('text-muted-foreground text-xs', !labelOnTop && 'col-span-2 col-start-2 row-start-2'),
          children: helpText,
        }),
    ],
  });
}
function TextInputStoreBacked({
  store,
  rowId,
  attributeCode,
  transformValue,
  trimOnBlur,
  type,
  errorText: propErrorText,
  ...rest
}) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  const effectiveType = type ?? 'text';
  const effectiveTrimOnBlur = trimOnBlur ?? effectiveType !== 'password';
  const applyBlurTransform = useMemo(() => {
    if (!effectiveTrimOnBlur && !transformValue) {
      return undefined;
    }
    return (v) => {
      let t = v;
      if (effectiveTrimOnBlur) {
        t = normalizeTextFieldWhitespace(t);
      }
      if (transformValue) {
        t = transformValue(t);
      }
      return t;
    };
  }, [effectiveTrimOnBlur, transformValue]);
  return _jsx(TextInputControlled, {
    ...rest,
    type: effectiveType,
    value: value ?? null,
    onChange: onChange,
    applyBlurTransform: applyBlurTransform,
    isDirty: isDirty,
    errorText: errorText ?? propErrorText,
  });
}
function TextInputControlled({
  value,
  onChange,
  onValueChange,
  applyBlurTransform,
  label,
  disabled = false,
  labelOnTop = false,
  placeholder = '',
  multiline = false,
  rows,
  helpText,
  required = false,
  className,
  rightIcon,
  errorText,
  type = 'text',
  dataTestId,
  valid,
  autoFocus = false,
  autoComplete = 'off',
  name,
  minLength,
  isDirty = false,
  inputClassName,
}) {
  const Component = multiline ? Textarea : Input;
  const focusValue = useRef(value);
  const [internalValue, setInternalValue] = useState(value);
  const latestRef = useLatest(internalValue);
  useEffect(() => {
    if (latestRef.current !== value) {
      setInternalValue(value);
    }
  }, [value, latestRef]);
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsxs('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && cn('before:pointer-events-none', DIRTY_FIELD_INDICATOR_CLASS),
        ),
        children: [
          _jsx(Component, {
            id: id,
            name: name,
            minLength: minLength,
            autoFocus: autoFocus,
            'data-testid': dataTestId,
            value: internalValue ?? '',
            autoComplete: autoComplete,
            ...(multiline && rows != null ? { rows } : {}),
            className: cn(
              'w-full',
              errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
              (rightIcon || (valid && !errorText)) && 'pr-12',
              inputClassName,
            ),
            onChange: (e) => {
              const val = isEmpty(e.target.value) ? undefined : e.target.value;
              setInternalValue(val);
              onChange?.(val);
            },
            type: type,
            disabled: disabled,
            placeholder: placeholder,
            required: required,
            onFocus: applyBlurTransform
              ? undefined
              : onValueChange
                ? () => {
                    focusValue.current = internalValue;
                  }
                : undefined,
            onBlur: applyBlurTransform
              ? () => {
                  const v = internalValue === '' || internalValue == null ? undefined : internalValue;
                  const t = applyBlurTransform(v);
                  if (t !== v) {
                    setInternalValue(t);
                    onChange?.(t);
                    onValueChange?.(t);
                  }
                }
              : onValueChange
                ? () => {
                    if (focusValue.current !== internalValue) {
                      onValueChange(internalValue === '' || internalValue == null ? undefined : internalValue);
                    }
                  }
                : undefined,
            ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
          }),
          ((valid && !errorText) || rightIcon) &&
            _jsxs('div', {
              className: 'absolute right-4 bottom-1/2 flex translate-y-1/2 items-center gap-2',
              children: [valid && !errorText && _jsx(Check, { className: 'size-4 text-green-500' }), rightIcon],
            }),
        ],
      }),
  });
}
function TextInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, onValueChange, isDirty, trimOnBlur, type, ...rest } = props;
  const effectiveType = type ?? 'text';
  const effectiveTrimOnBlur = trimOnBlur ?? effectiveType !== 'password';
  const controlledApplyBlur = useMemo(
    () => (!effectiveTrimOnBlur ? undefined : (v) => normalizeTextFieldWhitespace(v)),
    [effectiveTrimOnBlur],
  );
  if (store != null && attributeCode != null) {
    return _jsx(TextInputStoreBacked, {
      store: store,
      attributeCode: attributeCode,
      rowId: rowId,
      trimOnBlur: trimOnBlur,
      type: type,
      ...rest,
    });
  }
  return _jsx(TextInputControlled, {
    ...rest,
    type: effectiveType,
    value: value,
    onChange: onChange,
    onValueChange: onValueChange,
    applyBlurTransform: controlledApplyBlur,
    isDirty: isDirty,
  });
}
function PasswordInputComponent(props) {
  const [showPassword, setShowPassword] = useState(false);
  return _jsx(TextInputComponent, {
    ...props,
    type: showPassword ? 'text' : 'password',
    trimOnBlur: props.trimOnBlur ?? false,
    rightIcon: _jsx(Button, {
      type: 'button',
      variant: 'ghost',
      size: 'sm',
      className: 'h-full hover:bg-transparent',
      onClick: () => setShowPassword(!showPassword),
      'data-tip': showPassword ? 'Hide password' : 'Show password',
      children: showPassword ? _jsx(EyeOff, { className: 'h-4 w-4' }) : _jsx(Eye, { className: 'h-4 w-4' }),
    }),
  });
}
function TextArrayInputComponent(props) {
  const { store, rowId, attributeCode, value, onChange, ...rest } = props;
  if (store != null && attributeCode != null) {
    const storeBacked = props;
    return _jsx(MultiComboboxInput, {
      ...storeBacked,
      store: store,
      rowId: rowId,
      attributeCode: attributeCode,
      getValue: (o) => o,
      getLabel: (o) => o,
    });
  }
  return _jsx(MultiComboboxInput, {
    ...rest,
    value: value ?? [],
    getValue: (o) => o,
    getLabel: (o) => o,
    onSelect: (val) => onChange?.(val),
  });
}
function NumberInputStoreBacked({ store, rowId, attributeCode, transformValue, errorText: propErrorText, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  const onValueChange = transformValue
    ? (v) => {
        const t = transformValue(v);
        if (t !== v) {
          onChange(t);
        }
      }
    : undefined;
  return _jsx(NumberInputControlled, {
    ...rest,
    value: value,
    onChange: onChange,
    onValueChange: onValueChange,
    isDirty: isDirty,
    errorText: errorText ?? propErrorText,
  });
}
function NumberInputControlled({
  value,
  onChange,
  onValueChange,
  label,
  disabled = false,
  labelOnTop = false,
  placeholder = '',
  helpText,
  required = false,
  className,
  rightIcon,
  errorText,
  dataTestId,
  inputClassName,
  valid,
  autoFocus = false,
  isDirty = false,
}) {
  const ref = useRef(null);
  const [internalValue, setInternalValue] = useState(value?.toString());
  const focusValue = useRef(internalValue);
  const latestRef = useLatest(internalValue);
  useEffect(() => {
    if (latestRef.current !== value?.toString()) {
      setInternalValue(value?.toString());
    }
  }, [value, latestRef]);
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsxs('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: [
          _jsx(Input, {
            ref: ref,
            id: id,
            autoFocus: autoFocus,
            'data-testid': dataTestId,
            type: 'number',
            value: internalValue ?? '',
            className: cn(
              inputClassName,
              'w-full',
              errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
              (rightIcon || (valid && !errorText)) && 'pr-12',
            ),
            onChange: (e) => {
              const val = e.target.value;
              setInternalValue(val);
              if (onChange) {
                if (isEmpty(val)) {
                  onChange(undefined);
                  return;
                }
                const value = Number(val);
                if (Number.isNaN(value)) {
                  return;
                }
                onChange(value);
              }
            },
            disabled: disabled,
            placeholder: placeholder,
            required: required,
            onFocus: onValueChange
              ? () => {
                  focusValue.current = internalValue;
                }
              : undefined,
            onBlur: onValueChange
              ? (e) => {
                  const val = e.target.value;
                  const value = Number(val);
                  if (Number.isNaN(value)) {
                    setInternalValue(undefined);
                    onChange?.(undefined);
                    onValueChange(undefined);
                    return;
                  }
                  if (focusValue.current !== val) {
                    onValueChange(value);
                  }
                }
              : undefined,
            ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
          }),
          ((valid && !errorText) || rightIcon) &&
            _jsxs('div', {
              className: 'absolute right-4 bottom-1/2 flex translate-y-1/2 items-center gap-2',
              children: [valid && !errorText && _jsx(Check, { className: 'size-4 text-green-500' }), rightIcon],
            }),
        ],
      }),
  });
}
function NumberInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, onValueChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(NumberInputStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(NumberInputControlled, {
    ...rest,
    value: value,
    onChange: onChange,
    onValueChange: onValueChange,
    isDirty: isDirty,
  });
}
function YNInputStoreBacked({ store, rowId, attributeCode, errorText: propErrorText, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(YNInputControlled, {
    ...rest,
    value: value,
    onChange: onChange,
    isDirty: isDirty,
    errorText: errorText ?? propErrorText,
  });
}
function YNInputControlled({
  value,
  onChange,
  label,
  labelOnTop = false,
  disabled = false,
  helpText,
  className,
  boxLabel,
  errorText,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    className: className,
    errorText: errorText,
    children: ({ id, disabled }) =>
      _jsxs('div', {
        className: cn(
          'relative flex items-center gap-2',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: [
          _jsx(Checkbox, {
            id: id,
            checked: value === 'Y',
            onCheckedChange: (checked) => {
              onChange(checked ? 'Y' : 'N');
            },
            disabled: disabled,
            className: errorText
              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 data-[state=checked]:border-red-500'
              : '',
            ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
          }),
          boxLabel && _jsx(Label, { htmlFor: id, className: 'text-left', children: boxLabel }),
        ],
      }),
  });
}
function YNInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(YNInputStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(YNInputControlled, { ...props });
}
function TFInputStoreBacked({ store, rowId, attributeCode, errorText: propErrorText, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(TFInputControlled, {
    ...rest,
    value: value,
    onChange: onChange,
    isDirty: isDirty,
    errorText: errorText ?? propErrorText,
  });
}
function TFInputControlled({
  value,
  onChange,
  label,
  labelOnTop = false,
  disabled = false,
  helpText,
  className,
  boxLabel,
  errorText,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    className: className,
    errorText: errorText,
    children: ({ id, disabled }) =>
      _jsxs('div', {
        className: cn(
          'relative flex items-center gap-2',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: [
          _jsx(Checkbox, {
            id: id,
            checked: value === 'T',
            onCheckedChange: (checked) => {
              onChange(checked ? 'T' : 'F');
            },
            disabled: disabled,
            className: errorText
              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 data-[state=checked]:border-red-500'
              : '',
            ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
          }),
          boxLabel && _jsx(Label, { htmlFor: id, className: 'text-left', children: boxLabel }),
        ],
      }),
  });
}
function TFInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(TFInputStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(TFInputControlled, { ...props });
}
function DatePickerStoreBacked({ store, rowId, attributeCode, transformValue, errorText: propErrorText, ...rest }) {
  const { value, onChange, isDirty, errorText: storeErrorText } = useStoreBackedField(store, rowId, attributeCode);
  const onValueChange = transformValue
    ? (v) => {
        const t = transformValue(v);
        if (t !== v) {
          onChange(t);
        }
      }
    : undefined;
  return _jsx(DatePickerControlled, {
    ...rest,
    value: value ?? null,
    onChange: onChange,
    onValueChange: onValueChange,
    isDirty: isDirty,
    errorText: storeErrorText ?? propErrorText,
  });
}
function DatePickerControlled({
  value,
  onChange,
  onValueChange,
  label,
  labelOnTop = false,
  disabled = false,
  helpText,
  required = false,
  className,
  errorText,
  isDirty = false,
}) {
  const [open, setOpen] = useState(false);
  const focusValue = useRef(value);
  const popoverContentRef = useRef(null);
  const handleOpenChange = (newOpen) => {
    if (newOpen && onValueChange) {
      focusValue.current = value;
    } else if (!newOpen && onValueChange) {
      if (focusValue.current !== value) {
        onValueChange(value ?? undefined);
      }
    }
    setOpen(newOpen);
  };
  const handleSelect = (date) => {
    const newValue = date ? date.toISOString() : undefined;
    onChange?.(newValue);
    if (date) {
      setOpen(false);
    }
  };
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(undefined);
    if (onValueChange) {
      onValueChange(undefined);
    }
    setOpen(false);
  };
  const [currentMonth, setCurrentMonth] = useState(
    value ? parseISO(value) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative w-full',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && cn('before:pointer-events-none', DIRTY_FIELD_INDICATOR_CLASS),
        ),
        children: _jsxs(Popover, {
          open: open,
          onOpenChange: handleOpenChange,
          children: [
            _jsx(PopoverTrigger, {
              asChild: true,
              children: _jsxs(Button, {
                id: id,
                disabled: disabled,
                variant: 'outline',
                className: cn(
                  'h-9 w-full justify-between font-normal text-sm',
                  errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
                ),
                ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
                children: [
                  value ? format(parseISO(value), 'MM/dd/yyyy') : _jsx('span', { children: 'Pick a date' }),
                  _jsx(CalendarIcon, { className: 'ml-auto h-4 w-4 opacity-50' }),
                ],
              }),
            }),
            _jsx(PopoverContent, {
              className: 'w-auto overflow-hidden p-0',
              align: 'end',
              alignOffset: -8,
              sideOffset: 10,
              onInteractOutside: (e) => {
                const target = e.target;
                const content = popoverContentRef.current;
                if (
                  content?.contains(target) ||
                  target.closest('[data-slot="calendar"]') ||
                  target.closest('.rdp') ||
                  target.closest('[role="combobox"]') ||
                  target.closest('select') ||
                  target.closest('button[aria-label*="month"]') ||
                  target.closest('button[aria-label*="year"]')
                ) {
                  e.preventDefault();
                }
              },
              children: _jsx('div', {
                ref: popoverContentRef,
                className: 'flex flex-col',
                children: _jsxs(Card, {
                  className: 'mx-auto w-fit gap-0 p-0',
                  children: [
                    _jsx(CardContent, {
                      className: 'p-0',
                      children: _jsx(Calendar, {
                        mode: 'single',
                        selected: value ? parseISO(value) : undefined,
                        month: currentMonth,
                        onMonthChange: setCurrentMonth,
                        onSelect: handleSelect,
                        required: false,
                        captionLayout: 'dropdown',
                        today: new Date(),
                      }),
                    }),
                    _jsxs(CardFooter, {
                      className: 'flex flex-wrap gap-2 border-t p-2 pb-0 [.border-t]:p-2',
                      children: [
                        value &&
                          _jsx(Button, {
                            variant: 'ghost',
                            size: 'sm',
                            className: 'flex-1',
                            onClick: handleClear,
                            children: 'Clear',
                          }),
                        _jsx(Button, {
                          variant: 'outline',
                          size: 'sm',
                          className: 'flex-1',
                          onClick: () => {
                            const newDate = new Date();
                            handleSelect(newDate);
                            setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                          },
                          children: 'Today',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
          ],
        }),
      }),
  });
}
function DatePickerComponent(props) {
  const { store, attributeCode, rowId, value, onChange, onValueChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(DatePickerStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(DatePickerControlled, {
    ...rest,
    value: value,
    onChange: onChange,
    onValueChange: onValueChange,
    isDirty: isDirty,
  });
}
function DateInputStoreBacked({ store, rowId, attributeCode, errorText: propErrorText, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(DateInputControlled, {
    ...rest,
    value: value ?? null,
    onChange: onChange,
    isDirty: isDirty,
    errorText: errorText ?? propErrorText,
  });
}
function DateInputControlled({
  value,
  onChange,
  label,
  labelOnTop = false,
  disabled = false,
  placeholder = '',
  onFocus,
  onBlur,
  helpText,
  required = false,
  className,
  min,
  max,
  errorText,
  showTime = false,
  dataTestId,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
        children: _jsx(DateField, {
          id: id,
          dataTestId: dataTestId,
          value: value ?? '',
          onChange: onChange,
          disabled: disabled,
          className: cn(
            'w-full',
            errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
          ),
          placeholder: placeholder,
          onFocus: onFocus,
          onBlur: onBlur,
          min: min,
          max: max,
          showTime: showTime,
        }),
      }),
  });
}
function DateInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(DateInputStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(DateInputControlled, { ...rest, value: value ?? null, onChange: onChange, isDirty: isDirty });
}
function TimeInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(TimeInputControlled, {
    ...rest,
    value: value ?? null,
    onChange: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function TimeInputControlled({
  value,
  onChange,
  label,
  labelOnTop = false,
  disabled = false,
  placeholder = '',
  onFocus,
  onBlur,
  helpText,
  required = false,
  className,
  step,
  isDirty = false,
  errorText,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: _jsx(TimeField, {
          id: id,
          value: value ?? '',
          onChange: onChange,
          disabled: disabled,
          className: cn(
            'w-full',
            errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
          ),
          placeholder: placeholder,
          onFocus: onFocus,
          onBlur: onBlur,
          step: step,
          ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
        }),
      }),
  });
}
function TimeInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(TimeInputStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(TimeInputControlled, { ...rest, value: value ?? null, onChange: onChange, isDirty: isDirty });
}
function BooleanInputStoreBacked({ store, rowId, attributeCode, errorText: propErrorText, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(BooleanInputControlled, {
    ...rest,
    value: value,
    onChange: onChange,
    isDirty: isDirty,
    errorText: errorText ?? propErrorText,
  });
}
function BooleanInputControlled({
  value,
  onChange,
  label,
  labelOnTop = false,
  disabled = false,
  helpText,
  className,
  boxLabel,
  isDirty = false,
  errorText,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    className: className,
    errorText: errorText,
    children: ({ id, disabled }) =>
      _jsxs('div', {
        className: cn(
          'relative flex items-center gap-2',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: [
          _jsx(Checkbox, {
            id: id,
            checked: value,
            onCheckedChange: onChange,
            disabled: disabled,
            className: errorText
              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 data-[state=checked]:border-red-500'
              : '',
            ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
          }),
          boxLabel && _jsx(Label, { htmlFor: id, className: 'text-left', children: boxLabel }),
        ],
      }),
  });
}
function BooleanInputComponent(props) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return _jsx(BooleanInputStoreBacked, { store: store, attributeCode: attributeCode, rowId: rowId, ...rest });
  }
  return _jsx(BooleanInputControlled, { ...rest, value: value, onChange: onChange, isDirty: isDirty });
}
function AsyncComboboxInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(AsyncComboboxInputControlled, {
    ...rest,
    value: value,
    onSelect: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function AsyncComboboxInputControlled({
  value,
  label,
  getValue,
  getLabel,
  getIcon,
  renderOption,
  onSelect,
  getOptions,
  groupHeading,
  searchPlaceholder,
  placeholder,
  emptyText,
  labelOnTop = false,
  disabled = false,
  required = false,
  minSearchLength = 3,
  getOptionForValue,
  helpText,
  disableSortByLabel,
  className,
  errorText,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: _jsx(AsyncComboboxField, {
          id: id,
          value: value,
          placeholder: placeholder,
          getOptions: getOptions,
          getValue: getValue,
          getLabel: getLabel,
          getIcon: getIcon,
          renderOption: renderOption,
          onSelect: onSelect,
          className: cn(
            'w-full',
            errorText
              ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
              : '',
          ),
          groupHeading: groupHeading,
          searchPlaceholder: searchPlaceholder,
          emptyText: emptyText,
          disabled: disabled,
          required: required,
          minSearchLength: minSearchLength,
          getOptionForValue: getOptionForValue,
          disableSortByLabel: disableSortByLabel,
        }),
      }),
  });
}
function ComboboxInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(ComboboxInputControlled, {
    ...rest,
    value: value,
    onSelect: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function ComboboxInputControlled({
  value,
  label,
  getValue,
  getLabel,
  getIcon,
  renderOption,
  onSelect,
  options,
  groupHeading,
  searchPlaceholder,
  placeholder,
  emptyText,
  labelOnTop = false,
  disabled = false,
  required = false,
  isLoading,
  helpText,
  disableSortByLabel,
  className,
  errorText,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
        children: _jsx(ComboboxField, {
          id: id,
          value: value,
          placeholder: placeholder,
          options: options,
          getValue: getValue,
          getLabel: getLabel,
          getIcon: getIcon,
          renderOption: renderOption,
          onSelect: onSelect,
          className: cn(
            'w-full',
            errorText
              ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
              : '',
          ),
          groupHeading: groupHeading,
          searchPlaceholder: searchPlaceholder,
          emptyText: emptyText,
          disabled: disabled,
          required: required,
          isLoading: isLoading,
          disableSortByLabel: disableSortByLabel,
        }),
      }),
  });
}
function ComboboxInputComponent(props) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return _jsx(ComboboxInputStoreBacked, { ...props });
  }
  return _jsx(ComboboxInputControlled, { ...props });
}
function AsyncComboboxInputComponent(props) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return _jsx(AsyncComboboxInputStoreBacked, { ...props });
  }
  return _jsx(AsyncComboboxInputControlled, { ...props });
}
function AsyncMultiComboboxInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(AsyncMultiComboboxInputControlled, {
    ...rest,
    value: value,
    onSelect: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function AsyncMultiComboboxInputControlled({
  value,
  label,
  getValue,
  getLabel,
  onSelect,
  getOptions,
  groupHeading,
  searchPlaceholder,
  placeholder,
  emptyText,
  labelOnTop = false,
  disabled = false,
  required = false,
  minSearchLength = 3,
  getOptionsForValue,
  helpText,
  disableSortByLabel,
  className,
  errorText,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
        children: _jsx(AsyncMultiComboboxField, {
          id: id,
          value: value,
          placeholder: placeholder,
          getOptions: getOptions,
          getValue: getValue,
          getLabel: getLabel,
          onSelect: onSelect,
          className: cn(
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            errorText
              ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
              : '',
          ),
          groupHeading: groupHeading,
          searchPlaceholder: searchPlaceholder,
          emptyText: emptyText,
          disabled: disabled,
          required: required,
          minSearchLength: minSearchLength,
          getOptionsForValue: getOptionsForValue,
          disableSortByLabel: disableSortByLabel,
        }),
      }),
  });
}
function AsyncMultiComboboxInputComponent(props) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return _jsx(AsyncMultiComboboxInputStoreBacked, { ...props });
  }
  return _jsx(AsyncMultiComboboxInputControlled, { ...props });
}
function MultiComboboxInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(MultiComboboxInputControlled, {
    ...rest,
    value: value,
    onSelect: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function MultiComboboxInputControlled({
  value,
  label,
  getValue,
  getLabel,
  onSelect,
  options,
  groupHeading,
  searchPlaceholder,
  placeholder,
  emptyText,
  labelOnTop = false,
  disabled = false,
  required = false,
  isLoading,
  helpText,
  disableSortByLabel,
  className,
  errorText,
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: _jsx(MultiComboboxField, {
          id: id,
          value: value,
          placeholder: placeholder,
          options: options,
          getValue: getValue,
          getLabel: getLabel,
          onSelect: onSelect,
          className: labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          groupHeading: groupHeading,
          searchPlaceholder: searchPlaceholder,
          emptyText: emptyText,
          disabled: disabled,
          required: required,
          isLoading: isLoading,
          disableSortByLabel: disableSortByLabel,
        }),
      }),
  });
}
function MultiComboboxInputComponent(props) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return _jsx(MultiComboboxInputStoreBacked, { ...props });
  }
  return _jsx(MultiComboboxInputControlled, { ...props });
}
function SelectInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(SelectInputControlled, {
    ...rest,
    value: value,
    onSelect: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function SelectInputControlled({
  value,
  label,
  getValue,
  getLabel,
  renderOption,
  onSelect,
  options,
  placeholder,
  labelOnTop = false,
  disabled = false,
  required = false,
  isLoading,
  helpText,
  groupHeading,
  className,
  errorText,
  noneLabel = 'None',
  isDirty = false,
}) {
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: _jsxs(Select, {
          required: required,
          disabled: disabled,
          onValueChange: (value) => onSelect?.(value === 'NONE' ? undefined : value),
          value: value ?? '',
          children: [
            _jsx(SelectTrigger, {
              id: id,
              className: cn(
                'w-full',
                errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
              ),
              children: _jsx('div', {
                className: cn('truncate whitespace-nowrap'),
                ...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {}),
                children: _jsx(SelectValue, { placeholder: placeholder }),
              }),
            }),
            _jsx(SelectContent, {
              className: 'z-1000',
              children: _jsxs(SelectGroup, {
                children: [
                  groupHeading && _jsx(SelectLabel, { children: groupHeading }),
                  isLoading &&
                    _jsxs(SelectItem, {
                      value: 'NONE',
                      children: [_jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }), ' Loading...'],
                    }),
                  options?.map((option) =>
                    _jsx(
                      SelectItem,
                      { value: getValue(option), children: renderOption ? renderOption(option) : getLabel(option) },
                      getValue(option),
                    ),
                  ),
                  !required && _jsx(SelectItem, { value: 'NONE', children: noneLabel }),
                ],
              }),
            }),
          ],
        }),
      }),
  });
}
function SelectInputComponent(props) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return _jsx(SelectInputStoreBacked, { ...props });
  }
  return _jsx(SelectInputControlled, { ...props });
}
function LookupInputStoreBacked({ store, rowId, attributeCode, ...rest }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return _jsx(LookupInputControlled, {
    ...rest,
    value: value,
    onSelect: onChange,
    isDirty: isDirty,
    errorText: errorText,
  });
}
function LookupInputControlled({
  value,
  label,
  renderOption,
  onSelect,
  lookupType,
  searchPlaceholder,
  placeholder,
  emptyText,
  labelOnTop = false,
  disabled = false,
  required = false,
  isLoading,
  helpText,
  className,
  errorText,
  isDirty = false,
}) {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    getLookupsByType(lookupType).then(setOptions);
  }, [lookupType]);
  return _jsx(InputShell, {
    label: label,
    labelOnTop: labelOnTop,
    disabled: disabled,
    helpText: helpText,
    required: required,
    className: className,
    errorText: errorText,
    children: ({ id, required, disabled }) =>
      _jsx('div', {
        className: cn(
          'relative',
          labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
          isDirty && DIRTY_FIELD_INDICATOR_CLASS,
        ),
        children: _jsx(ComboboxField, {
          id: id,
          value: value != null ? String(value) : undefined,
          placeholder: placeholder,
          options: options,
          getValue: (option) => String(option.value),
          getLabel: (option) => option.label ?? option.value,
          renderOption: renderOption,
          onSelect: (_, option) => onSelect(option?.value, option),
          className: cn(
            'w-full',
            errorText
              ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
              : '',
          ),
          searchPlaceholder: searchPlaceholder,
          emptyText: emptyText,
          disabled: disabled,
          required: required,
          isLoading: isLoading,
          disableSortByLabel: true,
        }),
      }),
  });
}
export function LookupInput(props) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return _jsx(LookupInputStoreBacked, { ...props });
  }
  return _jsx(LookupInputControlled, { ...props });
}
export const TextInput = memo(TextInputComponent);
export const PasswordInput = memo(PasswordInputComponent);
export const TextArrayInput = memo(TextArrayInputComponent);
export const NumberInput = memo(NumberInputComponent);
export const YNInput = memo(YNInputComponent);
export const TFInput = memo(TFInputComponent);
export const DatePickerField = memo(DatePickerComponent);
export const DateInputField = memo(DateInputComponent);
export const TimeInputField = memo(TimeInputComponent);
export const BooleanInput = memo(BooleanInputComponent);
export const AsyncComboboxInput = memo(AsyncComboboxInputComponent);
export const ComboboxInput = memo(ComboboxInputComponent);
export const AsyncMultiComboboxInput = memo(AsyncMultiComboboxInputComponent);
export const MultiComboboxInput = memo(MultiComboboxInputComponent);
export const SelectInput = memo(SelectInputComponent);
//# sourceMappingURL=fields.js.map
