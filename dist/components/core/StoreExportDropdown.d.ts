import type { Store } from '../../lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
interface StoreExportDropdownProps<T extends object> {
    store: Store<T>;
    table: Table<T>;
    filename?: string;
    excludeColumns?: string[];
    includeMetadata?: boolean;
    className?: string;
}
export default function StoreExportDropdown<T extends object>({ store, table, filename, excludeColumns, includeMetadata, className, }: StoreExportDropdownProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StoreExportDropdown.d.ts.map