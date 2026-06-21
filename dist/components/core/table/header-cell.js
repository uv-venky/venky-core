'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsHeaderFilterApplied, useIsHeaderFiltersHidden, useRowIds, useSelectedRowIds, useSortState, } from '../../../components/core/hooks/useStoreHooks';
import { cn } from '../../../lib/utils';
import { ArrowDown01, ArrowDownAZ, ArrowDownNarrowWide, ArrowUp10, ArrowUpDown, ArrowUpWideNarrow, ArrowUpZA, FunnelX, Loader2, } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import SortMenu from '../../../components/core/common/SortMenu';
import { Button } from '../../../components/ui/button';
import { assertExists } from '../../../components/core/utils/assert';
import { useCurrentStore } from '../../../components/core/page/RowIdProvider';
import { Checkbox } from '../../../components/ui/checkbox';
export function TableRowSelectionHeaderCell({ className, isDisabled, }) {
    const store = useCurrentStore();
    assertExists(store, 'Missing store in TableRowSelectionHeaderCell');
    const selectedIds = useSelectedRowIds(store);
    const rowIds = useRowIds(store);
    const selectableRowIds = useMemo(() => (isDisabled ? rowIds.filter((id) => !isDisabled(id)) : rowIds), [rowIds, isDisabled]);
    const isSelected = selectedIds.length > 0 && selectedIds.length === selectableRowIds.length;
    return (_jsx(Checkbox, { className: cn('mx-2 cursor-pointer justify-center', className), checked: isSelected, onCheckedChange: (checked) => {
            if (checked) {
                if (isDisabled) {
                    const ids = store.rowIds().filter((id) => !isDisabled?.(id));
                    store.selectRows(ids);
                }
                else {
                    store.selectAll();
                }
            }
            else {
                store.deSelectAll();
            }
        }, "aria-label": "Select all rows" }));
}
export default function HeaderCell({ store, title, accessorKey, type, className, isEditable, column, sortable = true, align, table, }) {
    const [sortState, sortPosition] = useSortState(store, accessorKey);
    const [isSorting, setIsSorting] = useState(false);
    const headerFiltersHidden = useIsHeaderFiltersHidden(store);
    const isApplied = useIsHeaderFilterApplied(store, accessorKey);
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    let sortIcon = _jsx(ArrowUpDown, {});
    if (sortState != null) {
        switch (type) {
            case 'YN':
            case 'TF':
            case 'Boolean':
                sortIcon = sortState > 0 ? _jsx(ArrowDownNarrowWide, {}) : _jsx(ArrowUpWideNarrow, {});
                break;
            case 'Number':
                sortIcon = sortState > 0 ? _jsx(ArrowDown01, {}) : _jsx(ArrowUp10, {});
                break;
            default:
                sortIcon = sortState > 0 ? _jsx(ArrowDownAZ, {}) : _jsx(ArrowUpZA, {});
                break;
        }
    }
    const handleSort = useCallback(async (newSortState) => {
        setIsSorting(true);
        try {
            await store.sort({
                [accessorKey]: newSortState ? (newSortState === 'ascending' ? 1 : -1) : undefined,
            });
        }
        finally {
            setIsSorting(false);
        }
    }, [store, accessorKey]);
    return (_jsxs("div", { className: cn('group/header relative flex h-full w-full items-center rounded-none p-0 px-2 hover:bg-transparent hover:text-table-header-foreground dark:hover:bg-transparent', {
            'justify-center': (!align && ['YN', 'TF', 'Boolean'].includes(type)) || align === 'center',
            'justify-end': (!align && type === 'Number') || align === 'right',
            'justify-between': (!align && !['YN', 'TF', 'Boolean', 'Number'].includes(type)) || align === 'left',
            'border-t-2 border-t-yellow-500 bg-yellow-50 dark:border-t-yellow-900 dark:bg-yellow-950': isEditable,
        }, className), children: [_jsx("span", { className: "truncate", children: title }), _jsxs("div", { className: "flex items-center", children: [isApplied && headerFiltersHidden && (_jsx(Button, { className: "text-blue-500 hover:text-blue-700", variant: "ghost", size: "icon", "data-tip": "Header Filter Applied. Click to view filters.", onClick: () => {
                            store.getState().hideHeaderFilters = false;
                            // store.clearHeaderFilter(accessorKey);
                            // store.applyHeaderFiltersIfChanged();
                        }, children: _jsx(FunnelX, {}) })), sortable && column.getCanSort() && (!column?.getIsResizing() || sortState != null || isSorting) && (_jsx(SortMenu, { sortDirection: sortState ? (sortState > 0 ? 'ascending' : 'descending') : undefined, onSort: handleSort, sortPosition: sortPosition, className: cn('mr-2 flex shrink-0 transition-all duration-200 hover:bg-table-header-accent [&[data-state=open]]:flex', {
                            'hidden group-hover/header:flex': sortState == null && !isSorting && !sortMenuOpen,
                        }), sortIcon: isSorting ? _jsx(Loader2, { className: "size-4 animate-spin" }) : sortIcon, store: store, open: sortMenuOpen, onOpenChange: setSortMenuOpen, disableHeaderFilters: table.options.meta?.disableHeaderFilters, columnId: accessorKey }))] })] }));
}
//# sourceMappingURL=header-cell.js.map