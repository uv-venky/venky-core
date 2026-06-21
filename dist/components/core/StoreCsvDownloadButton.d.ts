import type { Store } from '../../lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
interface StoreCsvDownloadButtonProps<T extends object> {
    store: Store<T>;
    table: Table<T>;
    filename?: string;
    excludeColumns?: string[];
}
export default function StoreCsvDownloadButton<T extends object>({ store, table, filename, excludeColumns, }: StoreCsvDownloadButtonProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StoreCsvDownloadButton.d.ts.map