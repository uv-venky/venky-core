/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { TF, YN } from '@/lib/core/common/ds/types/YN';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { normalizeTextFieldWhitespace } from '@/lib/core/common/normalizeTextFieldWhitespace';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { AlertTriangleIcon, CalendarIcon, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLInputAutoCompleteAttribute,
  type HTMLInputTypeAttribute,
  type ReactNode,
} from 'react';
import {
  AsyncComboboxField,
  ComboboxField,
  type AsyncComboboxFieldProps,
  type ComboboxFieldProps,
} from '@/components/core/combobox';
import { DateInput as DateField, TimeInput as TimeField } from '@/components/core/date-field';
import { useLatest } from '@/components/core/hooks/useLatest';
import {
  AsyncMultiComboboxField,
  MultiComboboxField,
  type AsyncMultiComboboxFieldProps,
  type MultiComboboxFieldProps,
} from '@/components/core/multi-combobox';
import { getLookupsByType, type LookupValueOption } from '@/lib/core/client/lookups';
import {
  useCellErrors,
  useCurrentRowId,
  useIsRowAttributeDirty,
  useRowValue,
} from '@/components/core/hooks/useStoreHooks';
import { DIRTY_FIELD_INDICATOR_CLASS } from '@/components/core/utils/dirty-indicator';
import type { StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { Store } from '@/lib/core/common/types/Store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

function useStoreBackedField<T extends object, K extends StringKeyof<T>>(
  store: Store<T>,
  rowId: string | undefined,
  attributeCode: K,
): {
  value: T[K] | undefined;
  onChange: (v: T[K] | undefined) => void;
  isDirty: boolean;
  errorText: string | undefined;
} {
  const currentRowId = useCurrentRowId(store);
  const resolvedRowId = rowId ?? currentRowId ?? '';
  const value = useRowValue(store, resolvedRowId, attributeCode) as T[K] | undefined;
  const onChange = useCallback(
    (v: T[K] | undefined) => {
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
}: {
  label?: string;
  disabled?: boolean;
  labelOnTop?: boolean;
  helpText?: ReactNode;
  required?: boolean;
  children: (props: { id: string; required: boolean; disabled: boolean }) => React.ReactNode;
  className?: string;
  errorText?: string;
}) {
  const id = useId();
  const stackLabel = labelOnTop || label == null;
  return (
    <div
      className={cn(
        'relative grid min-w-0 self-start',
        stackLabel ? 'grid-cols-1 content-start items-start gap-2' : 'grid-cols-3 items-center gap-x-4 gap-y-2',
        className,
      )}
    >
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            'flex items-center gap-2',
            labelOnTop ? 'flex-row text-left' : 'row-start-1 flex-row-reverse self-center text-right',
            disabled && 'text-muted-foreground',
          )}
        >
          {label} {required && <span className="font-bold">*</span>}
          {errorText && (
            <AlertTriangleIcon className="h-4 items-center text-red-500" data-tip={errorText} data-tip-error />
          )}
        </Label>
      )}
      {children({ id, required, disabled })}
      {helpText && (
        <p className={cn('text-muted-foreground text-xs', !labelOnTop && 'col-span-2 col-start-2 row-start-2')}>
          {helpText}
        </p>
      )}
    </div>
  );
}

/** Shared props for all TextInput usages */
type TextInputPropsBase = {
  label?: string;
  disabled?: boolean;
  labelOnTop?: boolean;
  placeholder?: string;
  multiline?: boolean;
  /** When `multiline` is true, sets the native textarea `rows` (and drops the default fixed height). */
  rows?: number;
  helpText?: ReactNode;
  required?: boolean;
  className?: string;
  rightIcon?: React.ReactNode;
  errorText?: string;
  type?: HTMLInputTypeAttribute;
  dataTestId?: string;
  valid?: boolean;
  autoFocus?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  name?: string;
  minLength?: number;
  inputClassName?: string;
  /**
   * When true (default), trim leading/trailing whitespace on blur for non-password inputs.
   * Password fields default to false unless explicitly set true.
   */
  trimOnBlur?: boolean;
};

/** Store-backed: provide store + attributeCode; value/onChange/isDirty are derived. rowId defaults to current row. */
export type TextInputPropsStoreBacked<T extends object> = TextInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  onValueChange?: never;
  isDirty?: never;
  /**
   * Applied on blur after optional trim (`trimOnBlur`, default true except password).
   * Result written to the store if different from the blurred value.
   */
  transformValue?: (value: string | undefined) => string | undefined;
};

/** Controlled: provide value/onChange; do not pass store/attributeCode/rowId. */
export type TextInputPropsControlled = TextInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  onValueChange?: (value: string | undefined) => void;
  isDirty?: boolean;
};

export type TextInputProps<T extends object = Record<string, unknown>> =
  | TextInputPropsStoreBacked<T>
  | TextInputPropsControlled;

function TextInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  transformValue,
  trimOnBlur,
  type,
  errorText: propErrorText,
  ...rest
}: TextInputProps<T> & { store: Store<T>; attributeCode: StringKeyof<T>; rowId?: string }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  const effectiveType = type ?? 'text';
  const effectiveTrimOnBlur = trimOnBlur ?? effectiveType !== 'password';
  const applyBlurTransform = useMemo(() => {
    if (!effectiveTrimOnBlur && !transformValue) {
      return undefined;
    }
    return (v: string | undefined) => {
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

  return (
    <TextInputControlled
      {...rest}
      type={effectiveType}
      value={(value as string | undefined) ?? null}
      onChange={onChange as (v: string | undefined) => void}
      applyBlurTransform={applyBlurTransform}
      isDirty={isDirty}
      errorText={errorText ?? propErrorText}
    />
  );
}

function TextInputControlled<T extends object = Record<string, unknown>>({
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
}: TextInputProps<T> & {
  applyBlurTransform?: (value: string | undefined) => string | undefined;
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

  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && cn('before:pointer-events-none', DIRTY_FIELD_INDICATOR_CLASS),
          )}
        >
          <Component
            id={id}
            name={name}
            minLength={minLength}
            autoFocus={autoFocus}
            data-testid={dataTestId}
            value={internalValue ?? ''}
            autoComplete={autoComplete}
            {...(multiline && rows != null ? { rows } : {})}
            className={cn(
              'w-full',
              errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
              (rightIcon || (valid && !errorText)) && 'pr-12',
              inputClassName,
            )}
            onChange={(e) => {
              const val = isEmpty(e.target.value) ? undefined : e.target.value;
              setInternalValue(val);
              onChange?.(val);
            }}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            onFocus={
              applyBlurTransform
                ? undefined
                : onValueChange
                  ? () => {
                      focusValue.current = internalValue;
                    }
                  : undefined
            }
            onBlur={
              applyBlurTransform
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
                  : undefined
            }
            {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
          />
          {((valid && !errorText) || rightIcon) && (
            <div className="absolute right-4 bottom-1/2 flex translate-y-1/2 items-center gap-2">
              {valid && !errorText && <Check className="size-4 text-green-500" />}
              {rightIcon}
            </div>
          )}
        </div>
      )}
    </InputShell>
  );
}

function TextInputComponent<T extends object>(props: TextInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, onValueChange, isDirty, trimOnBlur, type, ...rest } = props;
  const effectiveType = type ?? 'text';
  const effectiveTrimOnBlur = trimOnBlur ?? effectiveType !== 'password';
  const controlledApplyBlur = useMemo(
    () => (!effectiveTrimOnBlur ? undefined : (v: string | undefined) => normalizeTextFieldWhitespace(v)),
    [effectiveTrimOnBlur],
  );
  if (store != null && attributeCode != null) {
    return (
      <TextInputStoreBacked
        store={store}
        attributeCode={attributeCode}
        rowId={rowId}
        trimOnBlur={trimOnBlur}
        type={type}
        {...rest}
      />
    );
  }
  return (
    <TextInputControlled
      {...rest}
      type={effectiveType}
      value={value}
      onChange={onChange}
      onValueChange={onValueChange}
      applyBlurTransform={controlledApplyBlur}
      isDirty={isDirty}
    />
  );
}

function PasswordInputComponent(props: Omit<TextInputProps, 'type'>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInputComponent
      {...(props as TextInputProps)}
      type={showPassword ? 'text' : 'password'}
      trimOnBlur={props.trimOnBlur ?? false}
      rightIcon={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-full hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          data-tip={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      }
    />
  );
}

type TextArrayInputPropsBase = {
  label: string;
  options: string[];
  disabled?: boolean;
  labelOnTop?: boolean;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
};

/** Store-backed: provide store + attributeCode; value/onChange/isDirty are derived. */
type TextArrayInputPropsStoreBacked<R extends object> = TextArrayInputPropsBase & {
  store: Store<R>;
  attributeCode: StringKeyof<R>;
  rowId?: string;
  value?: never;
  onChange?: never;
  isDirty?: never;
};

/** Controlled: provide value/onChange; do not pass store/attributeCode/rowId. */
type TextArrayInputPropsControlled = TextArrayInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: string[] | null;
  onChange?: (value: string[]) => void;
  isDirty?: boolean;
};

type TextArrayInputProps<R extends object = Record<string, unknown>> =
  | TextArrayInputPropsStoreBacked<R>
  | TextArrayInputPropsControlled;

function TextArrayInputComponent<R extends object = Record<string, unknown>>(props: TextArrayInputProps<R>) {
  const { store, rowId, attributeCode, value, onChange, ...rest } = props;
  if (store != null && attributeCode != null) {
    const storeBacked = props as TextArrayInputPropsStoreBacked<R>;
    return (
      <MultiComboboxInput<string, R>
        {...storeBacked}
        store={store}
        rowId={rowId}
        attributeCode={attributeCode}
        getValue={(o) => o}
        getLabel={(o) => o}
      />
    );
  }
  return (
    <MultiComboboxInput<string, R>
      {...(rest as TextArrayInputPropsControlled)}
      value={value ?? []}
      getValue={(o) => o}
      getLabel={(o) => o}
      onSelect={(val) => onChange?.(val)}
    />
  );
}

/** Shared props for all NumberInput usages */
type NumberInputPropsBase = {
  label: string;
  disabled?: boolean;
  labelOnTop?: boolean;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  rightIcon?: React.ReactNode;
  errorText?: string;
  dataTestId?: string;
  inputClassName?: string;
  valid?: boolean;
  autoFocus?: boolean;
};

/** Store-backed: provide store + attributeCode; value/onChange/isDirty are derived. */
type NumberInputPropsStoreBacked<T extends object> = NumberInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  onValueChange?: never;
  isDirty?: never;
  /** Applied on blur when value changed; result written to store if different. */
  transformValue?: (value: number | undefined) => number | undefined;
};

