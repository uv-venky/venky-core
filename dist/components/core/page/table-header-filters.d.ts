import type { Column } from '../../../components/core/smart-search/types';
import type { Store } from '../../../lib/core/common/types/Store';
import type { Table as TableType } from '@tanstack/react-table';
interface HeaderFiltersProps<T extends object> {
    table: TableType<T>;
    store: Store<T>;
    columns: Column<T>[];
}
export default function TableHeaderFilters<T extends object>({ table, store, columns }: HeaderFiltersProps<T>): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=table-header-filters.d.ts.map