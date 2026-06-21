'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../components/ui/sidebar';
import { ChevronsUpDown } from 'lucide-react';
import { useClientSession } from '../../components/core/session-context';
import { UserProfileDropdown } from '../user-profile';
export function NavUser() {
    const session = useClientSession();
    if (!session.id) {
        return null;
    }
    return (_jsx(SidebarMenu, { className: "bg-sidebar text-sidebar-foreground", children: _jsx(SidebarMenuItem, { children: _jsx(UserProfileDropdown, { trigger: _jsxs(SidebarMenuButton, { size: "lg", className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", "data-testid": "sidebar-user-menu", children: [_jsxs(Avatar, { className: "h-8 w-8 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground", children: [_jsx(AvatarImage, { src: session.image ?? undefined, alt: session.name }), _jsx(AvatarFallback, { className: "rounded-lg bg-sidebar-accent text-sidebar-accent-foreground", children: session.name.charAt(0).toUpperCase() })] }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-medium", children: session.name }), _jsx("span", { className: "truncate text-xs", children: session.email })] }), _jsx(ChevronsUpDown, { className: "ml-auto size-4" })] }) }) }) }));
}
//# sourceMappingURL=nav-user.js.map