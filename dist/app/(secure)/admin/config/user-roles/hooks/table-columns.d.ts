import type { UserRoles } from '../../../../../../lib/common/ds/types/core/UserRoles';
import type { Store } from '../../../../../../lib/core/common/types/Store';
import type { AccessorKeyColumnDef } from '@tanstack/react-table';
export default function useUserRolesTableColumns(store: Store<UserRoles>, { roleCode, userName, }: {
    roleCode?: string;
    userName?: string;
}): AccessorKeyColumnDef<UserRoles>[];
//# sourceMappingURL=table-columns.d.ts.map