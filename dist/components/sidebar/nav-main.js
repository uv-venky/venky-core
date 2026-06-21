'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, } from '../../components/ui/sidebar';
import { usePathname } from '../../components/core/hooks/usePathname';
import { useSearchParams } from '../../components/core/hooks/useSearchParams';
import { useState, useTransition } from 'react';
import { useRouter } from '../../components/core/hooks/useRouter';
import clientLogger from '../../lib/core/client/client-logger';
import { AppIcon } from './icons';
import { useSidebar } from '../ui/sidebar';
import { useAppContext } from './app-provider';
import { showError } from '../core/common/Notification';
function GroupNav({ module: moduleMenu, group }) {
    const pathname = usePathname();
    const { state } = useSidebar();
    const [isOpen, setIsOpen] = useState(group.isExpanded ?? false);
    const hasVisiblePages = group.pages.some((page) => !page.hidden);
    if (!hasVisiblePages) {
        return null;
    }
    const groupFullPath = `${moduleMenu.modulePath}${group.groupPath}`;
    const isActive = pathname === groupFullPath || pathname.startsWith(`${groupFullPath}/`);
    return (_jsx(Collapsible, { asChild: true, open: state === 'collapsed' || isActive ? true : isOpen, onOpenChange: setIsOpen, className: "group/collapsible", children: _jsxs(SidebarMenuItem, { children: [_jsx(CollapsibleTrigger, { asChild: true, children: _jsxs(SidebarMenuButton, { tooltip: group.title, isActive: isActive, className: "group-data-[collapsible=icon]:hidden", "data-testid": `sidebar-group-${moduleMenu.modulePath}${group.groupPath}`, children: [group.icon && _jsx(AppIcon, { icon: group.icon }), _jsx("span", { children: group.title }), !isActive && (_jsx(ChevronRight, { className: "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" }))] }) }), _jsx(CollapsibleContent, { children: _jsx(SidebarMenuSub, { children: group.pages
                            .filter((page) => !page.hidden)
                            .map((page) => (_jsx(PageMenuItem, { page: page, group: group, moduleMenu: moduleMenu }, page.title))) }) })] }) }, group.title));
}
export function ModuleNav({ module: moduleMenu }) {
    const hasVisiblePages = moduleMenu.pageGroups.some((group) => group.pages.some((page) => !page.hidden));
    if (!hasVisiblePages) {
        return null;
    }
    return (_jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { children: moduleMenu.title }), _jsx(SidebarMenu, { children: moduleMenu.pageGroups.map((group) => (_jsx(GroupNav, { module: moduleMenu, group: group }, group.title))) })] }));
}
function PageMenuItem({ page, group, moduleMenu }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const { executeSidebarAction } = useAppContext();
    const { isMobile, setOpenMobile } = useSidebar();
    function isActive() {
        const fullPath = `${moduleMenu.modulePath}${group.groupPath}${page.pagePath}`;
        if (pathname === fullPath || pathname.startsWith(`${fullPath}/`)) {
            return true;
        }
        const isParentPageActive = group.pages.some((p) => {
            const childPath = `${moduleMenu.modulePath}${group.groupPath}${p.pagePath}`;
            return page.pagePath === p.parentPagePath && (pathname === childPath || pathname.startsWith(`${childPath}/`));
        });
        return isParentPageActive;
    }
    return (_jsx(SidebarMenuSubItem, { children: _jsx(SidebarMenuSubButton, { asChild: true, tooltip: page.title, "data-testid": `sidebar-page${moduleMenu.modulePath}${group.groupPath}${page.pagePath}`, isActive: isActive(), onClick: () => {
                const href = `${moduleMenu.modulePath}${group.groupPath}${page.pagePath}${page.retainSearchParams ? `?${searchParams.toString()}` : ''}`;
                if (href === pathname) {
                    if (isMobile) {
                        setOpenMobile(false);
                    }
                    return;
                }
                startTransition(() => {
                    clientLogger.logActivity({
                        eventType: 'Sidebar Click',
                        eventId: page.title ?? 'unknown',
                        metadata: {
                            href,
                        },
                        pageUrl: window.location.pathname,
                    });
                    if (page.onClickAction) {
                        if (!executeSidebarAction) {
                            showError('executeSidebarAction is not defined!');
                            return;
                        }
                        executeSidebarAction(page.onClickAction, href);
                    }
                    else {
                        router.push(href);
                    }
                    if (isMobile) {
                        setOpenMobile(false);
                    }
                });
            }, className: "cursor-pointer", children: _jsxs("div", { className: "flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0", children: [isPending ? _jsx(Loader2, { className: "size-4 animate-spin" }) : _jsx(AppIcon, { icon: page.icon ?? 'FileText' }), _jsx("span", { className: "truncate group-data-[collapsible=icon]:hidden", children: page.title })] }) }) }, page.title));
}
//# sourceMappingURL=nav-main.js.map