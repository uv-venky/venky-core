/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { PaginationSection } from '../../../../../../components/core/page/page-layout-template';
import DataTable from '../../../../../../components/core/page/table';
export function UserRolesTable({ store, table, onRowClick }) {
  return _jsxs('div', {
    className: 'flex flex-1 flex-col',
    children: [
      _jsx('div', {
        className: 'relative flex-1',
        children: _jsx(DataTable, { table: table, store: store, onRowClick: onRowClick }),
      }),
      _jsx(PaginationSection, { table: table, store: store }),
    ],
  });
}
//# sourceMappingURL=table.js.map