/** Controlled: provide value/onChange; do not pass store/attributeCode/rowId. */
type NumberInputPropsControlled = NumberInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: number | null;
  onChange?: (value: number | undefined) => void;
  onValueChange?: (value: number | undefined) => void;
  isDirty?: boolean;
};

type NumberInputProps<T extends object = Record<string, unknown>> =
  | NumberInputPropsStoreBacked<T>
  | NumberInputPropsControlled;

function NumberInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  transformValue,
  errorText: propErrorText,
  ...rest
}: NumberInputPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  const onValueChange = transformValue
    ? (v: number | undefined) => {
        const t = transformValue(v);
        if (t !== v) {
          (onChange as (x: number | undefined) => void)(t);
        }
      }
    : undefined;
  return (
    <NumberInputControlled
      {...rest}
      value={value as number | undefined}
      onChange={onChange as (v: number | undefined) => void}
      onValueChange={onValueChange}
      isDirty={isDirty}
      errorText={errorText ?? propErrorText}
    />
  );
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
}: NumberInputPropsControlled) {
  const ref = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value?.toString());
  const focusValue = useRef(internalValue);
  const latestRef = useLatest(internalValue);

  useEffect(() => {
    if (latestRef.current !== value?.toString()) {
      setInternalValue(value?.toString());
    }
  }, [value, latestRef]);

  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <Input
            ref={ref}
            id={id}
            autoFocus={autoFocus}
            data-testid={dataTestId}
            type="number"
            value={internalValue ?? ''}
            className={cn(
              inputClassName,
              'w-full',
              errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
              (rightIcon || (valid && !errorText)) && 'pr-12',
            )}
            onChange={(e) => {
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
            }}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            onFocus={
              onValueChange
                ? () => {
                    focusValue.current = internalValue;
                  }
                : undefined
            }
            onBlur={
              onValueChange
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
                : undefined
            }
            {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
          />
          {((valid && !errorText) || rightIcon) && (
            <div className="absolute right-4 bottom-1/2 flex translate-y-1/2 items-center gap-2">
              {valid && !errorText && <Check className="size-4 text-green-500" />}
              {rightIcon}
            </div>
          )}
        </div>
      )}
    </InputShell>
  );
}

function NumberInputComponent<T extends object>(props: NumberInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, onValueChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <NumberInputStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return (
    <NumberInputControlled
      {...rest}
      value={value}
      onChange={onChange}
      onValueChange={onValueChange}
      isDirty={isDirty}
    />
  );
}

type YNInputPropsBase = {
  label?: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  boxLabel?: React.ReactNode;
  errorText?: string;
};

type YNInputPropsStoreBacked<T extends object> = YNInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  isDirty?: never;
};

type YNInputPropsControlled = YNInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: YN | null;
  onChange: (value: YN) => void;
  isDirty?: boolean;
};

type YNInputProps<T extends object = Record<string, unknown>> = YNInputPropsStoreBacked<T> | YNInputPropsControlled;

function YNInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  errorText: propErrorText,
  ...rest
}: YNInputPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <YNInputControlled
      {...rest}
      value={value as YN | undefined}
      onChange={onChange as (v: YN) => void}
      isDirty={isDirty}
      errorText={errorText ?? propErrorText}
    />
  );
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
}: YNInputPropsControlled) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      className={className}
      errorText={errorText}
    >
      {({ id, disabled }) => (
        <div
          className={cn(
            'relative flex items-center gap-2',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <Checkbox
            id={id}
            checked={value === 'Y'}
            onCheckedChange={(checked) => {
              onChange(checked ? 'Y' : 'N');
            }}
            disabled={disabled}
            className={
              errorText
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 data-[state=checked]:border-red-500'
                : ''
            }
            {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
          />
          {boxLabel && (
            <Label htmlFor={id} className="text-left">
              {boxLabel}
            </Label>
          )}
        </div>
      )}
    </InputShell>
  );
}

function YNInputComponent<T extends object>(props: YNInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <YNInputStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return <YNInputControlled {...(props as YNInputPropsControlled)} />;
}

type TFInputPropsBase = {
  label?: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  boxLabel?: React.ReactNode;
  errorText?: string;
};

type TFInputPropsStoreBacked<T extends object> = TFInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  isDirty?: never;
};

type TFInputPropsControlled = TFInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: TF;
  onChange: (value: TF) => void;
  isDirty?: boolean;
};

type TFInputProps<T extends object = Record<string, unknown>> = TFInputPropsStoreBacked<T> | TFInputPropsControlled;

function TFInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  errorText: propErrorText,
  ...rest
}: TFInputPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <TFInputControlled
      {...rest}
      value={value as TF | undefined}
      onChange={onChange as (v: TF) => void}
      isDirty={isDirty}
      errorText={errorText ?? propErrorText}
    />
  );
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
}: TFInputPropsControlled) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      className={className}
      errorText={errorText}
    >
      {({ id, disabled }) => (
        <div
          className={cn(
            'relative flex items-center gap-2',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <Checkbox
            id={id}
            checked={value === 'T'}
            onCheckedChange={(checked) => {
              onChange(checked ? 'T' : 'F');
            }}
            disabled={disabled}
            className={
              errorText
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 data-[state=checked]:border-red-500'
                : ''
            }
            {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
          />
          {boxLabel && (
            <Label htmlFor={id} className="text-left">
              {boxLabel}
            </Label>
          )}
        </div>
      )}
    </InputShell>
  );
}

function TFInputComponent<T extends object>(props: TFInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <TFInputStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return <TFInputControlled {...(props as TFInputPropsControlled)} />;
}

type DatePickerPropsBase = {
  label: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  helpText?: ReactNode;
  required?: boolean;
  className?: string;
  errorText?: string;
};

type DatePickerPropsStoreBacked<T extends object> = DatePickerPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  onValueChange?: never;
  isDirty?: never;
  /** Applied when popover closes and value changed; result written to store if different. */
  transformValue?: (value: string | undefined) => string | undefined;
};

type DatePickerPropsControlled = DatePickerPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: string | null;
  onChange?: (value?: string) => void;
  onValueChange?: (value?: string) => void;
  isDirty?: boolean;
};

type DatePickerProps<T extends object = Record<string, unknown>> =
  | DatePickerPropsStoreBacked<T>
  | DatePickerPropsControlled;

function DatePickerStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  transformValue,
  errorText: propErrorText,
  ...rest
}: DatePickerPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText: storeErrorText } = useStoreBackedField(store, rowId, attributeCode);
  const onValueChange = transformValue
    ? (v: string | undefined) => {
        const t = transformValue(v);
        if (t !== v) {
          (onChange as (x?: string) => void)(t);
        }
      }
    : undefined;
  return (
    <DatePickerControlled
      {...rest}
      value={(value as string | undefined) ?? null}
      onChange={onChange as (v?: string) => void}
      onValueChange={onValueChange}
      isDirty={isDirty}
      errorText={storeErrorText ?? propErrorText}
    />
  );
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
}: DatePickerPropsControlled) {
  const [open, setOpen] = useState(false);
  const focusValue = useRef(value);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && onValueChange) {
      focusValue.current = value;
    } else if (!newOpen && onValueChange) {
      if (focusValue.current !== value) {
        onValueChange(value ?? undefined);
      }
    }
    setOpen(newOpen);
  };

  const handleSelect = (date: Date | undefined) => {
    const newValue = date ? date.toISOString() : undefined;
    onChange?.(newValue);
    if (date) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
    if (onValueChange) {
      onValueChange(undefined);
    }
    setOpen(false);
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(
    value ? parseISO(value) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, disabled }) => (
        <div
          className={cn(
            'relative w-full',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && cn('before:pointer-events-none', DIRTY_FIELD_INDICATOR_CLASS),
          )}
        >
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button
                id={id}
                disabled={disabled}
                variant="outline"
                className={cn(
                  'h-9 w-full justify-between font-normal text-sm',
                  errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
                )}
                {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
              >
                {value ? format(parseISO(value), 'MM/dd/yyyy') : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
              onInteractOutside={(e) => {
                const target = e.target as HTMLElement;
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
              }}
            >
              <div ref={popoverContentRef} className="flex flex-col">
                <Card className="mx-auto w-fit gap-0 p-0">
                  <CardContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={value ? parseISO(value) : undefined}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      onSelect={handleSelect}
                      required={false}
                      captionLayout="dropdown"
                      today={new Date()}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 border-t p-2 pb-0 [.border-t]:p-2">
                    {value && (
                      <Button variant="ghost" size="sm" className="flex-1" onClick={handleClear}>
                        Clear
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const newDate = new Date();
                        handleSelect(newDate);
                        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                      }}
                    >
                      Today
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </InputShell>
  );
}

function DatePickerComponent<T extends object>(props: DatePickerProps<T>) {
  const { store, attributeCode, rowId, value, onChange, onValueChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <DatePickerStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return (
    <DatePickerControlled {...rest} value={value} onChange={onChange} onValueChange={onValueChange} isDirty={isDirty} />
  );
}

type DateInputPropsBase = {
  label: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  helpText?: string;
  required?: boolean;
  className?: string;
  min?: string | Date;
  max?: string | Date;
  errorText?: string;
  rightIcon?: React.ReactNode;
  showTime?: boolean;
  dataTestId?: string;
};

type DateInputPropsStoreBacked<T extends object> = DateInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  isDirty?: never;
};

type DateInputPropsControlled = DateInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value: string | null;
  onChange?: (value?: string) => void;
  isDirty?: boolean;
};

type DateInputProps<T extends object = Record<string, unknown>> =
  | DateInputPropsStoreBacked<T>
  | DateInputPropsControlled;

function DateInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  errorText: propErrorText,
  ...rest
}: DateInputPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <DateInputControlled
      {...rest}
      value={(value as string | undefined) ?? null}
      onChange={onChange as (v?: string) => void}
      isDirty={isDirty}
      errorText={errorText ?? propErrorText}
    />
  );
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
}: DateInputPropsControlled) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
          {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
        >
          <DateField
            id={id}
            dataTestId={dataTestId}
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'w-full',
              errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
            )}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            min={min}
            max={max}
            showTime={showTime}
          />
        </div>
      )}
    </InputShell>
  );
}

function DateInputComponent<T extends object>(props: DateInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <DateInputStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return <DateInputControlled {...rest} value={value ?? null} onChange={onChange} isDirty={isDirty} />;
}

