'use client';

import { ChevronRight, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePathname } from '@/components/core/hooks/usePathname';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { useState, useTransition } from 'react';
import { useRouter } from '@/components/core/hooks/useRouter';
import clientLogger from '@/lib/core/client/client-logger';
import type { ModuleMenuItems, PageGroup, PageItem } from './types';
import { AppIcon } from './icons';
import { useSidebar } from '../ui/sidebar';
import { useAppContext } from './app-provider';
import { showError } from '../core/common/Notification';

function GroupNav({ module: moduleMenu, group }: { group: PageGroup; module: ModuleMenuItems }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isOpen, setIsOpen] = useState(group.isExpanded ?? false);

  const hasVisiblePages = group.pages.some((page) => !page.hidden);

  if (!hasVisiblePages) {
    return null;
  }

  const groupFullPath = `${moduleMenu.modulePath}${group.groupPath}`;
  const isActive = pathname === groupFullPath || pathname.startsWith(`${groupFullPath}/`);

  return (
    <Collapsible
      key={group.title}
      asChild
      open={state === 'collapsed' || isActive ? true : isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={group.title}
            isActive={isActive}
            className="group-data-[collapsible=icon]:hidden"
            data-testid={`sidebar-group-${moduleMenu.modulePath}${group.groupPath}`}
          >
            {group.icon && <AppIcon icon={group.icon} />}
            <span>{group.title}</span>
            {!isActive && (
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.pages
              .filter((page) => !page.hidden)
              .map((page) => (
                <PageMenuItem key={page.title} page={page} group={group} moduleMenu={moduleMenu} />
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function ModuleNav({ module: moduleMenu }: { module: ModuleMenuItems }) {
  const hasVisiblePages = moduleMenu.pageGroups.some((group) => group.pages.some((page) => !page.hidden));

  if (!hasVisiblePages) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{moduleMenu.title}</SidebarGroupLabel>
      <SidebarMenu>
        {moduleMenu.pageGroups.map((group) => (
          <GroupNav key={group.title} module={moduleMenu} group={group} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function PageMenuItem({ page, group, moduleMenu }: { page: PageItem; group: PageGroup; moduleMenu: ModuleMenuItems }) {
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

  return (
    <SidebarMenuSubItem key={page.title}>
      <SidebarMenuSubButton
        asChild
        tooltip={page.title}
        data-testid={`sidebar-page${moduleMenu.modulePath}${group.groupPath}${page.pagePath}`}
        isActive={isActive()}
        onClick={() => {
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
            } else {
              router.push(href);
            }
            if (isMobile) {
              setOpenMobile(false);
            }
          });
        }}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <AppIcon icon={page.icon ?? 'FileText'} />}
          <span className="truncate group-data-[collapsible=icon]:hidden">{page.title}</span>
        </div>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
