/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import HeaderCell from '../../../../../../components/core/table/header-cell';
import TableCell from '../../../../../../components/core/table/table-cell';
import { CodeCell, EntityNameCell } from '../../../../../../components/core/table/styled-cells';
import { createActionsColumn } from '../../../../../../components/core/table/actions-column-def';
import { useMemo } from 'react';
import { Pencil, Shield, Users } from 'lucide-react';
import { AssignToUsersDialog } from '../components/AssignToUsersDialog';
export default function useRolesTableColumns(store) {
    return useMemo(() => {
        const actions = [
            {
                label: 'Edit',
                icon: _jsx(Pencil, { className: "size-4" }),
                onClick: ({ rowId, table }) => {
                    table.options.meta?.onEdit?.(rowId);
                },
            },
            {
                label: 'Assign to Users',
                icon: _jsx(Users, { className: "size-4" }),
                dialog: ({ rowId, onClose }) => {
                    return _jsx(AssignToUsersDialog, { rowId: rowId, onClose: onClose });
                },
            },
        ];
        // customize columns based on roles etc.
        const columns = [
            {
                accessorKey: 'roleName',
                meta: {
                    label: 'Role Name',
                },
                size: 240,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "roleName", title: "Role Name" });
                },
                cell: (props) => (_jsx(EntityNameCell, { attributeCode: "roleName", icon: _jsx(Shield, { className: "size-3.5" }), iconBgClass: "bg-violet-500/10", iconClass: "text-violet-600 dark:text-violet-400", useTableOnEdit: true, ...props })),
            },
            {
                accessorKey: 'roleCode',
                meta: {
                    label: 'Role Code',
                },
                size: 160,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "roleCode", title: "Role Code" });
                },
                cell: (props) => _jsx(CodeCell, { attributeCode: "roleCode", ...props }),
            },
            {
                accessorKey: 'startDate',
                meta: {
                    label: 'Start Date',
                },
                size: 110,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Date", store: store, accessorKey: "startDate", title: "Start Date" });
                },
                cell: (props) => _jsx(TableCell, { type: "Date", attributeCode: "startDate", ...props }),
            },
            {
                accessorKey: 'endDate',
                meta: {
                    label: 'End Date',
                },
                size: 110,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Date", store: store, accessorKey: "endDate", title: "End Date" });
                },
                cell: (props) => _jsx(TableCell, { type: "Date", attributeCode: "endDate", ...props }),
            },
            {
                accessorKey: 'description',
                meta: {
                    label: 'Description',
                },
                size: 280,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "description", title: "Description" });
                },
                cell: (props) => _jsx(TableCell, { type: "Text", attributeCode: "description", ...props }),
            },
            createActionsColumn(actions, { size: 80, title: 'Actions' }),
        ];
        return columns;
    }, [store]);
}
//# sourceMappingURL=table-columns.js.map