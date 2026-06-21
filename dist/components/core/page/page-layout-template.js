/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useIsStoreBusy, useStoreRowCount } from '../../../components/core/hooks/useStoreHooks';
import { Button } from '../../../components/ui/button';
import { Loader2, PlusIcon } from 'lucide-react';
import { Suspense, useState, useCallback } from 'react';
import Suspended from '../../../components/core/common/Suspended';
import ColumnViewsDialog from '../../../components/core/page/column-views-dialog';
import StoreExportDropdown from '../../../components/core/StoreExportDropdown';
import { EditPopup } from '../../../components/core/page/edit-popup';
import { EditSheet } from '../../../components/core/page/edit-sheet';
import Filters from '../../../components/core/page/filters';
import PageLayout from '../../../components/core/page/PageLayout';
import DataTable from '../../../components/core/page/table';
import useTable from '../../../components/core/page/useTable';
import DataTablePagination from '../../../components/core/page/data-table-pagination';
import { useAppContext } from '../../../components/sidebar/app-provider';
import { cn } from '../../../lib/utils';
import { deferAutoQueryForSavedSearches } from '../../../lib/core/client/store';
export default function PageLayoutTemplate({ store, filterStartContent, filterEndContent, hideColumnsMenu = false, hideFilters = false, hidePagination = false, smartSearchColumns, tableColumns, pageId, itemId, title, subTitle, icon, editForm, editFormFooterContent, getDefaultRow, addNewButtonText = 'Add New', toolbarContent, loadingRows, searchOnBlur, defaultVisibleColumnOrder, rowClickToEdit, popupWidth, popupHeight, popupBodyClassName, editFormLayout = 'sheet', disableHeaderFilters: disableHeaderFiltersProp, updateFilters, stickyFilters, allowDelete, handleSave, onSaveSuccess, keepOpen, showExportButton = false, exportFilename = 'export', exportIncludeMetadata = false, editFormSubTitle, tableVariant, enableNaturalLanguageSearch, nlPlaceholder, statsSection, }) {
    const [open, setOpen] = useState(false);
    const { DISABLE_HEADER_FILTERS_DEFAULT } = useAppContext();
    const disableHeaderFilters = disableHeaderFiltersProp ?? DISABLE_HEADER_FILTERS_DEFAULT;
    const table = useTable({
        store,
        tableColumns,
        defaultVisibleColumnOrder,
        disableHeaderFilters,
        initialPreferences: tableVariant ? { tableVariant } : undefined,
    });
    // Defer initial queries before Filters mount (Filters is inside Suspense; defer must run synchronously).
    if (!store.initialQueryFired() && !hideFilters) {
        deferAutoQueryForSavedSearches(store);
    }
    return (_jsx(PageLayout, { title: title, subTitle: subTitle, icon: icon, toolbar: _jsxs(_Fragment, { children: [editForm && (_jsxs("div", { className: "flex shrink-0 items-center gap-4", children: [_jsxs(Button, { variant: "default", onClick: async () => {
                                await store?.createNew({ partialRecord: getDefaultRow?.() });
                                setOpen(true);
                            }, "data-testid": "add-new-button", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), addNewButtonText] }), editFormLayout === 'popup' ? (open && (_jsx(EditPopup, { title: title, store: store, onClose: () => setOpen(false), width: popupWidth, height: popupHeight, bodyClassName: popupBodyClassName, footerContent: editFormFooterContent, allowDelete: allowDelete, handleSave: handleSave, onSaveSuccess: onSaveSuccess, description: editFormSubTitle, children: editForm }))) : (_jsx(EditSheet, { title: title, store: store, open: open, onClose: () => setOpen(false), width: popupWidth, allowDelete: allowDelete, handleSave: handleSave, onSaveSuccess: onSaveSuccess, keepOpen: keepOpen, bodyClassName: popupBodyClassName, footerContent: editFormFooterContent, description: editFormSubTitle, children: editForm }))] })), toolbarContent] }), statsSection: statsSection, filterSection: _jsxs("div", { className: "flex flex-1 shrink-0 items-start gap-2", children: [filterStartContent, !hideFilters && (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "Filters" }), children: _jsx(Filters, { border: "none", store: store, table: table, columns: smartSearchColumns, pageId: pageId, itemId: itemId, searchOnBlur: searchOnBlur, updateFilters: updateFilters, stickyFilters: stickyFilters, enableNaturalLanguageSearch: enableNaturalLanguageSearch, nlPlaceholder: nlPlaceholder }) })), !hideColumnsMenu && (_jsx(ColumnViewsDialog, { table: table, variant: "ghost", iconOnly: true, className: cn('mt-1', showExportButton ? '' : 'mr-2'), defaultPreferences: tableVariant ? { tableVariant } : undefined })), showExportButton && (_jsx(StoreExportDropdown, { store: store, table: table, filename: exportFilename, includeMetadata: exportIncludeMetadata, className: "mt-1 mr-2" })), filterEndContent] }), mainSection: _jsx(MainSection, { table: table, hidePagination: hidePagination, store: store, title: title, editForm: editForm, editFormFooterContent: editFormFooterContent, editFormSubTitle: editFormSubTitle, smartSearchColumns: smartSearchColumns, loadingRows: loadingRows, rowClickToEdit: rowClickToEdit, popupWidth: popupWidth, popupHeight: popupHeight, popupBodyClassName: popupBodyClassName, editFormLayout: editFormLayout, allowDelete: allowDelete, handleSave: handleSave, onSaveSuccess: onSaveSuccess, keepOpen: keepOpen }) }));
}
function MainSection({ table, hidePagination, store, title, editForm, editFormFooterContent, editFormSubTitle, smartSearchColumns, loadingRows, rowClickToEdit = false, popupWidth, popupHeight, popupBodyClassName, editFormLayout = 'sheet', allowDelete, handleSave, onSaveSuccess, keepOpen, }) {
    const [open, setOpen] = useState(false);
    const onRowClick = useCallback(() => {
        setOpen(true);
    }, []);
    const onEdit = useCallback(async (rowId) => {
        const accepted = await store.setCurrentRowId(rowId);
        if (!accepted)
            return;
        setOpen(true);
    }, [store, setOpen]);
    return (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "MainSection" }), children: _jsxs("div", { className: "flex h-full w-full flex-col", children: [_jsxs("div", { className: "relative flex-1 rounded-md", children: [_jsx(DataTable, { table: table, onRowClick: editForm && rowClickToEdit ? onRowClick : undefined, onEdit: editForm ? onEdit : undefined, store: store, smartSearchColumns: smartSearchColumns, loadingRows: loadingRows }), editForm &&
                            (editFormLayout === 'popup' ? (open && (_jsx(EditPopup, { title: title, store: store, onClose: () => setOpen(false), width: popupWidth, height: popupHeight, bodyClassName: popupBodyClassName, footerContent: editFormFooterContent, allowDelete: allowDelete, handleSave: handleSave, onSaveSuccess: onSaveSuccess, description: editFormSubTitle, children: editForm }))) : (_jsx(EditSheet, { title: title, store: store, open: open, onClose: () => setOpen(false), width: popupWidth, allowDelete: allowDelete, handleSave: handleSave, onSaveSuccess: onSaveSuccess, keepOpen: keepOpen, bodyClassName: popupBodyClassName, footerContent: editFormFooterContent, description: editFormSubTitle, children: editForm })))] }), !hidePagination && _jsx(PaginationSection, { table: table, store: store })] }) }));
}
export function PaginationSection({ table, store, hideRowsPerPageSelector = false, }) {
    const rowCount = useStoreRowCount(store);
    const isStoreBusy = useIsStoreBusy(store);
    return (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "PaginationSection" }), children: _jsxs("div", { className: "flex shrink-0 select-none items-center justify-end space-x-2 p-2", children: [isStoreBusy ? (_jsx("div", { className: "flex-1", children: _jsx(Loader2, { className: "size-4 animate-spin" }) })) : (rowCount != null && _jsxs("div", { className: "flex-1 text-muted-foreground text-sm", children: [rowCount, " row(s)"] })), _jsx("div", { className: "space-x-2", children: _jsx(DataTablePagination, { table: table, store: store, hideRowsPerPageSelector: hideRowsPerPageSelector }) })] }) }));
}
//# sourceMappingURL=page-layout-template.js.map