type TimeInputPropsBase = {
  label?: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  helpText?: string;
  required?: boolean;
  className?: string;
  step?: number;
  errorText?: string;
};

type TimeInputPropsStoreBacked<T extends object> = TimeInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  isDirty?: never;
};

type TimeInputPropsControlled = TimeInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value: string | null;
  onChange?: (value?: string) => void;
  isDirty?: boolean;
};

type TimeInputProps<T extends object = Record<string, unknown>> =
  | TimeInputPropsStoreBacked<T>
  | TimeInputPropsControlled;

function TimeInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: TimeInputPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <TimeInputControlled
      {...rest}
      value={(value as string | undefined) ?? null}
      onChange={onChange as (v?: string) => void}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
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
}: TimeInputPropsControlled) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <TimeField
            id={id}
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'w-full',
              errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
            )}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            step={step}
            {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
          />
        </div>
      )}
    </InputShell>
  );
}

function TimeInputComponent<T extends object>(props: TimeInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <TimeInputStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return <TimeInputControlled {...rest} value={value ?? null} onChange={onChange} isDirty={isDirty} />;
}

type BooleanInputPropsBase = {
  label?: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  boxLabel?: React.ReactNode;
  errorText?: string;
};

type BooleanInputPropsStoreBacked<T extends object> = BooleanInputPropsBase & {
  store: Store<T>;
  attributeCode: StringKeyof<T>;
  rowId?: string;
  value?: never;
  onChange?: never;
  isDirty?: never;
};

type BooleanInputPropsControlled = BooleanInputPropsBase & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: boolean;
  onChange?: (value: boolean) => void;
  isDirty?: boolean;
};

type BooleanInputProps<T extends object = Record<string, unknown>> =
  | BooleanInputPropsStoreBacked<T>
  | BooleanInputPropsControlled;

function BooleanInputStoreBacked<T extends object>({
  store,
  rowId,
  attributeCode,
  errorText: propErrorText,
  ...rest
}: BooleanInputPropsStoreBacked<T>) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <BooleanInputControlled
      {...rest}
      value={value as boolean | undefined}
      onChange={onChange as (v: boolean) => void}
      isDirty={isDirty}
      errorText={errorText ?? propErrorText}
    />
  );
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
}: BooleanInputPropsControlled) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      className={className}
      errorText={errorText}
    >
      {({ id, disabled }) => (
        <div
          className={cn(
            'relative flex items-center gap-2',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <Checkbox
            id={id}
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
            className={
              errorText
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50 data-[state=checked]:border-red-500'
                : ''
            }
            {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
          />
          {boxLabel && (
            <Label htmlFor={id} className="text-left">
              {boxLabel}
            </Label>
          )}
        </div>
      )}
    </InputShell>
  );
}

function BooleanInputComponent<T extends object>(props: BooleanInputProps<T>) {
  const { store, attributeCode, rowId, value, onChange, isDirty, ...rest } = props;
  if (store != null && attributeCode != null) {
    return <BooleanInputStoreBacked store={store} attributeCode={attributeCode} rowId={rowId} {...rest} />;
  }
  return <BooleanInputControlled {...rest} value={value} onChange={onChange} isDirty={isDirty} />;
}

/** Base props for AsyncComboboxInput (no value/onSelect/store/attributeCode). */
type AsyncComboboxInputPropsBase<T extends object> = Omit<AsyncComboboxFieldProps<T>, 'value' | 'onSelect'> & {
  label: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  errorText?: string;
};

/** Store-backed: provide store + attributeCode; value/onSelect/isDirty are derived. */
type AsyncComboboxInputPropsStoreBacked<T extends object, R extends object> = AsyncComboboxInputPropsBase<T> & {
  store: Store<R>;
  attributeCode: StringKeyof<R>;
  rowId?: string;
  value?: never;
  onSelect?: never;
  isDirty?: never;
};

/** Controlled: provide value/onSelect; do not pass store/attributeCode/rowId. */
type AsyncComboboxInputPropsControlled<
  T extends object,
  _R extends object = Record<string, unknown>,
> = AsyncComboboxInputPropsBase<T> & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: string | null;
  onSelect: (value?: string, option?: T) => void;
  isDirty?: boolean;
};

type AsyncComboboxInputProps<T extends object, R extends object = Record<string, unknown>> =
  | AsyncComboboxInputPropsStoreBacked<T, R>
  | AsyncComboboxInputPropsControlled<T, R>;

function AsyncComboboxInputStoreBacked<T extends object, R extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: AsyncComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <AsyncComboboxInputControlled
      {...rest}
      value={value as any}
      onSelect={onChange as any}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
}

function AsyncComboboxInputControlled<T extends object, R extends object = Record<string, unknown>>({
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
}: AsyncComboboxInputPropsControlled<T, R>) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <AsyncComboboxField
            id={id}
            value={value}
            placeholder={placeholder}
            getOptions={getOptions}
            getValue={getValue}
            getLabel={getLabel}
            getIcon={getIcon}
            renderOption={renderOption}
            onSelect={onSelect}
            className={cn(
              'w-full',
              errorText
                ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
                : '',
            )}
            groupHeading={groupHeading}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            disabled={disabled}
            required={required}
            minSearchLength={minSearchLength}
            getOptionForValue={getOptionForValue}
            disableSortByLabel={disableSortByLabel}
          />
        </div>
      )}
    </InputShell>
  );
}

