'use client';

import * as React from 'react';
import { NavUser } from '@/components/sidebar/nav-user';
import { TeamSwitcher } from '@/components/sidebar/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { usePathname } from '@/components/core/hooks/usePathname';
import { useEffect } from 'react';
import { ModuleNav } from './nav-main';
import { OneLevelNav } from './one-level-nav';
import { useTeamContext } from './team-context';
import { useAppContext } from './app-provider';
import { SidebarToggleButton } from './sidebar-toggle-button';
import { cn } from '@/lib/utils';
import { isNotEmpty } from '@/lib/core/common/isEmpty';

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { teams, activeTeam, setActiveTeam } = useTeamContext();
  const pathname = usePathname();

  useEffect(() => {
    if (activeTeam) {
      if (
        isNotEmpty(activeTeam.teamPath) &&
        (pathname.startsWith(`${activeTeam.teamPath}/`) || pathname === activeTeam.teamPath)
      ) {
        return;
      }
      if (
        activeTeam.modules.some(
          (module) =>
            isNotEmpty(module.modulePath) &&
            (pathname.startsWith(`${module.modulePath}/`) || pathname === module.modulePath),
        )
      ) {
        return;
      }
    }
    const team =
      teams.find(
        (team) =>
          (isNotEmpty(team.teamPath) && (pathname.startsWith(`${team.teamPath}/`) || pathname === team.teamPath)) ||
          team.modules.some(
            (module) =>
              isNotEmpty(module.modulePath) &&
              (pathname.startsWith(`${module.modulePath}/`) || pathname === module.modulePath),
          ) ||
          team.oneLevelNav.some(
            (nav) =>
              pathname.startsWith(`${team.teamPath}${nav.pagePath}/`) || pathname === `${team.teamPath}${nav.pagePath}`,
          ) ||
          team.modules.some((module) =>
            module.pageGroups.some(
              (group) =>
                pathname.startsWith(`${module.modulePath}${group.groupPath}/`) ||
                pathname === `${module.modulePath}${group.groupPath}` ||
                group.pages.some(
                  (page) =>
                    pathname.startsWith(`${module.modulePath}${group.groupPath}${page.pagePath}/`) ||
                    pathname === `${module.modulePath}${group.groupPath}${page.pagePath}`,
                ),
            ),
          ),
      ) ?? teams[0];
    if (team && team !== activeTeam) {
      setActiveTeam(team);
    }
  }, [activeTeam, pathname, teams, setActiveTeam]);

  const { dynamicSidebarContent: DynamicSidebarContent } = useAppContext();

  return (
    <Sidebar collapsible="icon" {...props} className={cn('group/sidebar', props.className)}>
      <SidebarHeader className="relative flex h-16 items-center justify-center">
        <SidebarToggleButton />
        {activeTeam && <TeamSwitcher teams={teams} activeTeam={activeTeam} setActiveTeam={setActiveTeam} />}
      </SidebarHeader>
      <SidebarContent>
        {activeTeam && (
          <div
            className={cn(
              'scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-sidebar-border',
              'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto',
            )}
          >
            <OneLevelNav team={activeTeam} title={activeTeam.menuTitle ?? activeTeam.name} />
            {DynamicSidebarContent && <DynamicSidebarContent activeTeam={activeTeam} />}
            {activeTeam.modules.map((module) => (
              <ModuleNav key={module.title} module={module} />
            ))}
          </div>
        )}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}

export default React.memo(AppSidebar);
