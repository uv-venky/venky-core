/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsStoreBusy, useStoreRowCount } from '../../../components/core/hooks/useStoreHooks';
import { Suspense } from 'react';
import Suspended from '../../../components/core/common/Suspended';
import ColumnViewsDialog from '../../../components/core/page/column-views-dialog';
import Filters from '../../../components/core/page/filters';
import DataTable from '../../../components/core/page/table';
import useTable from '../../../components/core/page/useTable';
import DataTablePagination from '../../../components/core/page/data-table-pagination';
import { WaveDots } from '../../../components/core/common/WaveDots';
export default function TableLayoutTemplate({ store, headerStartContent, headerEndContent, hideColumnsMenu = false, hideFilters = false, hidePagination = false, smartSearchColumns, tableColumns, pageId, itemId, onRowClick, variant = 'roomy', emptyStateTitle = 'No data found', emptyStateSubtitle = 'Use the filters above to search', updateFilters, }) {
    const table = useTable({
        store,
        tableColumns,
        initialPreferences: { tableVariant: variant },
    });
    const rowCount = useStoreRowCount(store);
    const isStoreBusy = useIsStoreBusy(store);
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("div", { className: "flex shrink-0 items-center py-4", children: [headerStartContent, !hideFilters && (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "Filters" }), children: _jsx(Filters, { border: "none", store: store, table: table, columns: smartSearchColumns, pageId: pageId, itemId: itemId, updateFilters: updateFilters }) })), !hideColumnsMenu && (_jsx(ColumnViewsDialog, { table: table, variant: "ghost", defaultPreferences: { tableVariant: variant } })), headerEndContent] }), _jsx(Suspense, { fallback: _jsx(Suspended, { name: "MainSection" }), children: _jsxs("div", { className: "flex min-h-0 flex-1 flex-col", children: [_jsx("div", { className: "relative flex-1", children: _jsx(DataTable, { table: table, onRowClick: onRowClick, store: store, smartSearchColumns: smartSearchColumns, emptyStateTitle: emptyStateTitle, emptyStateSubtitle: emptyStateSubtitle }) }), !hidePagination && (_jsxs("div", { className: "flex shrink-0 items-center justify-end space-x-2 p-2", children: [isStoreBusy ? (_jsx("div", { className: "flex-1", children: _jsx(WaveDots, { active: true }) })) : (rowCount != null && _jsxs("div", { className: "flex-1 text-muted-foreground text-sm", children: [rowCount, " row(s)"] })), _jsx("div", { className: "space-x-2", children: _jsx(DataTablePagination, { table: table, store: store }) })] }))] }) })] }));
}
//# sourceMappingURL=table-layout-template.js.map