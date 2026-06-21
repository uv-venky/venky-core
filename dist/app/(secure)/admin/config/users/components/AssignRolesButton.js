/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { EditPopup } from '../../../../../../components/core/page/edit-popup';
import UserRolesTableWithSearch from '../../user-roles/components/table-with-search';
import { useUserRolesStore } from '../../user-roles/hooks/use-store';
export function AssignRolesDialog({ rowId, onClose }) {
  const userRolesStore = useUserRolesStore('assign-roles');
  return _jsx(EditPopup, {
    title: 'Assign Roles',
    description: "Select the roles you want to assign to the user and click save when you're done.",
    store: userRolesStore,
    onClose: onClose,
    width: 980,
    height: 600,
    children: _jsx(UserRolesTableWithSearch, { userName: rowId, store: userRolesStore }),
  });
}
//# sourceMappingURL=AssignRolesButton.js.map