/** Base props for ComboboxInput (no value/onSelect/store/attributeCode). */
type ComboboxInputPropsBase<T extends object> = Omit<ComboboxFieldProps<T>, 'value' | 'onSelect'> & {
  label?: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  errorText?: string;
};

/** Store-backed: provide store + attributeCode; value/onSelect/isDirty are derived. */
type ComboboxInputPropsStoreBacked<T extends object, R extends object> = ComboboxInputPropsBase<T> & {
  store: Store<R>;
  attributeCode: StringKeyof<R>;
  rowId?: string;
  value?: never;
  onSelect?: never;
  isDirty?: never;
};

/** Controlled: provide value/onSelect; do not pass store/attributeCode/rowId. */
type ComboboxInputPropsControlled<
  T extends object,
  _R extends object = Record<string, unknown>,
> = ComboboxInputPropsBase<T> & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: string | null;
  onSelect: (value?: string, option?: T) => void;
  isDirty?: boolean;
};

type ComboboxInputProps<T extends object, R extends object = Record<string, unknown>> =
  | ComboboxInputPropsStoreBacked<T, R>
  | ComboboxInputPropsControlled<T, R>;

type SelectInputProps<T extends object, R extends object = Record<string, unknown>> = ComboboxInputProps<T, R> & {
  noneLabel?: string;
};

function ComboboxInputStoreBacked<T extends object, R extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: ComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <ComboboxInputControlled
      {...rest}
      value={value as any}
      onSelect={onChange as any}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
}

function ComboboxInputControlled<T extends object, R extends object = Record<string, unknown>>({
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
}: ComboboxInputPropsControlled<T, R>) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
          {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
        >
          <ComboboxField
            id={id}
            value={value}
            placeholder={placeholder}
            options={options}
            getValue={getValue}
            getLabel={getLabel}
            getIcon={getIcon}
            renderOption={renderOption}
            onSelect={onSelect}
            className={cn(
              'w-full',
              errorText
                ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
                : '',
            )}
            groupHeading={groupHeading}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            disabled={disabled}
            required={required}
            isLoading={isLoading}
            disableSortByLabel={disableSortByLabel}
          />
        </div>
      )}
    </InputShell>
  );
}

function ComboboxInputComponent<T extends object, R extends object = Record<string, unknown>>(
  props: ComboboxInputProps<T, R>,
) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return (
      <ComboboxInputStoreBacked
        {...(props as ComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> })}
      />
    );
  }
  return <ComboboxInputControlled {...(props as ComboboxInputPropsControlled<T, R>)} />;
}

function AsyncComboboxInputComponent<T extends object, R extends object = Record<string, unknown>>(
  props: AsyncComboboxInputProps<T, R>,
) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return (
      <AsyncComboboxInputStoreBacked
        {...(props as AsyncComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> })}
      />
    );
  }
  return <AsyncComboboxInputControlled {...(props as AsyncComboboxInputPropsControlled<T, R>)} />;
}

type AsyncMultiComboboxInputPropsBase<T extends object> = Omit<
  AsyncMultiComboboxFieldProps<T>,
  'value' | 'onSelect'
> & {
  label: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  errorText?: string;
};

/** Store-backed: provide store + attributeCode; value/onSelect/isDirty are derived. */
type AsyncMultiComboboxInputPropsStoreBacked<
  T extends object,
  R extends object,
> = AsyncMultiComboboxInputPropsBase<T> & {
  store: Store<R>;
  attributeCode: StringKeyof<R>;
  rowId?: string;
  value?: never;
  onSelect?: never;
  isDirty?: never;
};

/** Controlled: provide value/onSelect; do not pass store/attributeCode/rowId. */
type AsyncMultiComboboxInputPropsControlled<
  T extends object,
  _R extends object = Record<string, unknown>,
> = AsyncMultiComboboxInputPropsBase<T> & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value: string[];
  onSelect: (value: string[]) => void;
  isDirty?: boolean;
};

type AsyncMultiComboboxInputProps<T extends object, R extends object = Record<string, unknown>> =
  | AsyncMultiComboboxInputPropsStoreBacked<T, R>
  | AsyncMultiComboboxInputPropsControlled<T, R>;

function AsyncMultiComboboxInputStoreBacked<T extends object, R extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: AsyncMultiComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <AsyncMultiComboboxInputControlled
      {...rest}
      value={value as any}
      onSelect={onChange as any}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
}

function AsyncMultiComboboxInputControlled<T extends object, R extends object = Record<string, unknown>>({
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
}: AsyncMultiComboboxInputPropsControlled<T, R>) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
          {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
        >
          <AsyncMultiComboboxField
            id={id}
            value={value}
            placeholder={placeholder}
            getOptions={getOptions}
            getValue={getValue}
            getLabel={getLabel}
            onSelect={onSelect}
            className={cn(
              labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
              errorText
                ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
                : '',
            )}
            groupHeading={groupHeading}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            disabled={disabled}
            required={required}
            minSearchLength={minSearchLength}
            getOptionsForValue={getOptionsForValue}
            disableSortByLabel={disableSortByLabel}
          />
        </div>
      )}
    </InputShell>
  );
}

