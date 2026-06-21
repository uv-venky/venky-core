/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { EditPopup } from '../../../../../../components/core/page/edit-popup';
import UserRolesTableWithSearch from '../../user-roles/components/table-with-search';
import { useUserRolesStore } from '../../user-roles/hooks/use-store';
export function AssignToUsersDialog({ rowId, onClose }) {
  const userRolesStore = useUserRolesStore('assign-to-users');
  return _jsx(EditPopup, {
    width: 980,
    height: 600,
    contentClassName: 'pb-4',
    title: 'Assign to Users',
    store: userRolesStore,
    onClose: onClose,
    modal: false,
    children: _jsx(UserRolesTableWithSearch, { roleCode: rowId, store: userRolesStore }),
  });
}
//# sourceMappingURL=AssignToUsersDialog.js.map
