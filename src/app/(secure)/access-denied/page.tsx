'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/components/core/link';
import clientLogger from '@/lib/core/client/client-logger';
import { useEffect } from 'react';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { useManualReadySignal } from '@/lib/core/client/loading-tracker';

export default function AccessDenied() {
  const searchParams = useSearchParams();
  const path = searchParams.get('path') ?? 'unknown-path';
  const signalReady = useManualReadySignal();

  useEffect(() => {
    async function runLogActivity() {
      await clientLogger.logActivity({
        eventType: 'Access Denied',
        eventId: path,
      });
    }
    runLogActivity();
  }, [path]);

  useEffect(() => {
    signalReady();
  }, [signalReady]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl text-muted-foreground tracking-tighter">Access Denied</h1>
          <h2 className="font-bold text-muted-foreground text-xl tracking-tight">
            You do not have access to this page!
          </h2>
          <p className="text-muted-foreground">{`Please contact your administrator to get access to this page.`}</p>
        </div>

        <Button activityId="404-back-home" asChild size="lg" className="gap-2">
          <Link prefetch={false} href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
