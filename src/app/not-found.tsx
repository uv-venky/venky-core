/* Copyright (c) 2024-present Venky Corp. */

import { AlertCircle } from 'lucide-react';
import { Link } from '@/components/core/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Page Not Found</AlertTitle>
        <AlertDescription>The page you are looking for does not exist or has been moved.</AlertDescription>
      </Alert>
      <Button asChild variant="outline">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
