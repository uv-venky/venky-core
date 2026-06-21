import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) 2024-present VENKY Corp. */
import { Button } from '../../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../../../components/ui/dropdown-menu';
import { cn } from '../../../lib/utils';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, FunnelPlus, FunnelX, Loader2, X } from 'lucide-react';
import { memo, useState } from 'react';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import { useIsHeaderFiltersHidden } from '../../../components/core/hooks/useStoreHooks';
function SortMenu(props) {
    // store will be undefined when used inside pivot table header
    // assertExists(props.store, 'Store not found');
    useWhyDidYouUpdate('SortMenu', props);
    const { onSort, sortDirection, className, iconClassName, sortIcon, store, open, onOpenChange, disableHeaderFilters, sortPosition, columnId, } = props;
    const [isSorting, setIsSorting] = useState(false);
    const headerFiltersHidden = useIsHeaderFiltersHidden(store);
    return (_jsxs(DropdownMenu, { open: open, onOpenChange: onOpenChange, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: isSorting ? (_jsx(Loader2, { className: "mx-2 size-4 animate-spin" })) : (_jsx(SortIcon, { sortDirection: sortDirection, sortPosition: sortPosition, className: className, iconClassName: iconClassName, sortIcon: sortIcon, columnId: columnId })) }), open && (_jsxs(DropdownMenuContent, { children: [_jsxs(DropdownMenuItem, { className: "cursor-pointer", disabled: sortDirection === 'ascending', onClick: () => {
                            setIsSorting(true);
                            onSort('ascending').finally(() => setIsSorting(false));
                        }, "data-testid": columnId ? `sort-ascending-${columnId}` : 'sort-ascending', children: [_jsx(ArrowUpIcon, { className: iconClassName }), " Order Ascending"] }), _jsxs(DropdownMenuItem, { className: "cursor-pointer", disabled: sortDirection === 'descending', onClick: () => {
                            setIsSorting(true);
                            onSort('descending').finally(() => setIsSorting(false));
                        }, "data-testid": columnId ? `sort-descending-${columnId}` : 'sort-descending', children: [_jsx(ArrowDownIcon, { className: iconClassName }), " Order Descending"] }), _jsxs(DropdownMenuItem, { className: "cursor-pointer", disabled: sortDirection == null, onClick: () => {
                            setIsSorting(true);
                            onSort().finally(() => setIsSorting(false));
                        }, "data-testid": columnId ? `sort-remove-${columnId}` : 'sort-remove', children: [_jsx(X, {}), " Remove Order"] }), !disableHeaderFilters && (_jsxs(DropdownMenuItem, { className: "cursor-pointer", onClick: () => {
                            if (store) {
                                store.getState().hideHeaderFilters = !(store.getState().hideHeaderFilters ?? false);
                            }
                        }, "data-testid": columnId ? `sort-toggle-header-filters-${columnId}` : 'sort-toggle-header-filters', children: [headerFiltersHidden ? _jsx(FunnelPlus, {}) : _jsx(FunnelX, {}), " ", headerFiltersHidden ? 'Show' : 'Hide', " Filters"] }))] }))] }));
}
function SortIcon({ sortDirection, className, iconClassName, sortIcon, sortPosition, columnId, ...props }) {
    let description = 'Unsorted';
    let icon = _jsx(ArrowUpDownIcon, { className: iconClassName });
    if (sortDirection != null) {
        description = `sorted ${sortDirection === 'ascending' ? 'ascending' : 'descending'} ${sortPosition ? `at position ${sortPosition}` : ''}`;
        icon =
            sortDirection === 'ascending' ? (_jsx(ArrowUpIcon, { className: iconClassName })) : (_jsx(ArrowDownIcon, { className: iconClassName }));
    }
    const testId = columnId ? `sort-trigger-${columnId}` : 'sort-trigger';
    return (_jsx(Button, { "data-testid": testId, className: cn('cursor-pointer', className), variant: "ghost", size: "icon", "data-tip": description, ...props, children: sortIcon ?? icon }));
}
export default memo(SortMenu);
//# sourceMappingURL=SortMenu.js.map