import type * as React from 'react';
import { type RefObject } from 'react';
export declare function DatePicker({ value, onChange, placeholder, className, }: {
    value?: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function DateInput({ className, value, onChange, ref, style, dataTestId, disabled, placeholder, id, onFocus, onBlur, min, max, autoFocus, showTime, onKeyDown, onPaste, }: {
    className?: string;
    value: string;
    onChange?: (value?: string, usingPicker?: boolean) => void;
    ref?: RefObject<HTMLInputElement | null>;
    style?: React.CSSProperties;
    dataTestId?: string;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    min?: string | Date;
    max?: string | Date;
    autoFocus?: boolean;
    showTime?: boolean;
    onPaste?: (value: string, dataType: 'Text' | 'Number' | 'Date') => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function TimeInput({ className, value, onChange, ref, style, dataTestId, disabled, placeholder, id, onFocus, onBlur, step, }: {
    className?: string;
    value: string;
    onChange?: (value: string) => void;
    ref?: RefObject<HTMLInputElement | null>;
    style?: React.CSSProperties;
    dataTestId?: string;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    step?: number;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=date-field.d.ts.map