import type { TF, YN } from '../../../lib/core/common/ds/types/YN';
import { type HTMLInputAutoCompleteAttribute, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { type AsyncComboboxFieldProps, type ComboboxFieldProps } from '../../../components/core/combobox';
import { type AsyncMultiComboboxFieldProps, type MultiComboboxFieldProps } from '../../../components/core/multi-combobox';
import { type LookupValueOption } from '../../../lib/core/client/lookups';
import type { StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
export declare function InputShell({ label, disabled, labelOnTop, helpText, required, children, className, errorText, }: {
    label?: string;
    disabled?: boolean;
    labelOnTop?: boolean;
    helpText?: ReactNode;
    required?: boolean;
    children: (props: {
        id: string;
        required: boolean;
        disabled: boolean;
    }) => React.ReactNode;
    className?: string;
    errorText?: string;
}): import("react/jsx-runtime").JSX.Element;
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
export type TextInputProps<T extends object = Record<string, unknown>> = TextInputPropsStoreBacked<T> | TextInputPropsControlled;
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
type TextArrayInputProps<R extends object = Record<string, unknown>> = TextArrayInputPropsStoreBacked<R> | TextArrayInputPropsControlled;
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
type NumberInputProps<T extends object = Record<string, unknown>> = NumberInputPropsStoreBacked<T> | NumberInputPropsControlled;
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
type DatePickerProps<T extends object = Record<string, unknown>> = DatePickerPropsStoreBacked<T> | DatePickerPropsControlled;
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
type DateInputProps<T extends object = Record<string, unknown>> = DateInputPropsStoreBacked<T> | DateInputPropsControlled;
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
type TimeInputProps<T extends object = Record<string, unknown>> = TimeInputPropsStoreBacked<T> | TimeInputPropsControlled;
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
type BooleanInputProps<T extends object = Record<string, unknown>> = BooleanInputPropsStoreBacked<T> | BooleanInputPropsControlled;
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
type AsyncComboboxInputPropsControlled<T extends object, _R extends object = Record<string, unknown>> = AsyncComboboxInputPropsBase<T> & {
    store?: undefined;
    attributeCode?: undefined;
    rowId?: undefined;
    value?: string | null;
    onSelect: (value?: string, option?: T) => void;
    isDirty?: boolean;
};
type AsyncComboboxInputProps<T extends object, R extends object = Record<string, unknown>> = AsyncComboboxInputPropsStoreBacked<T, R> | AsyncComboboxInputPropsControlled<T, R>;
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
type ComboboxInputPropsControlled<T extends object, _R extends object = Record<string, unknown>> = ComboboxInputPropsBase<T> & {
    store?: undefined;
    attributeCode?: undefined;
    rowId?: undefined;
    value?: string | null;
    onSelect: (value?: string, option?: T) => void;
    isDirty?: boolean;
};
type ComboboxInputProps<T extends object, R extends object = Record<string, unknown>> = ComboboxInputPropsStoreBacked<T, R> | ComboboxInputPropsControlled<T, R>;
type SelectInputProps<T extends object, R extends object = Record<string, unknown>> = ComboboxInputProps<T, R> & {
    noneLabel?: string;
};
type AsyncMultiComboboxInputPropsBase<T extends object> = Omit<AsyncMultiComboboxFieldProps<T>, 'value' | 'onSelect'> & {
    label: string;
    labelOnTop?: boolean;
    disabled?: boolean;
    errorText?: string;
};
/** Store-backed: provide store + attributeCode; value/onSelect/isDirty are derived. */
type AsyncMultiComboboxInputPropsStoreBacked<T extends object, R extends object> = AsyncMultiComboboxInputPropsBase<T> & {
    store: Store<R>;
    attributeCode: StringKeyof<R>;
    rowId?: string;
    value?: never;
    onSelect?: never;
    isDirty?: never;
};
/** Controlled: provide value/onSelect; do not pass store/attributeCode/rowId. */
type AsyncMultiComboboxInputPropsControlled<T extends object, _R extends object = Record<string, unknown>> = AsyncMultiComboboxInputPropsBase<T> & {
    store?: undefined;
    attributeCode?: undefined;
    rowId?: undefined;
    value: string[];
    onSelect: (value: string[]) => void;
    isDirty?: boolean;
};
type AsyncMultiComboboxInputProps<T extends object, R extends object = Record<string, unknown>> = AsyncMultiComboboxInputPropsStoreBacked<T, R> | AsyncMultiComboboxInputPropsControlled<T, R>;
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
type MultiComboboxInputPropsControlled<T, _R extends object = Record<string, unknown>> = MultiComboboxInputPropsBase<T> & {
    store?: undefined;
    attributeCode?: undefined;
    rowId?: undefined;
    value: string[];
    onSelect: (value: string[]) => void;
    isDirty?: boolean;
};
type MultiComboboxInputProps<T, R extends object = Record<string, unknown>> = MultiComboboxInputPropsStoreBacked<T, R> | MultiComboboxInputPropsControlled<T, R>;
/** Base props for LookupInput (no value/onSelect/store/attributeCode). */
type LookupInputPropsBase<_T extends string | number> = Omit<ComboboxInputPropsBase<LookupValueOption>, 'options' | 'getValue' | 'getLabel' | 'groupHeading' | 'getIcon' | 'disableSortByLabel'> & {
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
type LookupInputPropsControlled<T extends string | number, _R extends object = Record<string, unknown>> = LookupInputPropsBase<T> & {
    store?: undefined;
    attributeCode?: undefined;
    rowId?: undefined;
    value?: T;
    onSelect: (value?: T, option?: LookupValueOption) => void;
    isDirty?: boolean;
};
type LookupInputProps<T extends string | number, R extends object = Record<string, unknown>> = LookupInputPropsStoreBacked<T, R> | LookupInputPropsControlled<T, R>;
export declare function LookupInput<T extends string | number, R extends object = Record<string, unknown>>(props: LookupInputProps<T, R>): import("react/jsx-runtime").JSX.Element;
export declare const TextInput: <T extends object>(props: TextInputProps<T>) => React.ReactNode;
export declare const PasswordInput: <T extends object>(props: Omit<TextInputProps<T>, "type">) => React.ReactNode;
export declare const TextArrayInput: <T extends object>(props: TextArrayInputProps<T>) => React.ReactNode;
export declare const NumberInput: <T extends object>(props: NumberInputProps<T>) => React.ReactNode;
export declare const YNInput: <T extends object>(props: YNInputProps<T>) => React.ReactNode;
export declare const TFInput: <T extends object>(props: TFInputProps<T>) => React.ReactNode;
export declare const DatePickerField: <T extends object>(props: DatePickerProps<T>) => React.ReactNode;
export declare const DateInputField: <T extends object>(props: DateInputProps<T>) => React.ReactNode;
export declare const TimeInputField: <T extends object>(props: TimeInputProps<T>) => React.ReactNode;
export declare const BooleanInput: <T extends object>(props: BooleanInputProps<T>) => React.ReactNode;
export declare const AsyncComboboxInput: <T extends object, R extends object = Record<string, unknown>>(props: AsyncComboboxInputProps<T, R>) => React.ReactNode;
export declare const ComboboxInput: <T extends object, R extends object = Record<string, unknown>>(props: ComboboxInputProps<T, R>) => React.ReactNode;
export declare const AsyncMultiComboboxInput: <T extends object, R extends object = Record<string, unknown>>(props: AsyncMultiComboboxInputProps<T, R>) => React.ReactNode;
export declare const MultiComboboxInput: <T, R extends object = Record<string, unknown>>(props: MultiComboboxInputProps<T, R>) => React.ReactNode;
export declare const SelectInput: <T extends object, R extends object = Record<string, unknown>>(props: SelectInputProps<T, R>) => React.ReactNode;
export {};
//# sourceMappingURL=fields.d.ts.map