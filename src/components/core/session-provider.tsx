'use client';

import { deepUnwrap } from '@/lib/core/common/deepUtils';
import { areEqualShallow } from '@/lib/core/common/isEmpty';
import type { UserSession } from '@/lib/core/common/types/UserSession';
import type { UserSettings } from '@/lib/core/common/types/UserSettings';
import { type ReactNode, useEffect, useState } from 'react';
import { proxy, subscribe } from 'valtio';
import { userSessionState } from '@/components/core/hooks/useClientSessionSnapshot';
import { SessionContext } from '@/components/core/session-context';

export function SessionProvider({
  children,
  session: initialSession,
  onSettingsChange,
}: {
  children: ReactNode;
  session: UserSession;
  onSettingsChange?: (key: keyof UserSettings, value: unknown) => void;
}) {
  const [session, setSession] = useState<UserSession>(initialSession);

  useEffect(() => {
    // break readonly/frozen/server reference
    const mutableSession = deepUnwrap(initialSession);
    // ensure valtio owns nested graph
    userSessionState.session = proxy<UserSession>(mutableSession);
  }, [initialSession]);

  useEffect(() => {
    return subscribe(userSessionState, () => {
      if (userSessionState.session) {
        setSession({ ...userSessionState.session });
      }
    });
  }, []);

  useEffect(() => {
    if (!onSettingsChange) return;
    let previousSettings = deepUnwrap(userSessionState.session?.settings);
    return subscribe(userSessionState, () => {
      const newSettings = userSessionState.session?.settings;
      if (newSettings && !areEqualShallow(previousSettings, newSettings)) {
        for (const key in newSettings) {
          // @ts-expect-error - key is valid
          const value = newSettings[key];
          // @ts-expect-error - key is valid
          const oldValue = previousSettings?.[key];
          if (value !== oldValue) {
            onSettingsChange(key as keyof UserSettings, value);
          }
        }
        previousSettings = deepUnwrap(newSettings);
      }
    });
  }, [onSettingsChange]);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
