/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ClientRootLayout from '../../app/(secure)/client-root-layout';
import { Button } from '../../components/ui/button';
import { useMutation, useQuery } from '../../lib/core/client/useQuery';
import { ErrorCard } from '../../components/core/common';
import { BaseAppProvider } from './app-provider-base';
export { useAppContext, useDeployConfig, useAppSidebarContext, AppContext } from './app-provider-base';
const LOADING_SHELL = _jsxs('div', {
  className: 'flex h-full w-full items-center justify-center gap-2 bg-background',
  children: [_jsx(Loader2, { className: 'h-4 w-4 animate-spin' }), ' Loading...'],
});
export function AppProvider({ hideSidebar, children, ...props }) {
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
    return _jsxs('div', {
      className: 'flex h-full w-full flex-col items-center justify-center gap-3 p-4',
      children: [
        _jsx('div', { className: 'w-full max-w-2xl [&>div]:h-auto', children: _jsx(ErrorCard, { children: error }) }),
        _jsx(Button, {
          activityId: 'app-provider-session-error-sign-out',
          type: 'button',
          variant: 'link',
          className: 'text-sm',
          onClick: async () => {
            const redirectTo = await signOutMutation();
            window.location.href = redirectTo ?? '/login';
          },
          children: 'Sign out',
        }),
      ],
    });
  }
  if (isLoading || !isSuccess) {
    return LOADING_SHELL;
  }
  const session = sessionResult.data;
  return _jsx(Suspense, {
    fallback: LOADING_SHELL,
    children: _jsx(BaseAppProvider, {
      ...props,
      children: _jsx(ClientRootLayout, { session: session, hideSidebar: hideSidebar, children: children }),
    }),
  });
}
//# sourceMappingURL=app-provider.js.map
