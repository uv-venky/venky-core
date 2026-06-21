'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Table, Eye, Database, MoreVertical, Layers } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../../../../components/ui/dropdown-menu';
import { getErrorMessage, isErrorResponse } from '../../../../lib/core/common/error';
import { showError } from '../../common/Notification';
import { useLoadingControl } from '../../../../lib/core/client/loading-tracker';
import { cn } from '../../../../lib/utils';
export default function SchemaExplorer({ onTableDoubleClick, onAddTab }) {
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const { increment, decrement } = useLoadingControl();
    const fetchSchemas = useCallback(async () => {
        try {
            setLoading(true);
            increment();
            const response = await fetch('/api/sql/schemas');
            const data = await response.json();
            if (isErrorResponse(data)) {
                showError(data.message);
            }
            else {
                setSchemas(data.schemas);
            }
        }
        catch (err) {
            showError(`Failed to load schemas: ${getErrorMessage(err)}`);
        }
        finally {
            setLoading(false);
            decrement();
        }
    }, [increment, decrement]);
    useEffect(() => {
        fetchSchemas();
    }, [fetchSchemas]);
    const toggleNode = (node) => {
        if (node.type === 'schema' || node.type === 'table' || node.type === 'view') {
            node.expanded = !node.expanded;
            setSchemas([...schemas]);
        }
    };
    const handleDescribe = async (schemaName, tableName) => {
        try {
            const response = await fetch('/api/sql/describe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schema: schemaName,
                    table: tableName,
                }),
            });
            const data = await response.json();
            if (data.status === 'OK') {
                const columns = data.data.columns;
                const describeQuery = `-- Table Structure for ${schemaName}.${tableName}\n-- Generated on ${new Date().toLocaleString()}\n\n`;
                const columnInfo = columns
                    .map((col) => `-- ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}${col.column_default ? ` default: ${col.column_default}` : ''}`)
                    .join('\n');
                if (onAddTab) {
                    onAddTab(describeQuery + columnInfo, `${schemaName}.${tableName} - Structure`);
                }
            }
            else {
                console.error('Failed to describe table:', data.message);
            }
        }
        catch (error) {
            console.error('Error describing table:', error);
        }
    };
    const handleGenerateSelect = async (schemaName, tableName) => {
        try {
            const response = await fetch('/api/sql/describe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schema: schemaName,
                    table: tableName,
                }),
            });
            const data = await response.json();
            if (data.status === 'OK') {
                const columns = data.data.columns;
                const columnNames = columns.map((col) => col.column_name).join(', ');
                const selectQuery = `SELECT ${columnNames} FROM ${schemaName}.${tableName}`;
                if (onAddTab) {
                    onAddTab(selectQuery, `${schemaName}.${tableName} - Select All`);
                }
            }
            else {
                console.error('Failed to describe table:', data.message);
            }
        }
        catch (error) {
            console.error('Error generating select query:', error);
        }
    };
    const renderNode = (node, level = 0, parentSchema) => {
        const paddingLeft = level * 16;
        const currentSchema = node.type === 'schema' ? node.name : parentSchema;
        return (_jsxs("div", { style: { paddingLeft }, children: [_jsxs("div", { className: cn('group flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-all duration-150', node.type === 'schema' ? 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10' : 'hover:bg-muted/80'), children: [node.type === 'schema' && (_jsx("button", { type: "button", onClick: () => toggleNode(node), className: "mr-1.5 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", children: node.expanded ? _jsx(ChevronDown, { className: "h-3.5 w-3.5" }) : _jsx(ChevronRight, { className: "h-3.5 w-3.5" }) })), node.type === 'schema' && _jsx(Database, { className: "mr-1.5 h-4 w-4 text-cyan-600 dark:text-cyan-400" }), node.type === 'table' && _jsx(Table, { className: "mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" }), node.type === 'view' && _jsx(Eye, { className: "mr-1.5 h-3.5 w-3.5 text-violet-600 dark:text-violet-400" }), _jsx("span", { role: "button", className: cn('flex-1 truncate text-sm transition-colors', node.type === 'schema' ? 'font-medium' : 'text-muted-foreground group-hover:text-foreground'), onDoubleClick: () => {
                                if ((node.type === 'table' || node.type === 'view') && currentSchema) {
                                    onTableDoubleClick?.(currentSchema, node.name);
                                }
                            }, children: node.name }), (node.type === 'table' || node.type === 'view') && currentSchema && (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100", onClick: (e) => e.stopPropagation(), children: _jsx(MoreVertical, { className: "h-3.5 w-3.5" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => handleDescribe(currentSchema, node.name), children: "Describe" }), _jsx(DropdownMenuItem, { onClick: () => handleGenerateSelect(currentSchema, node.name), children: "Generate Select All Columns" })] })] }))] }), node.expanded && node.children && (_jsx("div", { className: "mt-0.5", children: node.children.map((child) => renderNode(child, level + 1, currentSchema)) }))] }, node.name));
    };
    if (loading) {
        return (_jsxs("div", { className: "flex h-full flex-col overflow-hidden", children: [_jsxs("div", { className: "relative flex h-12 shrink-0 items-center gap-3 border-b bg-muted/30 px-4", children: [_jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" }), _jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-teal-500/10", children: _jsx(Layers, { className: "h-4 w-4 text-cyan-600 dark:text-cyan-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: "Schema Explorer" }), _jsx("p", { className: "text-muted-foreground text-xs", children: "Loading..." })] })] }), _jsx("div", { className: "flex flex-1 items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [_jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" }), _jsx("span", { className: "text-xs", children: "Loading schemas..." })] }) })] }));
    }
    return (_jsxs("div", { className: "flex h-full flex-col overflow-hidden", children: [_jsxs("div", { className: "relative flex h-12 shrink-0 items-center gap-3 border-b bg-muted/30 px-4", children: [_jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" }), _jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-teal-500/10", children: _jsx(Layers, { className: "h-4 w-4 text-cyan-600 dark:text-cyan-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: "Schema Explorer" }), _jsxs("p", { className: "text-muted-foreground text-xs", children: [schemas.length, " schema", schemas.length !== 1 ? 's' : '', " available"] })] })] }), _jsx(ScrollArea, { className: "flex-1 select-none overflow-hidden", children: _jsx("div", { className: "p-2", children: schemas.map((schema) => renderNode(schema)) }) })] }));
}
//# sourceMappingURL=SchemaExplorer.js.map