import * as React from 'react';
import { type buttonVariants } from '../../../components/ui/button';
import type { VariantProps } from 'class-variance-authority';
type OptionType = {
    value: string;
    label: string;
};
interface ReorderableComboboxProps {
    options: OptionType[];
    placeholder?: string;
    emptyMessage?: string;
    onChange?: (values: string[]) => void;
    values?: string[];
    onToggle?: (value: string, isSelected: boolean) => void;
    getDisplayLabel?: () => React.ReactNode;
    variant?: VariantProps<typeof buttonVariants>['variant'];
    className?: string;
    id?: string;
    dataTestId?: string;
    iconOnly?: React.ReactNode;
}
export declare function ReorderableComboboxNoPopover({ options, placeholder, emptyMessage, onChange, values, onToggle, dataTestId, }: Omit<ReorderableComboboxProps, 'variant' | 'getDisplayLabel'>): import("react/jsx-runtime").JSX.Element;
export declare function ReorderableCombobox({ options, placeholder, emptyMessage, onChange, values, onToggle, getDisplayLabel, variant, className, id, dataTestId, iconOnly, }: ReorderableComboboxProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=reorderable-combobox.d.ts.map