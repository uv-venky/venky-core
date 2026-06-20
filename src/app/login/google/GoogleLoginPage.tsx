/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { authenticateToken } from '../actions';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';
import { Link } from '@/components/core/link';
import { useRouter } from '@/components/core/hooks/useRouter';
import { Loader2 } from 'lucide-react';
import { isNotEmpty } from '@/lib/core/common/isEmpty';

export function GoogleLoginPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const returnUrl = searchParams.get('returnUrl');
  const [error, setError] = useState<string | null>(token ? null : 'Missing token!');
  const router = useRouter();

  useEffect(() => {
    const tkn = token ?? '';
    if (isNotEmpty(tkn)) {
      async function signInWithToken() {
        try {
          const result = await authenticateToken(tkn);
          if (result.status === 'ERROR') {
            setError(result.message);
          } else {
            router.push(returnUrl ?? '/');
          }
        } catch (error) {
          showError(getErrorMessage(error));
        }
      }
      signInWithToken();
    }
  }, [token, router, returnUrl]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="text-destructive">{error}</div>
        <Link href="/login" className="text-primary underline">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <Loader2 className="mr-4 animate-spin" />
      Signing in with Google...
    </div>
  );
}
