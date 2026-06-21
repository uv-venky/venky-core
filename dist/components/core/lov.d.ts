import type { Column } from '../../components/core/smart-search/types';
import type { Store } from '../../lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import type { Row } from '../../lib/core/common/ds/types/filter';
export type LOVDialogProps<T extends object> = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    store: Store<T>;
    tableColumns: AccessorKeyColumnDef<T>[];
    smartSearchColumns: Column<T>[];
    onSelect: (values: string[], rows: readonly Row<T>[]) => void;
    title?: string;
    contentClassName?: string;
    width?: number;
    height?: number;
    singleSelection?: boolean;
    modal?: boolean;
};
export default function LOVDialog<T extends object>({ open, onOpenChange, store, tableColumns, smartSearchColumns, onSelect, title, contentClassName, width, height, singleSelection, modal, }: LOVDialogProps<T>): false | import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=lov.d.ts.map