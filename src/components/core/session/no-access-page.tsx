/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/components/core/hooks/useRouter';
import { useClientSession } from '@/components/core/session-context';
import { getFirstTeamLandingUrl } from '@/components/sidebar/team-landing-url';
import { useManualReadySignal } from '@/lib/core/client/loading-tracker';
import { useMutation } from '@/lib/core/client/useQuery';
import { LogOut } from 'lucide-react';
import { useEffect, useMemo } from 'react';

export interface NoAccessPageProps {
  /**
   * When true, notifies the loading tracker on mount (matches core default secure layout usage).
   */
  reportReadyToLoadingTracker?: boolean;
  /** Sign-out handler returning redirect URL. Defaults to the `signOut` work action. */
  signOut?: () => Promise<string | undefined>;
}

/**
 * Shown when the user has no application access. If the session later includes a navigable team,
 * redirects to that landing URL.
 */
export function NoAccessPage({ reportReadyToLoadingTracker = false, signOut: signOutProp }: NoAccessPageProps) {
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl text-muted-foreground tracking-tighter">No Access</h1>
          <h2 className="font-bold text-muted-foreground text-xl tracking-tight">
            You do not have any roles assigned to access this application
          </h2>
          <p className="text-muted-foreground">{`Please sign out and contact your administrator to get access to this application and sign in again.`}</p>
        </div>

        <Button
          activityId="404-back-home"
          size="lg"
          className="gap-2"
          onClick={async () => {
            const redirectTo = await signOut();
            window.location.href = redirectTo ?? '/login';
          }}
        >
          <LogOut />
          Sign out
        </Button>
      </div>
    </div>
  );
}
