/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCurrentRowSync } from '../../../../../../components/core/hooks/useStoreHooks';
import { DateInputField, TextInput } from '../../../../../../components/core/page/fields';
export default function UserRolesEditForm({ store }) {
    const row = useCurrentRowSync(store);
    if (!row || !store) {
        return null;
    }
    return (_jsxs("div", { className: "grid gap-4 py-4", children: [_jsx(TextInput, { label: "User Name", store: store, attributeCode: "userName" }), _jsx(TextInput, { label: "Role Code", store: store, attributeCode: "roleCode" }), _jsx(DateInputField, { label: "Start Date", store: store, attributeCode: "startDate" }), _jsx(DateInputField, { label: "End Date", store: store, attributeCode: "endDate" })] }));
}
//# sourceMappingURL=edit-form.js.map