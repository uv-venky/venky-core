/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
import { useSidebarSafe } from '../../../components/ui/sidebar';
import { cn } from '../../../lib/utils';
import usePageTitle from '../../../components/core/hooks/usePageTitle';
import { UserProfile } from '../../../components/user-profile';
import { ThemeToggle } from '../../../components/theme-toggle';
import { ShareUrlButton } from '../../../components/share-url-button';
import { lazy, Suspense } from 'react';
import Suspended from '../../../components/core/common/Suspended';
import { useTeamContextSafe } from '../../../components/sidebar/team-context';
import { Button } from '../../../components/ui/button';
import { Dot, Menu } from 'lucide-react';
import MustBeTabletOrDesktop, { useIsTabletOrDesktop } from '../../../components/core/page/MustBeTabletOrDesktop';
import ErrorBoundary from '../../../components/core/common/ErrorBoundary';
import { HeaderStartContentProvider, useHeaderStartContent } from './page-shell-header-context';
import { usePageShellModeSafe } from './page-shell-mode-context';
import { CommentsButton } from '../../../components/comments-button';
const Breadcrumbs = lazy(() => import('../../../components/breadcrumbs'));
function PageShellHeader({
  title,
  headerEndContent,
  hideThemeToggle = false,
  enableShareUrl = false,
  enableComments = false,
  sidebarState: sidebarStateProp,
  sidebarIsMobile: sidebarIsMobileProp,
  onToggleSidebar,
  teamName: teamNameProp,
}) {
  usePageTitle(title ?? 'Change this title');
  const sidebarCtx = useSidebarSafe();
  const teamCtx = useTeamContextSafe();
  const isTabletOrDesktop = useIsTabletOrDesktop();
  const headerStartContent = useHeaderStartContent();
  const sidebarState = sidebarStateProp ?? sidebarCtx?.state ?? 'expanded';
  const isMobile = sidebarIsMobileProp ?? sidebarCtx?.isMobile ?? false;
  const toggleSidebar = onToggleSidebar ?? sidebarCtx?.toggleSidebar;
  const teamName = teamNameProp ?? teamCtx?.activeTeam?.name;
  return _jsx(Suspense, {
    fallback: _jsx(Suspended, { name: 'PageShell' }),
    children: _jsxs('header', {
      className:
        'flex h-16! shrink-0 flex-nowrap items-center gap-2 overflow-hidden bg-sidebar px-4 text-sidebar-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
      children: [
        _jsxs('div', {
          className: 'flex flex-1 flex-nowrap items-center gap-2',
          children: [
            isMobile &&
              toggleSidebar &&
              _jsx(Button, {
                variant: 'ghost',
                size: 'icon',
                className: 'h-7 w-7 md:hidden',
                onClick: toggleSidebar,
                children: _jsx(Menu, { className: 'h-5 w-5' }),
              }),
            sidebarState === 'collapsed' &&
              teamName &&
              _jsxs(_Fragment, {
                children: [
                  _jsx('span', { className: 'font-medium text-sm', children: teamName }),
                  _jsx(Dot, { className: 'h-4 w-4' }),
                ],
              }),
            headerStartContent,
            _jsx(Breadcrumbs, {}),
          ],
        }),
        _jsx(ErrorBoundary, {
          showDetails: process.env.NODE_ENV === 'development',
          children: isTabletOrDesktop && headerEndContent,
        }),
        enableComments && _jsx(CommentsButton, {}),
        enableShareUrl && _jsx(ShareUrlButton, {}),
        !hideThemeToggle && _jsx(ThemeToggle, {}),
        _jsx(UserProfile, { hideThemeToggle: hideThemeToggle }),
      ],
    }),
  });
}
export default function PageShell({
  title,
  children,
  headerEndContent,
  noPadding = false,
  hideThemeToggle = false,
  hideHeader: hideHeaderProp,
  mustBeTabletOrDesktop = true,
  enableShareUrl = false,
  noScroll = false,
  sidebarState,
  sidebarIsMobile,
  onToggleSidebar,
  teamName,
}) {
  usePageTitle(title ?? 'Change this title');
  const shellMode = usePageShellModeSafe();
  const hideHeader = hideHeaderProp ?? shellMode?.mode === 'embedded';
  return _jsx(HeaderStartContentProvider, {
    children: _jsxs(Suspense, {
      fallback: _jsx(Suspended, { name: 'PageShell' }),
      children: [
        !hideHeader &&
          _jsx(PageShellHeader, {
            title: title,
            headerEndContent: headerEndContent,
            hideThemeToggle: hideThemeToggle,
            enableShareUrl: enableShareUrl,
            sidebarState: sidebarState,
            sidebarIsMobile: sidebarIsMobile,
            onToggleSidebar: onToggleSidebar,
            teamName: teamName,
          }),
        _jsx('div', {
          className: cn(
            'flex flex-1 flex-col gap-4',
            !noPadding && 'p-4 pt-0',
            noScroll ? 'overflow-hidden' : 'overflow-auto',
          ),
          children: _jsx(ErrorBoundary, {
            showDetails: process.env.NODE_ENV === 'development',
            children: _jsx(Suspense, {
              fallback: _jsx(Suspended, { name: 'PageShellInner' }),
              children: mustBeTabletOrDesktop ? _jsx(MustBeTabletOrDesktop, { children: children }) : children,
            }),
          }),
        }),
      ],
    }),
  });
}
//# sourceMappingURL=page-shell.js.map
