import type { Store } from '../../../lib/core/common/types/Store';
import type { CellContext } from '@tanstack/react-table';
import type { StringKeyof } from '../../../lib/core/common/ds/types/filter';
export type pasteDataType = 'Text' | 'Number' | 'Date';
export declare function onDataPaste<T extends object, K extends StringKeyof<T>>(data: string, store: Store<T>, dataType: pasteDataType, attributeCode: K): Promise<void>;
export declare function EditableNumberCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    currency?: boolean;
    store: Store<any>;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
export declare function EditableTextCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
export declare function EditableComboboxInputCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    label: string;
    store: Store<any>;
    optionsStore: Store<any>;
    getLabel: (option: any) => string;
    getOptionValue: (option: any) => string;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
export declare function EditableYNCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
    handleClick?: () => void;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
export declare function EditableBooleanCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
export declare function EditableTFCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
export declare function EditableDateCell(props: {
    disabled?: boolean;
    attributeCode: string;
    className?: string;
    store: Store<any>;
    min?: string;
    max?: string;
    onPaste?: (data: any, dataType: pasteDataType) => void;
    doValidate?: (value: string | undefined) => void;
    feedbackMask?: boolean;
} & CellContext<any, unknown>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=editable-table-cells.d.ts.map