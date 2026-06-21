'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../../../lib/core/client/store';
import useTable from '../../../../components/core/page/useTable';
import DataTable from '../../../../components/core/page/table';
import HeaderCell from '../../../../components/core/table/header-cell';
import TableCell from '../../../../components/core/table/table-cell';
import { startCase } from 'lodash-es';
import { DefaultAttribute } from '../../../../lib/core/common/ds/types/Defaults';
export default function QueryResults({ result, forSQLBrowser = true }) {
    const store = useStore({
        page: 'sql-browser',
        displayName: 'Query Results',
        datasourceId: 'query-results',
        alias: 'query-results',
        limit: 1000,
        transient: true,
        localStore: true,
        autoQuery: false,
        filterLocally: true,
        ignorePKDuplicate: true,
    });
    useEffect(() => {
        if (result.rows.length > 0) {
            const attributes = result.columns.map((column) => {
                const attribute = {
                    ...DefaultAttribute,
                    name: column.name,
                    type: column.type,
                    code: column.name,
                };
                return attribute;
            });
            store.setAttributes(attributes);
            store.clearSync();
            store.processServerResponse(result.rows);
        }
    }, [result.rows, result.columns, store]);
    const tableColumns = useMemo(() => {
        return result.columns.map((column) => ({
            accessorKey: column.name,
            meta: {
                label: startCase(column.name),
            },
            size: 200,
            header: (props) => {
                return (_jsx(HeaderCell, { ...props, type: column.type, store: store, accessorKey: column.name, title: startCase(column.name) }));
            },
            cell: (props) => _jsx(TableCell, { type: column.type, attributeCode: column.name, ...props }),
        }));
    }, [result.columns, store]);
    const table = useTable({
        store,
        tableColumns,
        disableHeaderFilters: true,
    });
    const exportToCSV = () => {
        if (!result.columns.length || !result.rows.length)
            return;
        const csvContent = [
            result.columns.map((col) => col.name).join(','),
            ...result.rows.map((row) => result.columns
                .map((col) => {
                const cellStr = String(row[col.name] ?? '');
                return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
            })
                .join(',')),
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (result.error) {
        return (_jsx("div", { className: "border-t bg-muted/30", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2 text-red-600", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Query Error" })] }), _jsx("div", { className: "rounded border bg-red-50 p-3 text-red-600 text-sm", children: result.error })] }) }));
    }
    return (_jsxs("div", { className: "flex h-full flex-1 flex-col", children: [forSQLBrowser && (_jsxs("div", { className: "flex items-center justify-between border-b bg-background px-4 py-2", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium text-sm", children: "Query executed successfully" })] }), _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { className: "text-xs", children: [result.executionTime.toFixed(2), "ms"] })] }), _jsxs("span", { className: "text-muted-foreground text-xs", children: [result.rowCount, " row", result.rowCount !== 1 ? 's' : ''] })] }), result.rows.length > 0 && (_jsxs(Button, { variant: "outline", size: "sm", onClick: exportToCSV, children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export CSV"] }))] })), result.rows.length > 0 ? (_jsx("div", { className: "relative flex flex-1 flex-col", children: _jsx(DataTable, { table: table, store: store, variant: "default", emptyStateTitle: "No results returned", emptyStateSubtitle: "" }) })) : (_jsx("div", { className: "p-4 text-center text-muted-foreground", children: _jsx("div", { className: "text-sm", children: "No results returned" }) }))] }));
}
//# sourceMappingURL=QueryResults.js.map