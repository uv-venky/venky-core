/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { EditPopup } from '@/components/core/page/edit-popup';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import UserRolesTableWithSearch from '../../user-roles/components/table-with-search';
import { useUserRolesStore } from '../../user-roles/hooks/use-store';

export function AssignRolesDialog({ rowId, onClose }: { rowId: string; onClose: () => void }) {
  const userRolesStore = useUserRolesStore('assign-roles');
  return (
    <EditPopup<UserRoles>
      title="Assign Roles"
      description="Select the roles you want to assign to the user and click save when you're done."
      store={userRolesStore}
      onClose={onClose}
      width={980}
      height={600}
    >
      <UserRolesTableWithSearch userName={rowId} store={userRolesStore} />
    </EditPopup>
  );
}
