import type { Table } from '@tanstack/react-table';
import type { Store } from '../../../lib/core/common/types/Store';
export declare function exportStoreToExcel<T extends object>({ store, table, filename, includeMetadata, }: {
    store: Store<T>;
    table: Table<T>;
    filename: string;
    includeMetadata?: boolean;
}): Promise<void>;
//# sourceMappingURL=exportStoreToExcel.d.ts.map