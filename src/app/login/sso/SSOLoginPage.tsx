'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';
import { authenticateToken } from '../actions';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';
import { useRouter } from '@/components/core/hooks/useRouter';
import { Loader2 } from 'lucide-react';
import { isNotEmpty } from '@/lib/core/common/isEmpty';

export function SSOLoginPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const relayState = searchParams.get('RelayState');
  const [error, setError] = useState<string | null>(token ? null : 'Missing token!');
  const router = useRouter();

  useEffect(() => {
    const tkn = token ?? '';
    if (isNotEmpty(tkn)) {
      async function signInWithToken() {
        try {
          const result = await authenticateToken(tkn, relayState);
          if (result.status === 'ERROR') {
            setError(result.message);
          } else {
            router.push(relayState ?? '/');
          }
        } catch (error) {
          showError(getErrorMessage(error));
        }
      }
      signInWithToken();
    }
  }, [token, router, relayState]);

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-background text-destructive">{error}</div>;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <Loader2 className="mr-4 animate-spin" />
      Signing in...
    </div>
  );
}
