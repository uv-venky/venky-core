'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import useActiveUserSessionsStore from './hooks/use-user-sessions-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useClientSession } from '@/components/core/session-context';
import { useDBRows } from '@/components/core/hooks/useStoreHooks';
import { useMutation } from '@/lib/core/client/useQuery';

export function SecurityForm() {
  const store = useActiveUserSessionsStore();
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const signOutOthers = useMutation('signOutOthers');
  return (
    <>
      <CardHeader className="shrink-0">
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage your password and account security preferences.</CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto">
        {/* <div className="space-y-4">
          <h3 className="font-medium text-lg">Change Password</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button activityId="profile-update-password" className="w-full sm:w-auto">
              Update Password
            </Button>
          </div>
        </div> */}

        {/* <div className="space-y-4">
          <h3 className="font-medium text-lg">Two-Factor Authentication</h3>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Recommended</AlertTitle>
            <AlertDescription>Protect your account with an extra layer of security.</AlertDescription>
          </Alert>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
              <p className="text-muted-foreground text-sm">Require a verification code when signing in</p>
            </div>
            <Switch id="2fa" />
          </div>
        </div> */}

        {/* <div className="space-y-4">
          <h3 className="font-medium text-lg">API Keys</h3>
          <div className="rounded-md border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">Personal Access Token</p>
                <p className="text-muted-foreground text-sm">Created on March 3, 2025</p>
              </div>
              <div className="flex space-x-2">
                <Button activityId="profile-copy-api-token" variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button activityId="profile-revoke-api-token" variant="outline" size="sm" className="text-destructive">
                  Revoke
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <Input value="sk_live_•••••••••••••••••••••••••••••" readOnly className="font-mono" />
            </div>
          </div>
          <Button activityId="profile-generate-api-key" variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Generate New API Key
          </Button>
        </div> */}

        <div className="space-y-4">
          <h3 className="flex items-center justify-between font-medium text-lg">
            Active Sessions
            <Button
              activityId="profile-signout-others"
              variant="outline"
              onClick={async () => {
                setIsSigningOutOthers(true);
                try {
                  await signOutOthers();
                  await store.refresh();
                } finally {
                  setIsSigningOutOthers(false);
                }
              }}
              disabled={isSigningOutOthers}
            >
              {isSigningOutOthers && <Loader2 className="h-4 w-4 animate-spin" />} Sign Out All Other Sessions
            </Button>
          </h3>
          <UserSessions />
        </div>
      </CardContent>
    </>
  );
}

function UserSessions() {
  const store = useActiveUserSessionsStore();
  const session = useClientSession();
  const sessions = useDBRows(store);
  if (sessions.length === 0) {
    return <p className="text-muted-foreground text-sm">No active sessions</p>;
  }
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-44">IP Address</TableHead>
          <TableHead>User Agent</TableHead>
          <TableHead className="w-44">Signed In</TableHead>
          <TableHead className="w-44">Last Access</TableHead>
          {/* <TableHead>Signed Out</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (
          <TableRow key={s.sessionId}>
            <TableCell
              className={cn({
                'relative before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-primary before:content-[""]':
                  s.sessionId === session?.id,
              })}
            >
              {s.ipAddress}
            </TableCell>
            <TableCell>{s.userAgent}</TableCell>
            <TableCell>{new Date(s.signedInAt).toLocaleString()}</TableCell>
            <TableCell>{new Date(s.lastAccessedAt).toLocaleString()}</TableCell>
            {/* <TableCell>{s.signedOutAt ? new Date(s.signedOutAt).toLocaleString() : '-'}</TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
