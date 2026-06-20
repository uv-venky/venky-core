'use client';

/* Copyright (c) 2024-present Venky Corp. */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSSEStatusWithDelay } from '@/lib/sse/client/use-sse';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SSE Connection Banner Component
 *
 * Displays a Gmail-like banner when SSE connection is lost, showing a countdown
 * to the next reconnect attempt. Automatically disappears when reconnected.
 */
export function SSEConnectionBanner() {
  const { status, reconnectDelayRemaining } = useSSEStatusWithDelay();

  // Calculate countdown in seconds from remaining milliseconds
  const countdown = reconnectDelayRemaining != null ? Math.ceil(reconnectDelayRemaining / 1000) : null;

  // Only show banner when there's an actual connection issue:
  // - 'error' status means connection was lost and we're trying to reconnect
  // - 'connecting' with a reconnect delay means we're actively reconnecting after an error
  // - 'disconnected' with a reconnect delay means we lost connection and are reconnecting
  // Don't show when 'connected' or 'disconnected' without reconnect delay (no subscriptions)
  const shouldShow = status === 'error' || status === 'disconnected' || status === 'connecting';

  if (!shouldShow || countdown == null) {
    return null;
  }

  const getStatusMessage = () => {
    if (status === 'connecting') {
      if (countdown !== null && countdown > 0) {
        return `Reconnecting in ${countdown} second${countdown !== 1 ? 's' : ''}...`;
      }
      return 'Reconnecting...';
    }
    if (status === 'error') {
      if (countdown !== null && countdown > 0) {
        return `Connection lost. Reconnecting in ${countdown} second${countdown !== 1 ? 's' : ''}...`;
      }
      return 'Connection lost. Reconnecting...';
    }
    if (status === 'disconnected') {
      return 'Connection lost.';
    }
    return 'Connection lost.';
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center transition-all duration-300',
        shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
      )}
    >
      <Alert
        variant="warning"
        className="flex max-w-2xl items-center gap-3 rounded-t-none border-yellow-500/50 border-t-0 bg-yellow-400 dark:bg-yellow-950/20"
      >
        <WifiOff className="size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="flex-1 text-yellow-900 dark:text-yellow-100">
          {getStatusMessage()}
        </AlertDescription>
      </Alert>
    </div>
  );
}
