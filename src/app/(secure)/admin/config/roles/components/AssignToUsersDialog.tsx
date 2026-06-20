/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { EditPopup } from '@/components/core/page/edit-popup';
import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import UserRolesTableWithSearch from '../../user-roles/components/table-with-search';
import { useUserRolesStore } from '../../user-roles/hooks/use-store';

export function AssignToUsersDialog({ rowId, onClose }: { rowId: string; onClose: () => void }) {
  const userRolesStore = useUserRolesStore('assign-to-users');
  return (
    <EditPopup<UserRoles>
      width={980}
      height={600}
      contentClassName="pb-4"
      title="Assign to Users"
      store={userRolesStore}
      onClose={onClose}
      modal={false}
    >
      <UserRolesTableWithSearch roleCode={rowId} store={userRolesStore} />
    </EditPopup>
  );
}
