import type { StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { Store } from '../../../lib/core/common/types/Store';
import { type AccessorKeyColumnDef, type RowData, type Table, type VisibilityState } from '@tanstack/react-table';
import * as React from 'react';
import { type TableColumnPreferences } from '../../../components/core/page/table-column-preferences';
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        disableHeaderFilters?: boolean;
        store: Store<any>;
        tableColumns: AccessorKeyColumnDef<TData>[];
        defaultVisibleColumnOrder?: Extract<keyof TData, string>[];
        updateProxy: {
            count: number;
        };
        resizeProxy: {
            count: number;
        };
        onEdit?: (rowId: string) => void;
        preferences: TableColumnPreferences;
        setPreferences: React.Dispatch<React.SetStateAction<TableColumnPreferences>>;
        defaultPageSize: number;
        defaultPreferences: TableColumnPreferences;
        setPaginationPageSize: (pageSize: number) => void;
    }
    interface ColumnMeta<TData extends RowData, TValue> {
        sticky?: 'left' | 'right';
        label?: string;
        flexGrow?: number;
    }
}
type Props<T extends object> = {
    store: Store<T>;
    tableColumns: AccessorKeyColumnDef<T>[];
    defaultVisibleColumnOrder?: StringKeyof<T>[];
    disableHeaderFilters?: boolean;
    initialPreferences?: Partial<TableColumnPreferences>;
};
export { getColumnId } from '../../../components/core/page/table-column-preferences';
export declare function getDefaultColumnVisibility<T extends object>(tableColumns: AccessorKeyColumnDef<T>[], defaultVisibleColumnOrder: Extract<keyof T, string>[] | undefined): VisibilityState;
/**
 * Merges a saved column order with the current table columns.
 * Columns that exist in the table but are missing from the saved order (e.g. newly added columns)
 * are inserted before the right-sticky columns (e.g. __actions) so Actions stays last.
 */
export declare function mergeSavedColumnOrder<T extends object>(savedOrder: string[], tableColumns: AccessorKeyColumnDef<T>[]): string[];
export declare function getDefaultColumnOrder<T extends object>(tableColumns: AccessorKeyColumnDef<T>[], defaultVisibleColumnOrder: Extract<keyof T, string>[] | undefined): string[];
export default function useTable<T extends object>({ store, tableColumns, defaultVisibleColumnOrder, disableHeaderFilters: disableHeaderFiltersProp, initialPreferences, }: Props<T>): Table<T>;
/** Reset column order, visibility, sizing, density/sticky, and page size to page defaults. */
export declare function resetTableColumnLayout<T extends object>(table: Table<T>): Promise<void>;
//# sourceMappingURL=useTable.d.ts.map