function AsyncMultiComboboxInputComponent<T extends object, R extends object = Record<string, unknown>>(
  props: AsyncMultiComboboxInputProps<T, R>,
) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return (
      <AsyncMultiComboboxInputStoreBacked
        {...(props as AsyncMultiComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> })}
      />
    );
  }
  return <AsyncMultiComboboxInputControlled {...(props as AsyncMultiComboboxInputPropsControlled<T, R>)} />;
}

/** Base props for MultiComboboxInput (no value/onSelect/store/attributeCode). */
type MultiComboboxInputPropsBase<T> = Omit<MultiComboboxFieldProps<T>, 'value' | 'onSelect'> & {
  label: string;
  labelOnTop?: boolean;
  disabled?: boolean;
  errorText?: string;
};

/** Store-backed: provide store + attributeCode; value/onSelect/isDirty are derived. */
type MultiComboboxInputPropsStoreBacked<T, R extends object> = MultiComboboxInputPropsBase<T> & {
  store: Store<R>;
  attributeCode: StringKeyof<R>;
  rowId?: string;
  value?: never;
  onSelect?: never;
  isDirty?: never;
};

/** Controlled: provide value/onSelect; do not pass store/attributeCode/rowId. */
type MultiComboboxInputPropsControlled<
  T,
  _R extends object = Record<string, unknown>,
> = MultiComboboxInputPropsBase<T> & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value: string[];
  onSelect: (value: string[]) => void;
  isDirty?: boolean;
};

type MultiComboboxInputProps<T, R extends object = Record<string, unknown>> =
  | MultiComboboxInputPropsStoreBacked<T, R>
  | MultiComboboxInputPropsControlled<T, R>;

function MultiComboboxInputStoreBacked<T, R extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: MultiComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <MultiComboboxInputControlled
      {...rest}
      value={value as any}
      onSelect={onChange as any}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
}

function MultiComboboxInputControlled<T, R extends object = Record<string, unknown>>({
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
}: MultiComboboxInputPropsControlled<T, R>) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <MultiComboboxField
            id={id}
            value={value}
            placeholder={placeholder}
            options={options}
            getValue={getValue}
            getLabel={getLabel}
            onSelect={onSelect}
            className={labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1'}
            groupHeading={groupHeading}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            disabled={disabled}
            required={required}
            isLoading={isLoading}
            disableSortByLabel={disableSortByLabel}
          />
        </div>
      )}
    </InputShell>
  );
}

function MultiComboboxInputComponent<T, R extends object = Record<string, unknown>>(
  props: MultiComboboxInputProps<T, R>,
) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return (
      <MultiComboboxInputStoreBacked
        {...(props as MultiComboboxInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> })}
      />
    );
  }
  return <MultiComboboxInputControlled {...(props as MultiComboboxInputPropsControlled<T, R>)} />;
}

function SelectInputStoreBacked<T extends object, R extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: SelectInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <SelectInputControlled
      {...rest}
      value={value as any}
      onSelect={onChange as any}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
}

function SelectInputControlled<T extends object, R extends object = Record<string, unknown>>({
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
}: SelectInputProps<T, R>) {
  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <Select
            required={required}
            disabled={disabled}
            onValueChange={(value) => onSelect?.(value === 'NONE' ? undefined : value)}
            value={value ?? ''}
          >
            <SelectTrigger
              id={id}
              className={cn(
                'w-full',
                errorText ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : '',
              )}
            >
              <div
                className={cn('truncate whitespace-nowrap')}
                {...(errorText ? { 'data-tip': errorText, 'data-tip-error': true } : {})}
              >
                <SelectValue placeholder={placeholder} />
              </div>
            </SelectTrigger>
            <SelectContent className="z-1000">
              <SelectGroup>
                {groupHeading && <SelectLabel>{groupHeading}</SelectLabel>}
                {isLoading && (
                  <SelectItem value="NONE">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                  </SelectItem>
                )}
                {options?.map((option) => (
                  <SelectItem key={getValue(option)} value={getValue(option)}>
                    {renderOption ? renderOption(option) : getLabel(option)}
                  </SelectItem>
                ))}
                {!required && <SelectItem value="NONE">{noneLabel}</SelectItem>}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    </InputShell>
  );
}

function SelectInputComponent<T extends object, R extends object = Record<string, unknown>>(
  props: SelectInputProps<T, R>,
) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return (
      <SelectInputStoreBacked
        {...(props as SelectInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> })}
      />
    );
  }
  return <SelectInputControlled {...(props as ComboboxInputPropsControlled<T, R> & { noneLabel?: string })} />;
}

/** Base props for LookupInput (no value/onSelect/store/attributeCode). */
type LookupInputPropsBase<_T extends string | number> = Omit<
  ComboboxInputPropsBase<LookupValueOption>,
  'options' | 'getValue' | 'getLabel' | 'groupHeading' | 'getIcon' | 'disableSortByLabel'
> & {
  lookupType: string;
  searchPlaceholder?: string;
  placeholder?: string;
  emptyText?: string;
  helpText?: string;
  className?: string;
  required?: boolean;
  isLoading?: boolean;
};

/** Store-backed: provide store + attributeCode; value/onSelect/isDirty are derived. */
type LookupInputPropsStoreBacked<T extends string | number, R extends object> = LookupInputPropsBase<T> & {
  store: Store<R>;
  attributeCode: StringKeyof<R>;
  rowId?: string;
  value?: never;
  onSelect?: never;
  isDirty?: never;
};

