/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error.message || 'An unexpected error occurred. Please try again.'}</AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
