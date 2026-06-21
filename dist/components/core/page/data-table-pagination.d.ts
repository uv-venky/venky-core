import type { Store } from '../../../lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
interface DataTablePaginationProps<T extends object> {
    table: Table<T>;
    pageSizeOptions?: PageSizeOptions;
    store: Store<T>;
    hideRowsPerPageSelector?: boolean;
}
type PageSizeOptions = readonly number[];
declare const _default: <T extends object>(props: DataTablePaginationProps<T>) => React.ReactNode;
export default _default;
//# sourceMappingURL=data-table-pagination.d.ts.map