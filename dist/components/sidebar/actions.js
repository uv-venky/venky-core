'use client';
import { useRouter } from '../../components/core/hooks/useRouter';
import { showError } from '../core/common';
import { usePathname } from 'next/navigation';
export function useSidebarActions() {
  const _router = useRouter();
  const _pathname = usePathname();
  return (actionName, _path) => {
    switch (actionName) {
      default:
        showError(`Unknown sidebar action: ${actionName}`);
        break;
    }
  };
}
export function isSidebarItemActive(pathname, item, team) {
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
//# sourceMappingURL=actions.js.map
