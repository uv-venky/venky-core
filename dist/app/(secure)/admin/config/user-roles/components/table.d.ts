import type { UserRoles } from '../../../../../../lib/common/ds/types/core/UserRoles';
import type { Store } from '../../../../../../lib/core/common/types/Store';
import type { Row, Table } from '@tanstack/react-table';
export declare function UserRolesTable({
  store,
  table,
  onRowClick,
}: {
  store: Store<UserRoles>;
  table: Table<UserRoles>;
  onRowClick?: (row: Row<UserRoles>) => void;
}): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=table.d.ts.map
