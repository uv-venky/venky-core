/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import PageLayoutTemplate from '../../../../../components/core/page/page-layout-template';
import { Shield } from 'lucide-react';
import useRolesSmartSearchColumns from './hooks/smart-search-columns';
import useRolesTableColumns from './hooks/table-columns';
import { useRolesStore } from './hooks/use-store';
import EditForm from './components/edit-form';
export default function RolesPageContent() {
    const store = useRolesStore();
    const smartSearchColumns = useRolesSmartSearchColumns();
    const tableColumns = useRolesTableColumns(store);
    return (_jsx(PageLayoutTemplate, { title: "Roles", subTitle: "Manage Roles", icon: _jsx(Shield, { className: "h-12 w-12 text-muted-foreground" }), store: store, smartSearchColumns: smartSearchColumns, tableColumns: tableColumns, pageId: "roles-page", itemId: "roles", editForm: _jsx(EditForm, { store: store }), rowClickToEdit: false, getDefaultRow: () => {
            return {};
        }, addNewButtonText: "Add New Role", popupWidth: 500, popupHeight: 434, disableHeaderFilters: true }));
}
//# sourceMappingURL=page-content.js.map