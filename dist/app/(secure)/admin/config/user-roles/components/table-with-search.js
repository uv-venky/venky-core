/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useTable from '../../../../../../components/core/page/useTable';
import { useEffect } from 'react';
import { UserRolesFilterBar } from './filter-bar';
import { UserRolesTable } from './table';
import useUserRolesTableColumns from '../hooks/table-columns';
import { Card } from '../../../../../../components/ui/card';
import { usePreQuery } from '../../../../../../components/core/hooks/useStoreHooks';
export default function UserRolesTableWithSearch({ roleCode, userName, store, }) {
    const tableColumns = useUserRolesTableColumns(store, { roleCode, userName });
    const table = useTable({
        store,
        tableColumns,
    });
    // always add roleCode and userName to the query
    usePreQuery(store, (query) => {
        query.match = {
            roleCode,
            userName,
        };
        return query;
    });
    useEffect(() => {
        store.clearSync();
        store.executeQuery({
            query: {
                match: {
                    // just to use the dependency... these are always added to the query by usePreQuery
                    // irrespective of where the executeQuery is called from e.g. from the filter bar or from the table
                    roleCode,
                    userName,
                },
            },
        });
    }, [store, roleCode, userName]);
    return (_jsxs("div", { className: "flex h-full w-full flex-col gap-2", children: [_jsx(UserRolesFilterBar, { store: store, table: table, pageId: "user-roles-page", itemId: "user-roles", roleCode: roleCode, userName: userName }), _jsx(Card, { className: "flex-1 overflow-hidden p-0", children: _jsx(UserRolesTable, { store: store, table: table }) })] }));
}
//# sourceMappingURL=table-with-search.js.map