import { type ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';
import type { Store } from '../../../lib/core/common/types/Store';
export type TableActionOpenDialogFn = (props: {
    rowId: string;
    table: Table<any>;
    onClose: () => void;
}) => ReactNode;
export interface TableActionRenderFnProps {
    rowId: string;
    table: Table<any>;
    asIconButton: boolean;
    store: Store<any>;
}
export type TableActionRenderFn = (props: TableActionRenderFnProps) => ReactNode;
export interface TableActionWithLabel {
    label: string;
    icon: ReactNode;
    onClick?: (props: {
        rowId: string;
        table: Table<any>;
    }) => void | Promise<void>;
    disabled?: boolean | ((rowId: string) => boolean);
    variant?: 'default' | 'destructive';
    separator?: boolean;
    showAsIcon?: boolean;
    dialog?: TableActionOpenDialogFn;
    tooltip?: string;
}
export interface TableActionWithRender {
    render: TableActionRenderFn;
    showAsIcon?: boolean;
}
export type TableAction = TableActionWithLabel | TableActionWithRender;
export interface ActionsColumnProps {
    actions: TableAction[];
    rowId: string;
    className?: string;
    table: Table<any>;
    store: Store<any>;
}
export declare function ActionsColumnCell({ actions, rowId, className, table, store }: ActionsColumnProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=actions-column.d.ts.map