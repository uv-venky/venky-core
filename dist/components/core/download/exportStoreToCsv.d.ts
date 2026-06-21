import type { Table } from '@tanstack/react-table';
import type { Store } from '../../../lib/core/common/types/Store';
export declare function getExportableColumns<T extends object>(store: Store<T>, table: Table<T>): {
    code: string;
    label: string;
}[];
export declare function exportStoreToCsv<T extends object>({ store, table, filename, includeMetadata, }: {
    store: Store<T>;
    table: Table<T>;
    filename: string;
    includeMetadata?: boolean;
}): Promise<void>;
//# sourceMappingURL=exportStoreToCsv.d.ts.map