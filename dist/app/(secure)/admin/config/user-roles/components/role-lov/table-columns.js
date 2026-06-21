/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import HeaderCell from '../../../../../../../components/core/table/header-cell';
import TableCell from '../../../../../../../components/core/table/table-cell';
import { CodeCell, EntityNameCell } from '../../../../../../../components/core/table/styled-cells';
import { useMemo } from 'react';
import { Shield } from 'lucide-react';
export default function useRolesLOVTableColumns(store) {
    return useMemo(() => {
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
                cell: (props) => (_jsx(EntityNameCell, { attributeCode: "roleName", icon: _jsx(Shield, { className: "size-3.5" }), iconBgClass: "bg-violet-500/10", iconClass: "text-violet-600 dark:text-violet-400", ...props })),
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
        ];
        return columns;
    }, [store]);
}
//# sourceMappingURL=table-columns.js.map