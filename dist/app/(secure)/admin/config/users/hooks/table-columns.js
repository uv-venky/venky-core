/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import HeaderCell from '../../../../../../components/core/table/header-cell';
import TableCell, { Cell } from '../../../../../../components/core/table/table-cell';
import { BooleanYesNoCell, CompoundCell } from '../../../../../../components/core/table/styled-cells';
import { createActionsColumn } from '../../../../../../components/core/table/actions-column-def';
import { useMemo } from 'react';
import { Copy, MapPin, Pencil, Shield, User } from 'lucide-react';
import { AssignRolesDialog } from '../../../../../../app/(secure)/admin/config/users/components/AssignRolesButton';
import { CopyRolesFromUserDialog } from '../../../../../../app/(secure)/admin/config/users/components/CopyRolesFromUserDialog';
import { useRowValue } from '../../../../../../components/core/hooks/useStoreHooks';
import { Moon, Sun } from 'lucide-react';
export default function useUsersTableColumns(store) {
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
                label: 'Assign Roles',
                icon: _jsx(Shield, { className: "size-4" }),
                dialog: ({ rowId, onClose }) => {
                    return _jsx(AssignRolesDialog, { rowId: rowId, onClose: onClose });
                },
            },
            {
                label: 'Copy Roles from User',
                icon: _jsx(Copy, { className: "size-4" }),
                dialog: ({ rowId, onClose }) => {
                    return _jsx(CopyRolesFromUserDialog, { rowId: rowId, onClose: onClose });
                },
            },
        ];
        const columns = [
            {
                accessorKey: 'userName',
                meta: {
                    label: 'User',
                    sticky: 'left',
                },
                size: 280,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "userName", title: "User" });
                },
                cell: (props) => (_jsx(CompoundCell, { primary: "displayName", secondary: "email", icon: _jsx(User, { className: "size-3.5" }), iconBgClass: "bg-blue-500/10", iconClass: "text-blue-600 dark:text-blue-400", useTableOnEdit: true, ...props })),
            },
            {
                accessorKey: 'locationName',
                meta: {
                    label: 'Location',
                },
                size: 200,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "locationName", title: "Location" });
                },
                cell: (props) => (_jsx(CompoundCell, { primary: "locationName", icon: _jsx(MapPin, { className: "size-3.5" }), iconBgClass: "bg-emerald-500/10", iconClass: "text-emerald-600 dark:text-emerald-400", ...props })),
            },
            {
                accessorKey: 'locked',
                meta: {
                    label: 'Locked',
                },
                size: 90,
                header: (props) => {
                    return _jsx(HeaderCell, { ...props, type: "Boolean", store: store, accessorKey: "locked", title: "Locked" });
                },
                cell: (props) => _jsx(BooleanYesNoCell, { attributeCode: "locked", checkedAsNegative: true, ...props }),
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
                accessorKey: 'settings.theme',
                meta: {
                    label: 'Theme',
                },
                size: 200,
                header: (props) => {
                    return (_jsx(HeaderCell, { ...props, type: "Text", store: store, accessorKey: "settings.theme", title: "Theme", className: "justify-center" }));
                },
                cell: (props) => _jsx(SettingsCell, { ...props, attr: "theme", store: store }),
            },
            createActionsColumn(actions, { size: 80, title: 'Actions' }),
        ];
        return columns;
    }, [store]);
}
function SettingsCell({ attr, store, row, }) {
    const settings = useRowValue(store, row.id, 'settings') ?? {};
    const value = settings[attr];
    return (_jsx(Cell, { dataTip: value, attributeCode: `settings.${attr}`, store: store, rowId: row.id, className: "justify-center", children: _jsx("span", { className: "flex items-center gap-2", children: value === 'dark' ? _jsx(Moon, { className: "size-3.5 text-gray-500" }) : _jsx(Sun, { className: "size-3.5 text-gray-500" }) }) }));
}
//# sourceMappingURL=table-columns.js.map