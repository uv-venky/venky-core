'use client';

import { SessionProvider } from '@/components/core/session-provider';
import { useMutation } from '@/lib/core/client/useQuery';
import { SidebarInset, SidebarProvider, SidebarWrapper } from '@/components/ui/sidebar';
import type { UserSession } from '@/lib/core/common/types/UserSession';
import { SidebarRight } from '@/components/core/theme/theme-sidebar';
import { useShowThemeCustomization } from '@/app/(secure)/admin/config/themes/ThemesPage';
import { Suspense, useEffect, useMemo, type ReactNode } from 'react';
import Suspended from '@/components/core/common/Suspended';
import logger from '@/lib/core/client/client-logger';
import { usePathname } from '@/components/core/hooks/usePathname';
import { useRouter } from '@/components/core/hooks/useRouter';
import { TeamProvider } from '@/components/sidebar/team-context';
import AppSidebar from '@/components/sidebar/app-sidebar';
import { SSEConnectionBanner } from '@/components/core/common/sse-connection-banner';
import { VersionUpdateBanner } from '@/components/core/common/version-update-banner';
import { SidebarVisibilityProvider, useSidebarVisibility } from '@/components/sidebar/sidebar-visibility-context';
import { DataLoadingTracker } from '@/components/core/DataLoadingTracker';
import {
  type EnvironmentInfo,
  Devtools,
  enableDevtoolsForRoles,
  useDevtoolsRouteTracking,
  useDevtoolsEnvironment,
} from '@/lib/core/client/devtools';
import { APP_VERSION } from '@/lib/app-info';
import { useEnv } from '@/app/(secure)/EnvProvider';

export default function DefaultSecureLayout({
  children,
  session,
  hideSidebar = false,
}: Readonly<{
  children: ReactNode;
  session: UserSession;
  hideSidebar?: boolean;
}>) {
  const router = useRouter();
  const updateProfileMutation = useMutation('updateProfile');
  useEffect(() => {
    logger.setLevel(session.settings.logLevel ?? (process.env.NODE_ENV === 'development' ? 'debug' : 'warn'));
  }, [session.settings.logLevel]);

  // Enable devtools for admin users (even in production)
  useEffect(() => {
    enableDevtoolsForRoles(session.roles);
  }, [session.roles]);

  const pathname = usePathname();
  const env = useEnv();

  // Track route changes in devtools
  useDevtoolsRouteTracking(pathname);

  // Set environment info in devtools (includes app env from EnvProvider)
  const envInfo: Partial<EnvironmentInfo> = useMemo(() => {
    const envInfo: Partial<EnvironmentInfo> = {
      userEmail: session.email,
      userRoles: session.roles,
      appVersion: APP_VERSION,
      nodeEnv: process.env.NODE_ENV ?? 'development',
      userName: session.userName,
      env,
    };
    return envInfo;
  }, [session.email, session.roles, session.userName, env]);
  useDevtoolsEnvironment(envInfo);

  useEffect(() => {
    if (session.teams.length === 0 && pathname !== '/no-access') {
      router.push('/no-access');
    }
  }, [pathname, router, session]);

  return (
    <SessionProvider
      session={session}
      onSettingsChange={(key, value) => void updateProfileMutation(key, value as never)}
    >
      <TeamProvider>
        <SSEConnectionBanner />
        <VersionUpdateBanner />
        <SidebarVisibilityProvider>
          <DefaultSecureLayoutContent session={session} hideSidebar={hideSidebar}>
            <DataLoadingTracker />
            {children}
            <Devtools />
          </DefaultSecureLayoutContent>
        </SidebarVisibilityProvider>
      </TeamProvider>
    </SessionProvider>
  );
}

function DefaultSecureLayoutContent({
  children,
  session,
  hideSidebar: hideSidebarProp = false,
}: Readonly<{
  children: ReactNode;
  session: UserSession;
  hideSidebar: boolean;
}>) {
  const showRightSidebar = useShowThemeCustomization();
  const { shouldHideSidebar } = useSidebarVisibility();
  const pathname = usePathname();

  const hideSidebar =
    hideSidebarProp ||
    session.teams.length === 0 ||
    pathname.startsWith('/access-denied') ||
    pathname.startsWith('/force-password-change');
  const shouldRenderSidebar = !hideSidebar && !shouldHideSidebar;

  return (
    <SidebarProvider defaultOpen={session.settings.sidebarOpen ?? true}>
      {shouldRenderSidebar ? (
        <SidebarWrapper>
          <AppSidebar />
          <SidebarInset>
            <Suspense fallback={<Suspended name="DefaultSecureLayout" />}>{children}</Suspense>
          </SidebarInset>
          {showRightSidebar && <SidebarRight />}
        </SidebarWrapper>
      ) : (
        <Suspense fallback={<Suspended name="DefaultSecureLayout" />}>{children}</Suspense>
      )}
    </SidebarProvider>
  );
}
