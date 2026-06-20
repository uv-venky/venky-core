/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { useRouter } from '@/components/core/hooks/useRouter';
import { useClientSession } from '@/components/core/session-context';
import { getFirstTeamLandingUrl } from '@/components/sidebar/team-landing-url';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export interface SecureHomePageProps {
  /** Path when the user has no teams or no landing URL. Default `/no-access`. */
  noAccessPath?: string;
}

/**
 * Redirects from `/home` to the first navigable team URL (same rules as the team switcher),
 * or to `noAccessPath` when there is nowhere to go.
 */
export function SecureHomePage({ noAccessPath = '/no-access' }: SecureHomePageProps) {
  const session = useClientSession();
  const router = useRouter();

  useEffect(() => {
    const teams = session?.teams ?? [];
    if (teams.length === 0) {
      router.push(noAccessPath);
      return;
    }
    const url = getFirstTeamLandingUrl(teams);
    if (url == null) {
      router.push(noAccessPath);
      return;
    }
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }, [session, router, noAccessPath]);

  return (
    <div className="flex h-full w-full items-center justify-center gap-2 bg-background">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading...
    </div>
  );
}
