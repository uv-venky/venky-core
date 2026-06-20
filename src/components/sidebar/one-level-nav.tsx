'use client';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePathname } from '@/components/core/hooks/usePathname';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { useRouter } from '@/components/core/hooks/useRouter';
import clientLogger from '@/lib/core/client/client-logger';
import type { PageItem, Team } from './types';
import { AppIcon } from './icons';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppContext } from './app-provider';
import { showError } from '../core/common/Notification';
import { Link } from '@/components/core/link';

function isSidebarItemActiveInternal(pathname: string, item: PageItem, team: Team): boolean {
  const fullUrl = `${team.teamPath}${item.pagePath}`;

  if (pathname === fullUrl || (item.pagePath !== '' && pathname.startsWith(`${fullUrl}/`))) {
    return true;
  }
  const isParentPageActive = team.oneLevelNav.some(
    (p) =>
      item.pagePath === p.parentPagePath &&
      (pathname === `${team.teamPath}${p.pagePath}` || pathname.startsWith(`${team.teamPath}${p.pagePath}/`)),
  );

  return isParentPageActive;
}

function OneLevelNavItemComponent({ item, team }: { item: PageItem; team: Team }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fullUrl = `${team.teamPath}${item.pagePath}`;
  const href = `${fullUrl}${item.retainSearchParams ? `?${searchParams.toString()}` : ''}`;
  const { isSidebarItemActive, executeSidebarAction } = useAppContext();
  const { isMobile, setOpenMobile } = useSidebar();

  function isActive() {
    return isSidebarItemActive?.(pathname, item, team) || isSidebarItemActiveInternal(pathname, item, team);
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive()} tooltip={item.title} data-testid={`sidebar-nav${fullUrl}`}>
        <Link
          prefetch={false}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            startTransition(() => {
              clientLogger.logActivity({
                eventType: 'Sidebar Click',
                eventId: item.title ?? 'unknown',
                metadata: {
                  href,
                },
                pageUrl: window.location.pathname,
              });
              if (item.onClickAction) {
                if (!executeSidebarAction) {
                  showError('executeSidebarAction is not defined!');
                  return;
                }
                executeSidebarAction(item.onClickAction, href);
              } else {
                router.push(href);
              }
              if (isMobile) {
                setOpenMobile(false);
              }
            });
          }}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <AppIcon icon={item.icon} />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function OneLevelNav({ team, title }: { team: Team; title: string }) {
  if (team.oneLevelNav.length === 0) {
    return null;
  }

  const hasVisiblePages = team.oneLevelNav.filter((item) => !item.hidden).length > 0;
  if (!hasVisiblePages) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {team.oneLevelNav
          .filter((item) => !item.hidden)
          .map((item) => (
            <OneLevelNavItemComponent key={item.title} item={item} team={team} />
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
