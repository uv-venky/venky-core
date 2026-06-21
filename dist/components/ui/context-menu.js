'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';
import { cn } from '../../lib/utils';
function ContextMenu({ ...props }) {
    return _jsx(ContextMenuPrimitive.Root, { "data-slot": "context-menu", ...props });
}
function ContextMenuTrigger({ ...props }) {
    return _jsx(ContextMenuPrimitive.Trigger, { "data-slot": "context-menu-trigger", ...props });
}
function ContextMenuGroup({ ...props }) {
    return _jsx(ContextMenuPrimitive.Group, { "data-slot": "context-menu-group", ...props });
}
function ContextMenuPortal({ ...props }) {
    return _jsx(ContextMenuPrimitive.Portal, { "data-slot": "context-menu-portal", ...props });
}
function ContextMenuSub({ ...props }) {
    return _jsx(ContextMenuPrimitive.Sub, { "data-slot": "context-menu-sub", ...props });
}
function ContextMenuRadioGroup({ ...props }) {
    return _jsx(ContextMenuPrimitive.RadioGroup, { "data-slot": "context-menu-radio-group", ...props });
}
function ContextMenuSubTrigger({ className, inset, children, ...props }) {
    return (_jsxs(ContextMenuPrimitive.SubTrigger, { "data-slot": "context-menu-sub-trigger", "data-inset": inset, className: cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[inset]:pl-8 data-[state=open]:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0", className), ...props, children: [children, _jsx(ChevronRightIcon, { className: "ml-auto" })] }));
}
function ContextMenuSubContent({ className, ...props }) {
    return (_jsx(ContextMenuPrimitive.SubContent, { "data-slot": "context-menu-sub-content", className: cn('data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in', className), ...props }));
}
function ContextMenuContent({ className, ...props }) {
    return (_jsx(ContextMenuPrimitive.Portal, { children: _jsx(ContextMenuPrimitive.Content, { "data-slot": "context-menu-content", className: cn('data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in', className), ...props }) }));
}
function ContextMenuItem({ className, inset, variant = 'default', ...props }) {
    return (_jsx(ContextMenuPrimitive.Item, { "data-slot": "context-menu-item", "data-inset": inset, "data-variant": variant, className: cn("data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0", className), ...props }));
}
function ContextMenuCheckboxItem({ className, children, checked, ...props }) {
    return (_jsxs(ContextMenuPrimitive.CheckboxItem, { "data-slot": "context-menu-checkbox-item", className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className), checked: checked, ...props, children: [_jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: _jsx(ContextMenuPrimitive.ItemIndicator, { children: _jsx(CheckIcon, { className: "size-4" }) }) }), children] }));
}
function ContextMenuRadioItem({ className, children, ...props }) {
    return (_jsxs(ContextMenuPrimitive.RadioItem, { "data-slot": "context-menu-radio-item", className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className), ...props, children: [_jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: _jsx(ContextMenuPrimitive.ItemIndicator, { children: _jsx(CircleIcon, { className: "size-2 fill-current" }) }) }), children] }));
}
function ContextMenuLabel({ className, inset, ...props }) {
    return (_jsx(ContextMenuPrimitive.Label, { "data-slot": "context-menu-label", "data-inset": inset, className: cn('px-2 py-1.5 font-medium text-foreground text-sm data-[inset]:pl-8', className), ...props }));
}
function ContextMenuSeparator({ className, ...props }) {
    return (_jsx(ContextMenuPrimitive.Separator, { "data-slot": "context-menu-separator", className: cn('-mx-1 my-1 h-px bg-border', className), ...props }));
}
function ContextMenuShortcut({ className, ...props }) {
    return (_jsx("span", { "data-slot": "context-menu-shortcut", className: cn('ml-auto text-muted-foreground text-xs tracking-widest', className), ...props }));
}
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup, };
//# sourceMappingURL=context-menu.js.map