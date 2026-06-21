/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { PlusIcon, SaveAll, Trash } from 'lucide-react';
import { Suspense, useState } from 'react';
import clientLogger from '../../../lib/core/client/client-logger';
import Suspended from '../../../components/core/common/Suspended';
import ColumnViewsDialog from '../../../components/core/page/column-views-dialog';
import { getErrorMessage } from '../../../lib/core/common/error';
import { showError } from '../../../components/core/common/Notification';
import Filters from '../../../components/core/page/filters';
import PageLayout from '../../../components/core/page/PageLayout';
import DataTable from '../../../components/core/page/table';
import useTable from '../../../components/core/page/useTable';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../../components/ui/resizable';
import { EditRecordForm } from '../../../components/core/page/edit-record-form';
import { PaginationSection } from './page-layout-template';
export default function PageWithFormTemplate({ store, filterStartContent, filterEndContent, hideColumnsMenu = false, hideFilters = false, hidePagination = false, smartSearchColumns, tableColumns, pageId, itemId, title, subTitle, icon, editForm, getDefaultRow, addNewButtonText = 'Add New', editFormProportion = 50, headerEndContent, }) {
    const [isSaving, setIsSaving] = useState(false);
    const table = useTable({
        store,
        tableColumns,
    });
    return (_jsx(PageLayout, { title: title, subTitle: subTitle, icon: icon, toolbar: editForm && (_jsxs("div", { className: "flex shrink-0 items-center gap-4", children: [_jsxs(Button, { variant: "outline", onClick: async () => {
                        await store?.createNew({ partialRecord: getDefaultRow?.() });
                    }, "data-testid": "add-new-button", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), addNewButtonText] }), _jsxs(Button, { type: "submit", disabled: isSaving, onClick: async () => {
                        setIsSaving(true);
                        try {
                            await store?.save();
                        }
                        catch (error) {
                            showError(`Unexpected error while saving data: ${getErrorMessage(error)}`);
                            clientLogger.error({ message: 'save error', error });
                        }
                        finally {
                            setIsSaving(false);
                        }
                    }, "data-testid": "save-changes-button", children: [_jsx(SaveAll, { className: "h-4 w-4" }), isSaving ? 'Saving...' : 'Save changes'] }), _jsxs(Button, { type: "button", variant: "destructive", onClick: async () => {
                        try {
                            const id = store?.currentRowId();
                            if (id) {
                                if (store.isCurrentRowFromDB()) {
                                    store?.deleteRow(id);
                                    store?.save();
                                }
                                else {
                                    store?.deleteRow(id);
                                }
                            }
                        }
                        catch (error) {
                            showError(`Unexpected error while deleting data: ${getErrorMessage(error)}`);
                            clientLogger.error({ message: 'delete error', error });
                        }
                    }, "data-testid": "delete-record-button", children: [_jsx(Trash, { className: "h-4 w-4" }), 'Delete record'] }), headerEndContent] })), filterSection: _jsxs("div", { className: "flex flex-1 shrink-0 items-center gap-2", children: [filterStartContent, !hideFilters && (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "Filters" }), children: _jsx(Filters, { border: "none", store: store, table: table, columns: smartSearchColumns, pageId: pageId, itemId: itemId }) })), !hideColumnsMenu && _jsx(ColumnViewsDialog, { table: table, variant: "ghost" }), filterEndContent] }), mainSection: _jsxs(ResizablePanelGroup, { direction: "horizontal", className: "flex-1 overflow-hidden", children: [_jsx(ResizablePanel, { defaultSize: `${100 - editFormProportion}%`, minSize: "35%", className: "relative overflow-hidden", children: _jsx(MainSection, { table: table, hidePagination: hidePagination, store: store, editForm: editForm, smartSearchColumns: smartSearchColumns }) }), _jsx(ResizableHandle, { withHandle: true }), _jsx(ResizablePanel, { defaultSize: `${editFormProportion}%`, minSize: "40%", className: "overflow-hidden", children: editForm && (_jsx(EditRecordForm, { title: title, store: store, children: editForm })) })] }) }));
}
function MainSection({ table, hidePagination, store, editForm, smartSearchColumns, }) {
    const onRowClick = () => { };
    return (_jsx(Suspense, { fallback: _jsx(Suspended, { name: "MainSection" }), children: _jsxs("div", { className: "flex h-full w-full flex-col", children: [_jsx("div", { className: "relative flex-1 rounded-md", children: _jsx(DataTable, { table: table, onRowClick: editForm ? onRowClick : undefined, store: store, smartSearchColumns: smartSearchColumns }) }), !hidePagination && _jsx(PaginationSection, { table: table, store: store })] }) }));
}
//# sourceMappingURL=page-with-form-template.js.map