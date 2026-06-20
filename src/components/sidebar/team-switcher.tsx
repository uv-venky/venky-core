'use client';

import * as React from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useRouter } from '@/components/core/hooks/useRouter';
import type { Team } from './types';
import { AppIcon } from './icons';
import { getTeamLandingUrl } from './team-landing-url';

export function TeamSwitcher({
  teams,
  activeTeam,
  setActiveTeam,
}: {
  teams: Team[];
  activeTeam: Team;
  setActiveTeam: (team: Team) => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={activeTeam.name}
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="sidebar-team-switcher"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent">
                <AppIcon icon={activeTeam.logo} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="scrollbar-hide max-h-screen w-(--radix-dropdown-menu-trigger-width) min-w-56 overflow-y-auto rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Applications</DropdownMenuLabel>
            {teams.map((team, _index) => (
              <TeamSwitcherItem key={team.name} team={team} setActiveTeam={setActiveTeam} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function TeamSwitcherItem({ team, setActiveTeam }: { team: Team; setActiveTeam: (team: Team) => void }) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  // For external apps (database apps), use teamPath directly
  const isExternalApp = team.teamPath.startsWith('http');

  if (!isExternalApp) {
    const hasVisiblePages =
      team.modules.some((module) => module.pageGroups.some((group) => group.pages.some((page) => !page.hidden))) ||
      team.oneLevelNav.some((nav) => !nav.hidden);
    if (!hasVisiblePages) {
      return null;
    }
  }

  const url = isExternalApp ? team.teamPath : (getTeamLandingUrl(team) ?? '#');

  const teamId = team.teamPath.replace(/\//g, '-').replace(/^-/, '');

  return (
    <DropdownMenuItem
      key={team.name}
      onClick={() => {
        if (isExternalApp) {
          window.location.href = team.teamPath;
          return;
        }
        setActiveTeam(team);
        startTransition(() => {
          router.push(url);
        });
      }}
      className="gap-2 p-2"
      data-testid={`sidebar-team-${teamId}`}
    >
      <div className="flex size-6 items-center justify-center rounded-xs">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <AppIcon icon={team.logo} />}
      </div>
      {team.name}
    </DropdownMenuItem>
  );
}
