/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCurrentRowSync } from '../../../../../../components/core/hooks/useStoreHooks';
import { BooleanInput, DatePickerField, PasswordInput, TextInput } from '../../../../../../components/core/page/fields';
import { CopyRolesFromUserField } from './CopyRolesFromUserField';
import { useCopyRolesContext } from './CopyRolesContext';
import { useEffect } from 'react';
export default function UsersEditForm({ store }) {
    const row = useCurrentRowSync(store);
    const { setCopyRolesFromUser } = useCopyRolesContext();
    // Reset copy roles selection when editing an existing user
    useEffect(() => {
        if (row && store) {
            const fromDB = store.isRowFromDB(store.rowId(row));
            if (fromDB) {
                setCopyRolesFromUser(undefined);
            }
        }
    }, [row, store, setCopyRolesFromUser]);
    if (!row || !store) {
        return null;
    }
    const fromDB = store.isRowFromDB(store.rowId(row));
    return (_jsxs("div", { className: "grid gap-4", children: [_jsx(TextInput, { label: "Display Name", store: store, attributeCode: "displayName", required: true }), _jsx(TextInput, { disabled: fromDB, transformValue: (value) => value?.toLowerCase().trim(), store: store, attributeCode: "email", label: "Email", required: true }), _jsx(TextInput, { disabled: fromDB, transformValue: (value) => value?.toLowerCase().trim(), store: store, attributeCode: "userName", label: "User Name", required: true }), !fromDB && (_jsxs(_Fragment, { children: [_jsx(PasswordInput, { label: "Password", store: store, attributeCode: "password", helpText: "Leave blank to autogenerate a new password" }), _jsx(BooleanInput, { label: "Send New User Email", store: store, attributeCode: "sendNewUserEmail" })] })), _jsx(DatePickerField, { label: "Start Date", store: store, attributeCode: "startDate", required: true }), _jsx(DatePickerField, { label: "End Date", store: store, attributeCode: "endDate" }), _jsx(TextInput, { label: "Location Name", store: store, attributeCode: "locationName" }), fromDB && _jsx(BooleanInput, { label: "Locked", store: store, attributeCode: "locked" }), _jsx(BooleanInput, { label: "Force Password Change", store: store, attributeCode: "forcePasswordChange" }), !fromDB && _jsx(CopyRolesFromUserField, {})] }));
}
//# sourceMappingURL=edit-form.js.map