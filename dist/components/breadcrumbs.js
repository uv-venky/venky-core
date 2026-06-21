'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from '../components/ui/breadcrumb';
import { Button } from '../components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from '../components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../components/ui/dropdown-menu';
import * as React from 'react';
import { proxy, useSnapshot } from 'valtio';
import { useMediaQuery } from './core/hooks/useMediaQuery';
import { useRouter } from './core/hooks/useRouter';
import { Fragment } from 'react';
import clientLogger from '../lib/core/client/client-logger';
export const breadcrumbsState = proxy({
    breadcrumbs: [],
});
const ITEMS_TO_DISPLAY = 3;
export default function Breadcrumbs() {
    const { breadcrumbs } = useSnapshot(breadcrumbsState);
    const [open, setOpen] = React.useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const router = useRouter();
    if (breadcrumbs.length === 0) {
        return null;
    }
    const lastItems = breadcrumbs.slice(-ITEMS_TO_DISPLAY + 1);
    return (_jsx(Breadcrumb, { children: _jsx("div", { className: "flex items-center gap-2", children: _jsxs(BreadcrumbList, { className: "flex-nowrap", children: [lastItems.length < breadcrumbs.length && (_jsxs(_Fragment, { children: [_jsx(BreadcrumbItem, { children: _jsx(BreadcrumbLink, { className: "cursor-pointer whitespace-nowrap hover:text-sidebar-foreground", onClick: () => {
                                        breadcrumbsState.breadcrumbs = [];
                                        clientLogger.logActivity({
                                            eventType: 'Breadcrumb Click',
                                            eventId: breadcrumbs[0].title ?? 'unknown',
                                            metadata: {
                                                href: breadcrumbs[0].href ?? '',
                                                size: breadcrumbs.length,
                                                from: 'home',
                                            },
                                            pageUrl: window.location.pathname,
                                        });
                                        router.push(breadcrumbs[0].href ?? '');
                                    }, children: breadcrumbs[0].title }) }), _jsx(BreadcrumbSeparator, {})] })), breadcrumbs.length > ITEMS_TO_DISPLAY ? (_jsxs(_Fragment, { children: [_jsx(BreadcrumbItem, { className: "hover:text-sidebar-foreground", children: isDesktop ? (_jsxs(DropdownMenu, { open: open, onOpenChange: setOpen, children: [_jsx(DropdownMenuTrigger, { className: "flex cursor-pointer items-center gap-1", "aria-label": "Toggle menu", children: _jsx(BreadcrumbEllipsis, { className: "h-4 w-4" }) }), _jsx(DropdownMenuContent, { align: "start", children: breadcrumbs.slice(1, -ITEMS_TO_DISPLAY + 1).map(({ href, title }) => (_jsx(DropdownMenuItem, { onClick: () => {
                                                    if (!href) {
                                                        return;
                                                    }
                                                    const index = breadcrumbs.findIndex((item) => item.href === href && item.title === title);
                                                    breadcrumbsState.breadcrumbs = breadcrumbs.slice(0, index + 1);
                                                    clientLogger.logActivity({
                                                        eventType: 'breadcrumb_click',
                                                        eventId: title ?? 'unknown',
                                                        metadata: {
                                                            href,
                                                            size: breadcrumbs.length,
                                                            from: 'dropdown',
                                                        },
                                                        pageUrl: window.location.pathname,
                                                    });
                                                    router.push(href);
                                                }, children: title }, href))) })] })) : (_jsxs(Drawer, { open: open, onOpenChange: setOpen, children: [_jsx(DrawerTrigger, { "aria-label": "Toggle Menu", children: _jsx(BreadcrumbEllipsis, { className: "h-4 w-4" }) }), _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { className: "text-left", children: [_jsx(DrawerTitle, { children: "Navigate to" }), _jsx(DrawerDescription, { children: "Select a page to navigate to." })] }), _jsx("div", { className: "grid gap-1 px-4", children: breadcrumbs.slice(1, -ITEMS_TO_DISPLAY + 1).map((item) => (_jsx("button", { type: "button", onClick: () => {
                                                            if (!item.href) {
                                                                return;
                                                            }
                                                            clientLogger.logActivity({
                                                                eventType: 'Breadcrumb Click',
                                                                eventId: item.title ?? 'unknown',
                                                                metadata: {
                                                                    href: item.href,
                                                                    size: breadcrumbs.length,
                                                                    from: 'drawer',
                                                                },
                                                                pageUrl: window.location.pathname,
                                                            });
                                                            router.push(item.href);
                                                        }, children: item.title }, item.href ?? item.title))) }), _jsx(DrawerFooter, { className: "pt-4", children: _jsx(DrawerClose, { asChild: true, children: _jsx(Button, { variant: "outline", children: "Close" }) }) })] })] })) }), _jsx(BreadcrumbSeparator, {})] })) : null, lastItems.map(({ href, title }, index) => (_jsxs(Fragment, { children: [_jsx(BreadcrumbItem, { children: href && href !== '#' && lastItems.length !== index + 1 ? (_jsx(BreadcrumbLink, { className: "max-w-20 cursor-pointer truncate text-sidebar-foreground/50 hover:text-sidebar-foreground md:max-w-none", onClick: () => {
                                        const index = breadcrumbs.findIndex((item) => item.href === href && item.title === title);
                                        breadcrumbsState.breadcrumbs = breadcrumbs.slice(0, index + 1);
                                        clientLogger.logActivity({
                                            eventType: 'Breadcrumb Click',
                                            eventId: title ?? 'unknown',
                                            metadata: {
                                                href,
                                                size: breadcrumbs.length,
                                                from: 'last_item',
                                            },
                                            pageUrl: window.location.pathname,
                                        });
                                        router.push(href);
                                    }, children: title })) : (_jsx(BreadcrumbPage, { className: "max-w-20 truncate text-sidebar-foreground md:max-w-none", children: title })) }), index < lastItems.length - 1 && _jsx(BreadcrumbSeparator, {})] }, href)))] }) }) }));
}
//# sourceMappingURL=breadcrumbs.js.map