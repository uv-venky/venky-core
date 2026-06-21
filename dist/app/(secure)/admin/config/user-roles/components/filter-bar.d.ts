import type { UserRoles } from '../../../../../../lib/common/ds/types/core/UserRoles';
import type { Store } from '../../../../../../lib/core/common/types/Store';
import type { Table } from '@tanstack/react-table';
export declare function UserRolesFilterBar({
  store,
  table,
  pageId,
  itemId,
  roleCode,
  userName,
}: {
  store: Store<UserRoles>;
  table: Table<UserRoles>;
  pageId: string;
  itemId: string;
  roleCode?: string;
  userName?: string;
}): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=filter-bar.d.ts.map
