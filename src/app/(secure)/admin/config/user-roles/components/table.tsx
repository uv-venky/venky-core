/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { PaginationSection } from '@/components/core/page/page-layout-template';
import DataTable from '@/components/core/page/table';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import type { Store } from '@/lib/core/common/types/Store';
import type { Row, Table } from '@tanstack/react-table';

export function UserRolesTable({
  store,
  table,
  onRowClick,
}: {
  store: Store<UserRoles>;
  table: Table<UserRoles>;
  onRowClick?: (row: Row<UserRoles>) => void;
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
