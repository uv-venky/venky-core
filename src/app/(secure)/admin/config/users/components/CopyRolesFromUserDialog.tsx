/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { UserRoles } from '@/lib/common/ds/types/core/UserRoles';
import { useUserRolesStore } from '../../user-roles/hooks/use-store';
import { useUserListStore } from '../../user-roles/components/user-lov/use-store';
import useUsersLOVTableColumns from '../../user-roles/components/user-lov/table-columns';
import useUsersLOVSmartSearchColumns from '../../user-roles/components/user-lov/smart-search-columns';
import LOVDialog from '@/components/core/lov';
import { useEffect, useState } from 'react';
import type { UserList } from '@/lib/common/ds/types/core/UserList';
import type { Row } from '@/lib/core/common/ds/types/filter';
import type { NewRow } from '@/lib/core/common/ds/types/filter';
import type { DBRow } from '@/lib/core/common/ds/types/filter';
import { showInfo } from '@/components/core/common';

export function CopyRolesFromUserDialog({ rowId, onClose }: { rowId: string; onClose: () => void }) {
  const userRolesStore = useUserRolesStore('copy-roles-from-user');
  const [showUserSelection, setShowUserSelection] = useState(true);
  const userListStore = useUserListStore();
  const tableColumns = useUsersLOVTableColumns(userListStore);
  const smartSearchColumns = useUsersLOVSmartSearchColumns();

  useEffect(() => {
    if (showUserSelection) {
      userListStore.executeQuery({ query: { sort: { userName: 1 } } });
    }
  }, [showUserSelection, userListStore]);

  const handleUserSelect = async (_userNames: string[], users: readonly Row<UserList>[]) => {
    if (users.length === 0) {
      return;
    }

    const sourceUserName = users[0].userName;
    setShowUserSelection(false);

    // Query roles from the source user
    let sourceRoles: DBRow<UserRoles>[] = [];
    await userRolesStore.executeQuery({
      query: {
        data: {
          userName: sourceUserName,
        },
      },
      handleResponse: (rows) => {
        sourceRoles = rows;
      },
      noClear: true,
    });

    if (sourceRoles.length === 0) {
      showInfo(`No roles found for ${sourceUserName}`);
      // No roles to copy
      onClose();
      return;
    }

    // Query existing roles for the target user
    let existingRoles: DBRow<UserRoles>[] = [];
    await userRolesStore.executeQuery({
      query: {
        data: {
          userName: rowId,
        },
      },
      handleResponse: (rows) => {
        existingRoles = rows;
      },
      noClear: true,
    });

    const existingRoleCodes = new Set(existingRoles.map((r) => r.roleCode));

    // Filter out roles that already exist
    const rolesToAdd = sourceRoles.filter((role) => !existingRoleCodes.has(role.roleCode));

    if (rolesToAdd.length === 0) {
      // All roles already exist
      showInfo(`No new roles to copy from ${sourceUserName} to ${rowId}`);
      onClose();
      return;
    }

    // Add the new roles
    const newRows: NewRow<UserRoles>[] = rolesToAdd.map(
      (role) =>
        ({
          userName: rowId,
          roleCode: role.roleCode,
          roleName: role.roleName,
          startDate: new Date().toISOString(),
          endDate: null,
        }) satisfies NewRow<UserRoles>,
    );

    await userRolesStore.insertBulk(newRows, true);
    await userRolesStore.save({
      feedback: `Successfully copied ${rolesToAdd.length} role(s) from ${sourceUserName} to ${rowId}`,
    });
    onClose();
  };

  if (showUserSelection) {
    return (
      <LOVDialog
        open
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        store={userListStore}
        tableColumns={tableColumns}
        smartSearchColumns={smartSearchColumns}
        onSelect={handleUserSelect}
        title="Copy Roles from User"
        width={1100}
        height={650}
        singleSelection
      />
    );
  }

  return null;
}
