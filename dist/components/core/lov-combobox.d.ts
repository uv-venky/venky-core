import type { Store } from '../../lib/core/common/types/Store';
export type LOVComboboxProps<T extends object> = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    store: Store<T>;
    onSelect: (values: string[], rows: readonly T[]) => void;
    title?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    getLabel: (row: Readonly<T>) => string;
    getValue: (row: Readonly<T>) => string;
    getOptions: (filter: string) => Promise<readonly T[]>;
    getOptionsForValue?: (values: string[]) => Promise<readonly T[]>;
    minSearchLength?: number;
    trigger?: React.ReactNode;
    className?: string;
    singleSelection?: boolean;
    value?: string[];
};
export default function LOVCombobox<T extends object>({ open, onOpenChange, store: _store, onSelect, title, placeholder, searchPlaceholder, getLabel, getValue, getOptions, getOptionsForValue, minSearchLength, trigger, className, singleSelection, value, }: LOVComboboxProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=lov-combobox.d.ts.map