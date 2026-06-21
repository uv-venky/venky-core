'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import DataTable from '../../components/core/page/table';
import useTable from '../../components/core/page/useTable';
import { rowSelectionColumnDef } from '../../components/core/table/table-cell';
import { PaginationSection } from '../../components/core/page/page-layout-template';
import { Popup } from '../../components/core/page/popup';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import Filters from '../../components/core/page/filters';
import { useSelectedRowIds } from '../../components/core/hooks/useStoreHooks';
export default function LOVDialog({ open, onOpenChange, store, tableColumns, smartSearchColumns, onSelect, title = 'Select Values', contentClassName, width = 800, height = 600, singleSelection = false, modal = true, }) {
    const table = useTable({
        store,
        tableColumns: [
            rowSelectionColumnDef({
                hideHeader: singleSelection,
            }),
            ...tableColumns,
        ],
    });
    const selectedIds = useSelectedRowIds(store);
    useEffect(() => {
        if (!open) {
            store.deSelectAll();
        }
        return () => {
            store.deSelectAll();
        };
    }, [store, open]);
    // Enforce single selection when enabled
    useEffect(() => {
        if (!singleSelection || !open) {
            return;
        }
        if (selectedIds.length > 1) {
            // Keep only the first selected row, deselect the rest
            selectedIds.slice(1).forEach((id) => {
                store.deSelectRow(id);
            });
        }
    }, [selectedIds, singleSelection, open, store]);
    const handleRowClick = (row) => {
        if (singleSelection) {
            // Deselect all other rows first, then select the clicked row
            const selectedIds = store.selectedRowIds();
            selectedIds.forEach((id) => {
                if (id !== row.id) {
                    store.deSelectRow(id);
                }
            });
            if (!row.getIsSelected()) {
                row.toggleSelected();
            }
        }
        else {
            row.toggleSelected();
        }
    };
    return (open && (_jsx(Popup, { onClose: () => onOpenChange(false), footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { onClick: () => {
                        const selected = store.selectedRowIds();
                        const rows = store.selectedRows();
                        onSelect(selected, rows);
                        onOpenChange(false);
                    }, children: "Select" })] }), title: title, width: width, height: height, contentClassName: cn('p-0', contentClassName), bodyClassName: "p-0", modal: modal, children: _jsxs("div", { className: "relative h-full flex-1 flex-col overflow-hidden", children: [_jsx("div", { className: "px-2 pb-2", children: _jsx(Filters, { border: "full", roundedCorners: true, store: store, table: table, columns: smartSearchColumns, pageId: "lov-dialog", itemId: "lov-dialog-filters" }) }), _jsx("div", { className: "relative flex h-[calc(100%-56px)] flex-1 rounded-md", children: _jsx(DataTable, { table: table, store: store, onRowClick: handleRowClick, smartSearchColumns: smartSearchColumns }) }), _jsx(PaginationSection, { table: table, store: store })] }) })));
}
//# sourceMappingURL=lov.js.map