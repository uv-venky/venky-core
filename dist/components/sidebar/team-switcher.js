'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from '../../components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '../../components/ui/sidebar';
import { useRouter } from '../../components/core/hooks/useRouter';
import { AppIcon } from './icons';
import { getTeamLandingUrl } from './team-landing-url';
export function TeamSwitcher({ teams, activeTeam, setActiveTeam, }) {
    const { isMobile } = useSidebar();
    return (_jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(SidebarMenuButton, { tooltip: activeTeam.name, size: "lg", className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", "data-testid": "sidebar-team-switcher", children: [_jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent", children: _jsx(AppIcon, { icon: activeTeam.logo }) }), _jsx("div", { className: "grid flex-1 text-left text-sm leading-tight", children: _jsx("span", { className: "truncate font-medium", children: activeTeam.name }) }), _jsx(ChevronsUpDown, { className: "ml-auto" })] }) }), _jsxs(DropdownMenuContent, { className: "scrollbar-hide max-h-screen w-(--radix-dropdown-menu-trigger-width) min-w-56 overflow-y-auto rounded-lg", align: "start", side: isMobile ? 'bottom' : 'right', sideOffset: 4, children: [_jsx(DropdownMenuLabel, { className: "text-muted-foreground text-xs", children: "Applications" }), teams.map((team, _index) => (_jsx(TeamSwitcherItem, { team: team, setActiveTeam: setActiveTeam }, team.name)))] })] }) }) }));
}
function TeamSwitcherItem({ team, setActiveTeam }) {
    const [isPending, startTransition] = React.useTransition();
    const router = useRouter();
    // For external apps (database apps), use teamPath directly
    const isExternalApp = team.teamPath.startsWith('http');
    if (!isExternalApp) {
        const hasVisiblePages = team.modules.some((module) => module.pageGroups.some((group) => group.pages.some((page) => !page.hidden))) ||
            team.oneLevelNav.some((nav) => !nav.hidden);
        if (!hasVisiblePages) {
            return null;
        }
    }
    const url = isExternalApp ? team.teamPath : (getTeamLandingUrl(team) ?? '#');
    const teamId = team.teamPath.replace(/\//g, '-').replace(/^-/, '');
    return (_jsxs(DropdownMenuItem, { onClick: () => {
            if (isExternalApp) {
                window.location.href = team.teamPath;
                return;
            }
            setActiveTeam(team);
            startTransition(() => {
                router.push(url);
            });
        }, className: "gap-2 p-2", "data-testid": `sidebar-team-${teamId}`, children: [_jsx("div", { className: "flex size-6 items-center justify-center rounded-xs", children: isPending ? _jsx(Loader2, { className: "size-4 animate-spin" }) : _jsx(AppIcon, { icon: team.logo }) }), team.name] }, team.name));
}
//# sourceMappingURL=team-switcher.js.map