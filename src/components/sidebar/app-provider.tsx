/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import ClientRootLayout from '@/app/(secure)/client-root-layout';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@/lib/core/client/useQuery';
import { ErrorCard } from '@/components/core/common';
import { BaseAppProvider, type AppContextValue } from './app-provider-base';

export {
  type AppContextValue,
  useAppContext,
  type CustomMiniLogoProps,
  useDeployConfig,
  useAppSidebarContext,
  AppContext,
} from './app-provider-base';

const LOADING_SHELL = (
  <div className="flex h-full w-full items-center justify-center gap-2 bg-background">
    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
  </div>
);

export interface AppProviderProps extends Partial<AppContextValue> {
  hideSidebar?: boolean;
  children: ReactNode;
}

export function AppProvider({ hideSidebar, children, ...props }: AppProviderProps) {
  const [mounted, setMounted] = useState(false);
  const sessionResult = useQuery('getUserSession');
  const signOutMutation = useMutation('signOut');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return LOADING_SHELL;
  }

  const error = sessionResult.status === 'error' ? sessionResult.error : null;
  const isLoading = sessionResult.status === 'loading';
  const isSuccess = sessionResult.status === 'success';

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4">
        <div className="w-full max-w-2xl [&>div]:h-auto">
          <ErrorCard>{error}</ErrorCard>
        </div>
        <Button
          activityId="app-provider-session-error-sign-out"
          type="button"
          variant="link"
          className="text-sm"
          onClick={async () => {
            const redirectTo = await signOutMutation();
            window.location.href = redirectTo ?? '/login';
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  if (isLoading || !isSuccess) {
    return LOADING_SHELL;
  }

  const session = sessionResult.data;

  return (
    <Suspense fallback={LOADING_SHELL}>
      <BaseAppProvider {...props}>
        <ClientRootLayout session={session} hideSidebar={hideSidebar}>
          {children}
        </ClientRootLayout>
      </BaseAppProvider>
    </Suspense>
  );
}
