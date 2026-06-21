/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '../../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '../../../components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useState, Fragment } from 'react';
const isTableActionWithRender = (action) => {
    return 'render' in action;
};
export function ActionsColumnCell({ actions, rowId, className, table, store }) {
    const [openDialogFn, setOpenDialogFn] = useState(null);
    const filteredActions = actions.filter((action) => {
        if ('render' in action) {
            return true;
        }
        if (typeof action.disabled === 'function') {
            return !action.disabled(rowId);
        }
        return !action.disabled;
    });
    if (filteredActions.length === 0) {
        return _jsx("div", { className: cn('flex items-center justify-center px-2', className) });
    }
    // Separate actions into icon actions and dropdown actions
    const iconActions = filteredActions.filter((action) => action.showAsIcon === true);
    const dropdownActions = filteredActions.filter((action) => action.showAsIcon !== true);
    const handleActionClick = async (action, e) => {
        e.stopPropagation();
        await store.setCurrentRowId(rowId);
        const { dialog, onClick } = action;
        if (dialog) {
            setOpenDialogFn(() => dialog);
        }
        else if (onClick) {
            onClick({ rowId, table });
        }
    };
    // Render icon actions as buttons and dropdown actions in menu
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cn('flex items-center justify-center gap-1 px-2', className), children: [iconActions.map((action) => {
                        if (isTableActionWithRender(action)) {
                            return (_jsx(Fragment, { children: action.render({ rowId, table, asIconButton: true, store }) }, "action-render-icon"));
                        }
                        const isDisabled = typeof action.disabled === 'function' ? action.disabled(rowId) : (action.disabled ?? false);
                        const actionLabel = action.label.toLowerCase().replace(/\s+/g, '-');
                        return (_jsx(Button, { variant: "ghost", size: "icon", className: cn('h-8 w-8', action.variant === 'destructive' && '[&_svg]:text-red-500'), onClick: (e) => handleActionClick(action, e), disabled: isDisabled, "data-tip": action.tooltip ?? action.label, "data-testid": `table-action-icon-${actionLabel}-${rowId}`, children: action.icon }, action.label));
                    }), dropdownActions.length > 0 && (_jsxs(DropdownMenu, { onOpenChange: (open) => open && store.setCurrentRowId(rowId), children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", "data-tip": "Actions", "data-testid": `table-actions-menu-trigger-${rowId}`, children: _jsx(MoreHorizontal, { className: "size-4" }) }) }), _jsx(DropdownMenuContent, { align: "end", children: dropdownActions.map((action, index) => {
                                    if (isTableActionWithRender(action)) {
                                        return (_jsx(Fragment, { children: action.render({ rowId, table, asIconButton: false, store }) }, "action-render-dropdown"));
                                    }
                                    const isDisabled = typeof action.disabled === 'function' ? action.disabled(rowId) : (action.disabled ?? false);
                                    const showSeparator = action.separator && index > 0;
                                    const actionLabel = action.label.toLowerCase().replace(/\s+/g, '-');
                                    return (_jsxs(Fragment, { children: [showSeparator && _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { variant: action.variant, disabled: isDisabled, onClick: (e) => handleActionClick(action, e), className: "flex items-center gap-2", "data-tip": action.tooltip, "data-testid": `table-action-item-${actionLabel}-${rowId}`, children: [_jsx("span", { className: cn('flex items-center', action.variant === 'destructive' && '[&_svg]:text-red-500!'), children: action.icon }), _jsx("span", { className: action.variant === 'destructive' ? 'text-red-500' : '', children: action.label })] })] }, action.label));
                                }) })] }))] }), openDialogFn?.({ rowId, table, onClose: () => setOpenDialogFn(null) })] }));
}
//# sourceMappingURL=actions-column.js.map