/** Controlled: provide value/onSelect; do not pass store/attributeCode/rowId. */
type LookupInputPropsControlled<
  T extends string | number,
  _R extends object = Record<string, unknown>,
> = LookupInputPropsBase<T> & {
  store?: undefined;
  attributeCode?: undefined;
  rowId?: undefined;
  value?: T;
  onSelect: (value?: T, option?: LookupValueOption) => void;
  isDirty?: boolean;
};

type LookupInputProps<T extends string | number, R extends object = Record<string, unknown>> =
  | LookupInputPropsStoreBacked<T, R>
  | LookupInputPropsControlled<T, R>;

function LookupInputStoreBacked<T extends string | number, R extends object>({
  store,
  rowId,
  attributeCode,
  ...rest
}: LookupInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> }) {
  const { value, onChange, isDirty, errorText } = useStoreBackedField(store, rowId, attributeCode);
  return (
    <LookupInputControlled
      {...rest}
      value={value as any}
      onSelect={onChange as any}
      isDirty={isDirty}
      errorText={errorText}
    />
  );
}

function LookupInputControlled<T extends string | number, R extends object = Record<string, unknown>>({
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
}: LookupInputPropsControlled<T, R>) {
  const [options, setOptions] = useState<LookupValueOption[]>([]);

  useEffect(() => {
    getLookupsByType(lookupType).then(setOptions);
  }, [lookupType]);

  return (
    <InputShell
      label={label}
      labelOnTop={labelOnTop}
      disabled={disabled}
      helpText={helpText}
      required={required}
      className={className}
      errorText={errorText}
    >
      {({ id, required, disabled }) => (
        <div
          className={cn(
            'relative',
            labelOnTop ? 'col-span-1' : 'col-span-2 row-start-1',
            isDirty && DIRTY_FIELD_INDICATOR_CLASS,
          )}
        >
          <ComboboxField
            id={id}
            value={value != null ? String(value) : undefined}
            placeholder={placeholder}
            options={options}
            getValue={(option) => String(option.value)}
            getLabel={(option) => option.label ?? option.value}
            renderOption={renderOption}
            onSelect={(_, option?: LookupValueOption | undefined) => onSelect(option?.value as T, option)}
            className={cn(
              'w-full',
              errorText
                ? '!border-red-500 dark:!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/50'
                : '',
            )}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            disabled={disabled}
            required={required}
            isLoading={isLoading}
            disableSortByLabel={true}
          />
        </div>
      )}
    </InputShell>
  );
}

export function LookupInput<T extends string | number, R extends object = Record<string, unknown>>(
  props: LookupInputProps<T, R>,
) {
  const { store, attributeCode } = props;
  if (store != null && attributeCode != null) {
    return (
      <LookupInputStoreBacked
        {...(props as LookupInputProps<T, R> & { store: Store<R>; attributeCode: StringKeyof<R> })}
      />
    );
  }
  return <LookupInputControlled {...(props as LookupInputPropsControlled<T, R>)} />;
}

export const TextInput = memo(TextInputComponent) as <T extends object>(props: TextInputProps<T>) => React.ReactNode;
export const PasswordInput = memo(PasswordInputComponent) as <T extends object>(
  props: Omit<TextInputProps<T>, 'type'>,
) => React.ReactNode;
export const TextArrayInput = memo(TextArrayInputComponent) as <T extends object>(
  props: TextArrayInputProps<T>,
) => React.ReactNode;
export const NumberInput = memo(NumberInputComponent) as <T extends object>(
  props: NumberInputProps<T>,
) => React.ReactNode;
export const YNInput = memo(YNInputComponent) as <T extends object>(props: YNInputProps<T>) => React.ReactNode;
export const TFInput = memo(TFInputComponent) as <T extends object>(props: TFInputProps<T>) => React.ReactNode;
export const DatePickerField = memo(DatePickerComponent) as <T extends object>(
  props: DatePickerProps<T>,
) => React.ReactNode;
export const DateInputField = memo(DateInputComponent) as <T extends object>(
  props: DateInputProps<T>,
) => React.ReactNode;
export const TimeInputField = memo(TimeInputComponent) as <T extends object>(
  props: TimeInputProps<T>,
) => React.ReactNode;
export const BooleanInput = memo(BooleanInputComponent) as <T extends object>(
  props: BooleanInputProps<T>,
) => React.ReactNode;
export const AsyncComboboxInput = memo(AsyncComboboxInputComponent) as <
  T extends object,
  R extends object = Record<string, unknown>,
>(
  props: AsyncComboboxInputProps<T, R>,
) => React.ReactNode;
export const ComboboxInput = memo(ComboboxInputComponent) as <
  T extends object,
  R extends object = Record<string, unknown>,
>(
  props: ComboboxInputProps<T, R>,
) => React.ReactNode;
export const AsyncMultiComboboxInput = memo(AsyncMultiComboboxInputComponent) as <
  T extends object,
  R extends object = Record<string, unknown>,
>(
  props: AsyncMultiComboboxInputProps<T, R>,
) => React.ReactNode;
export const MultiComboboxInput = memo(MultiComboboxInputComponent) as <T, R extends object = Record<string, unknown>>(
  props: MultiComboboxInputProps<T, R>,
) => React.ReactNode;
export const SelectInput = memo(SelectInputComponent) as <T extends object, R extends object = Record<string, unknown>>(
  props: SelectInputProps<T, R>,
) => React.ReactNode;
