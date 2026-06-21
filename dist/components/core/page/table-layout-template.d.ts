import type { Store } from '../../../lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import { type ReactNode } from 'react';
import type { Column } from '../../../components/core/smart-search/types';
import type { Filters as FiltersType } from '../../../lib/core/common/ds/types/filter';
import type { TableVariant } from '../../../components/core/common/types';
type Props<T extends object> = {
    store: Store<T>;
    headerStartContent?: ReactNode;
    headerEndContent?: ReactNode;
    hideColumnsMenu?: boolean;
    hideFilters?: boolean;
    hidePagination?: boolean;
    smartSearchColumns: Column<T>[];
    tableColumns: AccessorKeyColumnDef<T>[];
    pageId: string;
    itemId: string;
    onRowClick?: () => void;
    variant?: TableVariant;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
    updateFilters?: (filters: FiltersType<T>) => FiltersType<T>;
};
export default function TableLayoutTemplate<T extends object>({ store, headerStartContent, headerEndContent, hideColumnsMenu, hideFilters, hidePagination, smartSearchColumns, tableColumns, pageId, itemId, onRowClick, variant, emptyStateTitle, emptyStateSubtitle, updateFilters, }: Props<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=table-layout-template.d.ts.map