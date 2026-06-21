export default ({ dsName, moduleCode }) => {
  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { PaginationSection } ${'from'} '@/components/core/page';
import { DataTable } ${'from'} '@/components/core/page';
import type { ${dsName} } ${'from'} '@/lib/common/ds/types/${moduleCode}/${dsName}';
import type {  Store } ${'from'} '@/lib/core/common/types/Store';
import type { Row, Table } ${'from'} '@tanstack/react-table';

export function ${dsName}Table({
  store,
  table,
  onRowClick,
}: {
  store: Store<${dsName}>;
  table: Table<${dsName}>;
  onRowClick?: (row: Row<${dsName}>) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1">
        <DataTable table={table} store={store} onRowClick={onRowClick} />
      </div>
      <PaginationSection table={table} store={store} />
    </div>
  );
}
`;
};
//# sourceMappingURL=table.js.map
