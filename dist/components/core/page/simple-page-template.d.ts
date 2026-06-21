import type { Store } from '../../../lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
import type * as React from 'react';
import type { Column } from '../../../components/core/smart-search/types';
export default function SimplePageTemplate<T extends object>({ store, headerStartContent, headerEndContent, hideColumnsMenu, hideFilters, hidePagination, smartSearchColumns, tableColumns, pageId, itemId, }: {
    store: Store<T>;
    headerStartContent?: React.ReactNode;
    headerEndContent?: React.ReactNode;
    hideColumnsMenu?: boolean;
    hideFilters?: boolean;
    hidePagination?: boolean;
    smartSearchColumns: Column<T>[];
    tableColumns: AccessorKeyColumnDef<T>[];
    pageId: string;
    itemId: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=simple-page-template.d.ts.map