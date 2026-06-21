import type * as React from 'react';
export declare function DropdownMenuField<T>({ options, value, onChange, getLabel, getValue, placeholder, children, startIcon, open, onOpenChange, onCloseAutoFocus, dataTestId, iconTrigger, }: {
    options: ReadonlyArray<T>;
    value: string;
    getLabel: (option: T) => React.ReactNode;
    getValue: (option: T) => string;
    onChange: (value: string) => void;
    placeholder?: string;
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCloseAutoFocus?: ((event: Event) => void) | undefined;
    dataTestId?: string;
    iconTrigger?: boolean;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=dropdown-menu.d.ts.map