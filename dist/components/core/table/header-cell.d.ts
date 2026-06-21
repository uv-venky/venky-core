import type { AttributeType } from '../../../lib/core/common/ds/types/AttributeType';
import type { Store } from '../../../lib/core/common/types/Store';
import type { Column, Header, Table } from '@tanstack/react-table';
export declare function TableRowSelectionHeaderCell({ className, isDisabled, }: {
    className?: string;
    isDisabled?: (rowId: string) => boolean;
}): import("react/jsx-runtime").JSX.Element;
export default function HeaderCell({ store, title, accessorKey, type, className, isEditable, column, sortable, align, table, }: {
    store: Store<any>;
    title: string;
    accessorKey: string;
    type: AttributeType;
    className?: string;
    isEditable?: boolean;
    table: Table<any>;
    header: Header<any, unknown>;
    column: Column<any, unknown>;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=header-cell.d.ts.map