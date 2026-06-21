/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useCurrentRowSync } from '../../../../../../components/core/hooks/useStoreHooks';
import { DateInputField, TextInput } from '../../../../../../components/core/page/fields';
export default function RolesEditForm({ store }) {
  const row = useCurrentRowSync(store);
  if (!row || !store) {
    return null;
  }
  const fromDB = store.isRowFromDB(store.rowId(row));
  return _jsxs('div', {
    className: 'grid gap-4',
    children: [
      _jsx(TextInput, { disabled: fromDB, label: 'Role Code', store: store, attributeCode: 'roleCode' }),
      _jsx(TextInput, { label: 'Role Name', required: true, store: store, attributeCode: 'roleName' }),
      _jsx(DateInputField, { label: 'Start Date', store: store, attributeCode: 'startDate' }),
      _jsx(DateInputField, { label: 'End Date', store: store, attributeCode: 'endDate' }),
      _jsx(TextInput, { label: 'Description', store: store, attributeCode: 'description' }),
    ],
  });
}
//# sourceMappingURL=edit-form.js.map
