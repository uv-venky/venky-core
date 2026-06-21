/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useStoreRowCount } from '../../../components/core/hooks/useStoreHooks';
import ColumnViewsDialog from '../../../components/core/page/column-views-dialog';
import Filters from '../../../components/core/page/filters';
import DataTable from '../../../components/core/page/table';
import useTable from '../../../components/core/page/useTable';
import DataTablePagination from './data-table-pagination';
export default function SimplePageTemplate({
  store,
  headerStartContent,
  headerEndContent,
  hideColumnsMenu = false,
  hideFilters = false,
  hidePagination = false,
  smartSearchColumns,
  tableColumns,
  pageId,
  itemId,
}) {
  const rowCount = useStoreRowCount(store);
  const table = useTable({
    store,
    tableColumns,
  });
  return _jsxs('div', {
    className: 'flex h-full w-full flex-col',
    children: [
      _jsxs('div', {
        className: 'my-4 flex shrink-0 items-center gap-4',
        children: [
          headerStartContent,
          !hideFilters &&
            _jsx(Filters, {
              border: 'full',
              roundedCorners: true,
              store: store,
              table: table,
              columns: smartSearchColumns,
              pageId: pageId,
              itemId: itemId,
            }),
          !hideColumnsMenu && _jsx(ColumnViewsDialog, { table: table }),
          headerEndContent,
        ],
      }),
      _jsx('div', {
        className: 'relative flex-1 rounded-md border',
        children: _jsx(DataTable, { table: table, store: store, smartSearchColumns: smartSearchColumns }),
      }),
      !hidePagination &&
        _jsxs('div', {
          className: 'flex shrink-0 items-center justify-end space-x-2 pt-4',
          children: [
            _jsxs('div', { className: 'flex-1 text-muted-foreground text-sm', children: [rowCount, ' row(s)'] }),
            _jsx('div', {
              className: 'space-x-2',
              children: _jsx(DataTablePagination, { table: table, store: store }),
            }),
          ],
        }),
    ],
  });
}
//# sourceMappingURL=simple-page-template.js.map
