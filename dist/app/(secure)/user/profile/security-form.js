'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Loader2 } from 'lucide-react';
import useActiveUserSessionsStore from './hooks/use-user-sessions-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { cn } from '../../../../lib/utils';
import { useState } from 'react';
import { useClientSession } from '../../../../components/core/session-context';
import { useDBRows } from '../../../../components/core/hooks/useStoreHooks';
import { useMutation } from '../../../../lib/core/client/useQuery';
export function SecurityForm() {
  const store = useActiveUserSessionsStore();
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const signOutOthers = useMutation('signOutOthers');
  return _jsxs(_Fragment, {
    children: [
      _jsxs(CardHeader, {
        className: 'shrink-0',
        children: [
          _jsx(CardTitle, { children: 'Security Settings' }),
          _jsx(CardDescription, { children: 'Manage your password and account security preferences.' }),
        ],
      }),
      _jsx(CardContent, {
        className:
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto',
        children: _jsxs('div', {
          className: 'space-y-4',
          children: [
            _jsxs('h3', {
              className: 'flex items-center justify-between font-medium text-lg',
              children: [
                'Active Sessions',
                _jsxs(Button, {
                  activityId: 'profile-signout-others',
                  variant: 'outline',
                  onClick: async () => {
                    setIsSigningOutOthers(true);
                    try {
                      await signOutOthers();
                      await store.refresh();
                    } finally {
                      setIsSigningOutOthers(false);
                    }
                  },
                  disabled: isSigningOutOthers,
                  children: [
                    isSigningOutOthers && _jsx(Loader2, { className: 'h-4 w-4 animate-spin' }),
                    ' Sign Out All Other Sessions',
                  ],
                }),
              ],
            }),
            _jsx(UserSessions, {}),
          ],
        }),
      }),
    ],
  });
}
function UserSessions() {
  const store = useActiveUserSessionsStore();
  const session = useClientSession();
  const sessions = useDBRows(store);
  if (sessions.length === 0) {
    return _jsx('p', { className: 'text-muted-foreground text-sm', children: 'No active sessions' });
  }
  return _jsxs(Table, {
    className: 'w-full',
    children: [
      _jsx(TableHeader, {
        children: _jsxs(TableRow, {
          children: [
            _jsx(TableHead, { className: 'w-44', children: 'IP Address' }),
            _jsx(TableHead, { children: 'User Agent' }),
            _jsx(TableHead, { className: 'w-44', children: 'Signed In' }),
            _jsx(TableHead, { className: 'w-44', children: 'Last Access' }),
          ],
        }),
      }),
      _jsx(TableBody, {
        children: sessions.map((s) =>
          _jsxs(
            TableRow,
            {
              children: [
                _jsx(TableCell, {
                  className: cn({
                    'relative before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-primary before:content-[""]':
                      s.sessionId === session?.id,
                  }),
                  children: s.ipAddress,
                }),
                _jsx(TableCell, { children: s.userAgent }),
                _jsx(TableCell, { children: new Date(s.signedInAt).toLocaleString() }),
                _jsx(TableCell, { children: new Date(s.lastAccessedAt).toLocaleString() }),
              ],
            },
            s.sessionId,
          ),
        ),
      }),
    ],
  });
}
//# sourceMappingURL=security-form.js.map
