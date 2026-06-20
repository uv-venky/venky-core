/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useSidebarSafe } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import usePageTitle from '@/components/core/hooks/usePageTitle';
import { UserProfile } from '@/components/user-profile';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShareUrlButton } from '@/components/share-url-button';
import { lazy, Suspense } from 'react';
import Suspended from '@/components/core/common/Suspended';
import { useTeamContextSafe } from '@/components/sidebar/team-context';
import { Button } from '@/components/ui/button';
import { Dot, Menu } from 'lucide-react';
import MustBeTabletOrDesktop, { useIsTabletOrDesktop } from '@/components/core/page/MustBeTabletOrDesktop';
import ErrorBoundary from '@/components/core/common/ErrorBoundary';
import { HeaderStartContentProvider, useHeaderStartContent } from './page-shell-header-context';
import { usePageShellModeSafe } from './page-shell-mode-context';
import { CommentsButton } from '@/components/comments-button';

const Breadcrumbs = lazy(() => import('@/components/breadcrumbs'));

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
}: Readonly<{
  title?: string;
  headerEndContent?: React.ReactNode;
  hideThemeToggle?: boolean;
  enableShareUrl?: boolean;
  enableComments?: boolean;
  sidebarState?: 'expanded' | 'collapsed';
  sidebarIsMobile?: boolean;
  onToggleSidebar?: () => void;
  teamName?: string;
}>) {
  usePageTitle(title ?? 'Change this title');
  const sidebarCtx = useSidebarSafe();
  const teamCtx = useTeamContextSafe();
  const isTabletOrDesktop = useIsTabletOrDesktop();
  const headerStartContent = useHeaderStartContent();

  const sidebarState = sidebarStateProp ?? sidebarCtx?.state ?? 'expanded';
  const isMobile = sidebarIsMobileProp ?? sidebarCtx?.isMobile ?? false;
  const toggleSidebar = onToggleSidebar ?? sidebarCtx?.toggleSidebar;
  const teamName = teamNameProp ?? teamCtx?.activeTeam?.name;

  return (
    <Suspense fallback={<Suspended name="PageShell" />}>
      <header className="flex h-16! shrink-0 flex-nowrap items-center gap-2 overflow-hidden bg-sidebar px-4 text-sidebar-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex flex-1 flex-nowrap items-center gap-2">
          {isMobile && toggleSidebar && (
            <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {sidebarState === 'collapsed' && teamName && (
            <>
              <span className="font-medium text-sm">{teamName}</span>
              <Dot className="h-4 w-4" />
            </>
          )}
          {headerStartContent}
          <Breadcrumbs />
        </div>
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          {isTabletOrDesktop && headerEndContent}
        </ErrorBoundary>
        {enableComments && <CommentsButton />}
        {enableShareUrl && <ShareUrlButton />}
        {!hideThemeToggle && <ThemeToggle />}
        <UserProfile hideThemeToggle={hideThemeToggle} />
      </header>
    </Suspense>
  );
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
}: Readonly<{
  title?: string;
  children: React.ReactNode;
  headerEndContent?: React.ReactNode;
  noPadding?: boolean;
  hideThemeToggle?: boolean;
  /** Explicit override; when omitted, defers to `PageShellModeProvider` (`embedded` hides header). */
  hideHeader?: boolean;
  mustBeTabletOrDesktop?: boolean;
  enableShareUrl?: boolean;
  noScroll?: boolean;
  sidebarState?: 'expanded' | 'collapsed';
  sidebarIsMobile?: boolean;
  onToggleSidebar?: () => void;
  teamName?: string;
}>) {
  usePageTitle(title ?? 'Change this title');
  const shellMode = usePageShellModeSafe();
  const hideHeader = hideHeaderProp ?? shellMode?.mode === 'embedded';

  return (
    <HeaderStartContentProvider>
      <Suspense fallback={<Suspended name="PageShell" />}>
        {!hideHeader && (
          <PageShellHeader
            title={title}
            headerEndContent={headerEndContent}
            hideThemeToggle={hideThemeToggle}
            enableShareUrl={enableShareUrl}
            sidebarState={sidebarState}
            sidebarIsMobile={sidebarIsMobile}
            onToggleSidebar={onToggleSidebar}
            teamName={teamName}
          />
        )}
        <div
          className={cn(
            'flex flex-1 flex-col gap-4',
            !noPadding && 'p-4 pt-0',
            noScroll ? 'overflow-hidden' : 'overflow-auto',
          )}
        >
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            <Suspense fallback={<Suspended name="PageShellInner" />}>
              {mustBeTabletOrDesktop ? <MustBeTabletOrDesktop>{children}</MustBeTabletOrDesktop> : children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </Suspense>
    </HeaderStartContentProvider>
  );
}
