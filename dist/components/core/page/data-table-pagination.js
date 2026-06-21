/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { PAGE_SIZE_OPTIONS } from '../../../components/core/page/table-column-preferences';
import { useStoreOffset, useStoreRowCount } from '../../../components/core/hooks/useStoreHooks';
import { cn } from '../../../lib/utils';
function PaginationButton({ onClick, disabled, label, icon, testId, }) {
    const [busy, setBusy] = useState(false);
    return (_jsx(Button, { "aria-label": label, variant: "outline", className: cn('hidden size-8 p-0 lg:flex', (disabled || busy) && 'cursor-not-allowed'), onClick: async () => {
            try {
                setBusy(true);
                await onClick();
            }
            finally {
                setBusy(false);
            }
        }, disabled: disabled || busy, "data-tip": label, "data-testid": testId, children: busy ? _jsx(Loader2, { className: "size-4 animate-spin", "aria-hidden": "true" }) : icon }));
}
function DataTablePagination({ table, pageSizeOptions = PAGE_SIZE_OPTIONS, store, hideRowsPerPageSelector = false, }) {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const _rowCount = useStoreRowCount(store);
    const [_, forceUpdate] = useState(0);
    const [busy, setBusy] = useState(false);
    const offset = useStoreOffset(store);
    useEffect(() => {
        // on sort or filter, the offset is reset to 0, so we need to reset the page index to 0
        if (offset === 0) {
            table.setPageIndex(0);
            forceUpdate((prev) => prev + 1);
        }
        else {
            const page = Math.floor(offset / table.getState().pagination.pageSize);
            if (page !== table.getState().pagination.pageIndex) {
                table.setPageIndex(page);
                forceUpdate((prev) => prev + 1);
            }
        }
    }, [offset, table]);
    return (_jsx("div", { className: "flex flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8", children: _jsxs("div", { className: "flex select-none flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8", children: [table.getPageCount() > 0 && (_jsxs(_Fragment, { children: [!hideRowsPerPageSelector && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("p", { className: "whitespace-nowrap font-medium text-sm", children: "Rows per page" }), _jsxs(Select, { value: `${table.getState().pagination.pageSize}`, onValueChange: async (value) => {
                                        try {
                                            setBusy(true);
                                            table.setPageIndex(0);
                                            table.setPageSize(Number(value));
                                            if (store) {
                                                await store.setLimit(Number(value));
                                            }
                                        }
                                        finally {
                                            setBusy(false);
                                        }
                                    }, children: [_jsx(SelectTrigger, { disabled: busy, className: "h-8 w-[4.5rem]", "data-testid": "pagination-rows-per-page-trigger", children: busy ? (_jsx(Loader2, { className: "size-4 animate-spin", "aria-hidden": "true" })) : (_jsx(SelectValue, { placeholder: table.getState().pagination.pageSize })) }), _jsx(SelectContent, { side: "top", children: pageSizeOptions.map((pageSize) => (_jsx(SelectItem, { value: `${pageSize}`, "data-testid": `pagination-rows-per-page-option-${pageSize}`, children: pageSize }, pageSize))) })] })] })), _jsxs("div", { className: "flex items-center justify-center font-medium text-sm", "data-testid": "pagination-page-info", children: ["Page ", table.getState().pagination.pageIndex + 1, " of ", table.getPageCount()] })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(PaginationButton, { onClick: async () => {
                                table.setPageIndex(0);
                                if (store) {
                                    await store.goToPage(0);
                                }
                                forceUpdate((prev) => prev + 1);
                            }, disabled: busy || !table.getCanPreviousPage(), label: "Go to first page", icon: _jsx(ChevronsLeft, { className: "size-4", "aria-hidden": "true" }), testId: "pagination-first-page" }), _jsx(PaginationButton, { label: "Go to previous page", onClick: async () => {
                                table.previousPage();
                                if (store) {
                                    await store.goToPage(pageIndex - 1);
                                }
                                forceUpdate((prev) => prev + 1);
                            }, disabled: busy || !table.getCanPreviousPage(), icon: _jsx(ChevronLeft, { className: "size-4", "aria-hidden": "true" }), testId: "pagination-previous-page" }), _jsx(PaginationButton, { label: "Go to next page", icon: _jsx(ChevronRight, { className: "size-4", "aria-hidden": "true" }), onClick: async () => {
                                table.nextPage();
                                if (store) {
                                    await store.goToPage(pageIndex + 1);
                                }
                                forceUpdate((prev) => prev + 1);
                            }, disabled: busy || !table.getCanNextPage(), testId: "pagination-next-page" }), _jsx(PaginationButton, { label: "Go to last page", onClick: async () => {
                                table.setPageIndex(pageCount - 1);
                                if (store) {
                                    await store.goToPage(pageCount - 1);
                                }
                                forceUpdate((prev) => prev + 1);
                            }, disabled: busy || !table.getCanNextPage(), icon: _jsx(ChevronsRight, { className: "size-4", "aria-hidden": "true" }), testId: "pagination-last-page" })] })] }) }));
}
export default memo(DataTablePagination);
//# sourceMappingURL=data-table-pagination.js.map