/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Suspended from '../../../../../../components/core/common/Suspended';
import Filters from '../../../../../../components/core/page/filters';
import { Button } from '../../../../../../components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import useUserRolesSmartSearchColumns from '../hooks/smart-search-columns';
import UsersLOVCombobox from './user-lov/user-lov-combobox';
import RolesLOVCombobox from './role-lov/role-lov-combobox';
import { useRows } from '../../../../../../components/core/hooks/useStoreHooks';
export function UserRolesFilterBar({ store, table, pageId, itemId, roleCode, userName, }) {
    const smartSearchColumns = useUserRolesSmartSearchColumns({
        roleCode,
        userName,
    });
    const rows = useRows(store);
    const selectedRoles = useMemo(() => {
        return rows.filter((row) => row._status === 'I').map((row) => row.roleCode ?? '');
    }, [rows]);
    const selectedUsers = useMemo(() => {
        return rows.filter((row) => row._status === 'I').map((row) => row.userName ?? '');
    }, [rows]);
    const [openEditPopup, setOpenEditPopup] = useState(false);
    return (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "Filters" }), children: _jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [_jsx(Filters, { border: "full", columns: smartSearchColumns, itemId: itemId, pageId: pageId, roundedCorners: true, store: store, table: table, disableSavedSearches: true }), roleCode && (_jsx(UsersLOVCombobox, { open: openEditPopup, onOpenChange: (open) => {
                        setOpenEditPopup(open);
                    }, trigger: _jsxs(Button, { variant: "default", onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenEditPopup(true);
                        }, children: [_jsx(PlusIcon, { className: "h-4 w-4" }), "Assign to Users"] }), onSelect: async (_usernames, users) => {
                        const rows = users
                            .filter((user) => !selectedUsers.includes(user.userName ?? ''))
                            .map((username) => ({
                            userName: username.userName,
                            roleCode,
                            startDate: new Date().toISOString(),
                            endDate: null,
                            displayName: username.displayName,
                            email: username.email,
                            _status: 'I',
                        }));
                        await store.insertBulk(rows, true);
                        // Don't close here - let LOVCombobox handle closing after selection is confirmed
                    }, roleCode: roleCode, value: selectedUsers })), userName && (_jsx(RolesLOVCombobox, { open: openEditPopup, onOpenChange: (open) => {
                        setOpenEditPopup(open);
                    }, trigger: _jsxs(Button, { variant: "default", onClick: (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setOpenEditPopup(true);
                        }, children: [_jsx(PlusIcon, { className: "h-4 w-4" }), "Assign Roles"] }), onSelect: async (_rolesCodes, roles) => {
                        const rows = roles
                            .filter((role) => !selectedRoles.includes(role.roleCode ?? ''))
                            .map((role) => ({
                            userName: userName,
                            roleCode: role.roleCode,
                            roleName: role.roleName,
                            startDate: new Date().toISOString(),
                            endDate: null,
                            _status: 'I',
                        }));
                        await store.insertBulk(rows, true);
                        // Don't close here - let LOVCombobox handle closing after selection is confirmed
                    }, userName: userName, value: selectedRoles }))] }) }));
}
//# sourceMappingURL=filter-bar.js.map