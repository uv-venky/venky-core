/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { useUserRolesStore } from '../../user-roles/hooks/use-store';
import { useUserListStore } from '../../user-roles/components/user-lov/use-store';
import useUsersLOVTableColumns from '../../user-roles/components/user-lov/table-columns';
import useUsersLOVSmartSearchColumns from '../../user-roles/components/user-lov/smart-search-columns';
import LOVDialog from '../../../../../../components/core/lov';
import { useEffect, useState } from 'react';
import { showInfo } from '../../../../../../components/core/common';
export function CopyRolesFromUserDialog({ rowId, onClose }) {
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
  const handleUserSelect = async (_userNames, users) => {
    if (users.length === 0) {
      return;
    }
    const sourceUserName = users[0].userName;
    setShowUserSelection(false);
    // Query roles from the source user
    let sourceRoles = [];
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
    let existingRoles = [];
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
    const newRows = rolesToAdd.map((role) => ({
      userName: rowId,
      roleCode: role.roleCode,
      roleName: role.roleName,
      startDate: new Date().toISOString(),
      endDate: null,
    }));
    await userRolesStore.insertBulk(newRows, true);
    await userRolesStore.save({
      feedback: `Successfully copied ${rolesToAdd.length} role(s) from ${sourceUserName} to ${rowId}`,
    });
    onClose();
  };
  if (showUserSelection) {
    return _jsx(LOVDialog, {
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          onClose();
        }
      },
      store: userListStore,
      tableColumns: tableColumns,
      smartSearchColumns: smartSearchColumns,
      onSelect: handleUserSelect,
      title: 'Copy Roles from User',
      width: 1100,
      height: 650,
      singleSelection: true,
    });
  }
  return null;
}
//# sourceMappingURL=CopyRolesFromUserDialog.js.map
