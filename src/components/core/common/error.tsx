'use client';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ErrorCard({ children }: { children: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    </div>
  );
}
