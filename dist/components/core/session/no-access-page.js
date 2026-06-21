/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../../../components/ui/button';
import { useRouter } from '../../../components/core/hooks/useRouter';
import { useClientSession } from '../../../components/core/session-context';
import { getFirstTeamLandingUrl } from '../../../components/sidebar/team-landing-url';
import { useManualReadySignal } from '../../../lib/core/client/loading-tracker';
import { useMutation } from '../../../lib/core/client/useQuery';
import { LogOut } from 'lucide-react';
import { useEffect, useMemo } from 'react';
/**
 * Shown when the user has no application access. If the session later includes a navigable team,
 * redirects to that landing URL.
 */
export function NoAccessPage({ reportReadyToLoadingTracker = false, signOut: signOutProp }) {
  const { teams } = useClientSession();
  const router = useRouter();
  const signalReady = useManualReadySignal();
  const signOutMutation = useMutation('signOut');
  const signOut = signOutProp ?? (() => signOutMutation());
  const landingUrl = useMemo(() => getFirstTeamLandingUrl(teams ?? []), [teams]);
  useEffect(() => {
    if (reportReadyToLoadingTracker) {
      signalReady();
    }
  }, [reportReadyToLoadingTracker, signalReady]);
  useEffect(() => {
    if (landingUrl == null) {
      return;
    }
    if (landingUrl.startsWith('http')) {
      window.location.href = landingUrl;
    } else {
      router.push(landingUrl);
    }
  }, [landingUrl, router]);
  if (landingUrl != null) {
    return null;
  }
  return _jsx('div', {
    className: 'flex min-h-screen flex-col items-center justify-center px-4 text-center',
    children: _jsxs('div', {
      className: 'mx-auto max-w-md space-y-6',
      children: [
        _jsxs('div', {
          className: 'space-y-2',
          children: [
            _jsx('h1', {
              className: 'font-bold text-3xl text-muted-foreground tracking-tighter',
              children: 'No Access',
            }),
            _jsx('h2', {
              className: 'font-bold text-muted-foreground text-xl tracking-tight',
              children: 'You do not have any roles assigned to access this application',
            }),
            _jsx('p', {
              className: 'text-muted-foreground',
              children: `Please sign out and contact your administrator to get access to this application and sign in again.`,
            }),
          ],
        }),
        _jsxs(Button, {
          activityId: '404-back-home',
          size: 'lg',
          className: 'gap-2',
          onClick: async () => {
            const redirectTo = await signOut();
            window.location.href = redirectTo ?? '/login';
          },
          children: [_jsx(LogOut, {}), 'Sign out'],
        }),
      ],
    }),
  });
}
//# sourceMappingURL=no-access-page.js.map
