'use client';

/* Copyright (c) 2024-present Venky Corp. */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVersionCheck } from '@/lib/core/client/use-version-check';
import { useSSEStatusWithDelay } from '@/lib/sse/client/use-sse';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Version Update Banner Component
 *
 * Displays a Gmail-like banner when a new version of the app has been deployed,
 * asking users to save their work and refresh the browser.
 */
export function VersionUpdateBanner() {
  const { hasNewVersion } = useVersionCheck();
  const { status } = useSSEStatusWithDelay();

  // Check if SSE banner is showing
  const sseBannerVisible = status === 'error' || status === 'connecting' || status === 'disconnected';

  if (!hasNewVersion) {
    return null;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  // Position below SSE banner if it's visible (approximately 56px height)
  const topOffset = sseBannerVisible ? '56px' : '0';

  return (
    <div
      className={cn(
        'fixed left-1/2 z-[49] flex -translate-x-1/2 items-center justify-center transition-all duration-300',
        hasNewVersion ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
      )}
      style={{ top: topOffset }}
    >
      <Alert
        variant="warning"
        className="flex max-w-2xl items-center gap-3 rounded-t-none border-yellow-500/50 border-t-0 bg-yellow-50 dark:bg-yellow-950/20"
      >
        <RefreshCw className="size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="flex-1 text-yellow-900 dark:text-yellow-100">
          A new version is available. Please save your work and refresh the page.
        </AlertDescription>
        <Button onClick={handleRefresh} size="sm" variant="outline">
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </Alert>
    </div>
  );
}
