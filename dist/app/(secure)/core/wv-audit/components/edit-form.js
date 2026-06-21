/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCurrentRowSync } from '../../../../../components/core/hooks/useStoreHooks';
import { DateInputField, NumberInput, TextInput } from '../../../../../components/core/page/fields';
export default function WVAuditEditForm({ store }) {
    const row = useCurrentRowSync(store);
    if (!row || !store) {
        return null;
    }
    return (_jsxs("div", { className: "grid gap-4 py-4", children: [_jsx(TextInput, { label: "Attribute Code", store: store, attributeCode: "attributeCode" }), _jsx(NumberInput, { label: "Audit Id", store: store, attributeCode: "auditId" }), _jsx(TextInput, { label: "Datasource Id", store: store, attributeCode: "datasourceId" }), _jsx(TextInput, { label: "New Clob Value", store: store, attributeCode: "newClobValue" }), _jsx(DateInputField, { label: "New Datetime Value", store: store, attributeCode: "newDatetimeValue" }), _jsx(NumberInput, { label: "New Double Value", store: store, attributeCode: "newDoubleValue" }), _jsx(TextInput, { label: "New String Value", store: store, attributeCode: "newStringValue" }), _jsx(TextInput, { label: "Old Clob Value", store: store, attributeCode: "oldClobValue" }), _jsx(DateInputField, { label: "Old Datetime Value", store: store, attributeCode: "oldDatetimeValue" }), _jsx(NumberInput, { label: "Old Double Value", store: store, attributeCode: "oldDoubleValue" }), _jsx(TextInput, { label: "Old String Value", store: store, attributeCode: "oldStringValue" }), _jsx(TextInput, { label: "Pk Value", store: store, attributeCode: "pkValue" }), _jsx(TextInput, { label: "Value Type", store: store, attributeCode: "valueType" })] }));
}
//# sourceMappingURL=edit-form.js.map