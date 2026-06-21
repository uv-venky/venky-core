'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { NavUser } from '../../components/sidebar/nav-user';
import { TeamSwitcher } from '../../components/sidebar/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../../components/ui/sidebar';
import { usePathname } from '../../components/core/hooks/usePathname';
import { useEffect } from 'react';
import { ModuleNav } from './nav-main';
import { OneLevelNav } from './one-level-nav';
import { useTeamContext } from './team-context';
import { useAppContext } from './app-provider';
import { SidebarToggleButton } from './sidebar-toggle-button';
import { cn } from '../../lib/utils';
import { isNotEmpty } from '../../lib/core/common/isEmpty';
function AppSidebar({ ...props }) {
    const { teams, activeTeam, setActiveTeam } = useTeamContext();
    const pathname = usePathname();
    useEffect(() => {
        if (activeTeam) {
            if (isNotEmpty(activeTeam.teamPath) &&
                (pathname.startsWith(`${activeTeam.teamPath}/`) || pathname === activeTeam.teamPath)) {
                return;
            }
            if (activeTeam.modules.some((module) => isNotEmpty(module.modulePath) &&
                (pathname.startsWith(`${module.modulePath}/`) || pathname === module.modulePath))) {
                return;
            }
        }
        const team = teams.find((team) => (isNotEmpty(team.teamPath) && (pathname.startsWith(`${team.teamPath}/`) || pathname === team.teamPath)) ||
            team.modules.some((module) => isNotEmpty(module.modulePath) &&
                (pathname.startsWith(`${module.modulePath}/`) || pathname === module.modulePath)) ||
            team.oneLevelNav.some((nav) => pathname.startsWith(`${team.teamPath}${nav.pagePath}/`) || pathname === `${team.teamPath}${nav.pagePath}`) ||
            team.modules.some((module) => module.pageGroups.some((group) => pathname.startsWith(`${module.modulePath}${group.groupPath}/`) ||
                pathname === `${module.modulePath}${group.groupPath}` ||
                group.pages.some((page) => pathname.startsWith(`${module.modulePath}${group.groupPath}${page.pagePath}/`) ||
                    pathname === `${module.modulePath}${group.groupPath}${page.pagePath}`)))) ?? teams[0];
        if (team && team !== activeTeam) {
            setActiveTeam(team);
        }
    }, [activeTeam, pathname, teams, setActiveTeam]);
    const { dynamicSidebarContent: DynamicSidebarContent } = useAppContext();
    return (_jsxs(Sidebar, { collapsible: "icon", ...props, className: cn('group/sidebar', props.className), children: [_jsxs(SidebarHeader, { className: "relative flex h-16 items-center justify-center", children: [_jsx(SidebarToggleButton, {}), activeTeam && _jsx(TeamSwitcher, { teams: teams, activeTeam: activeTeam, setActiveTeam: setActiveTeam })] }), _jsx(SidebarContent, { children: activeTeam && (_jsxs("div", { className: cn('scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-sidebar-border', 'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto'), children: [_jsx(OneLevelNav, { team: activeTeam, title: activeTeam.menuTitle ?? activeTeam.name }), DynamicSidebarContent && _jsx(DynamicSidebarContent, { activeTeam: activeTeam }), activeTeam.modules.map((module) => (_jsx(ModuleNav, { module: module }, module.title)))] })) }), _jsx(SidebarFooter, { children: _jsx(NavUser, {}) })] }));
}
export default React.memo(AppSidebar);
//# sourceMappingURL=app-sidebar.js.map