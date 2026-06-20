'use client';

import { useRouter } from '@/components/core/hooks/useRouter';
import type { PageItem, SidebarAction, Team } from './types';
import { showError } from '../core/common';
import { usePathname } from 'next/navigation';

export function useSidebarActions() {
  const _router = useRouter();
  const _pathname = usePathname();

  return (actionName: SidebarAction, _path: string) => {
    switch (actionName) {
      default:
        showError(`Unknown sidebar action: ${actionName}`);
        break;
    }
  };
}

export function isSidebarItemActive(pathname: string, item: PageItem, team: Team): boolean {
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
