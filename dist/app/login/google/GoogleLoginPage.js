/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { useSearchParams } from '../../../components/core/hooks/useSearchParams';
import { authenticateToken } from '../actions';
import { showError } from '../../../components/core/common/Notification';
import { getErrorMessage } from '../../../lib/core/common/error';
import { Link } from '../../../components/core/link';
import { useRouter } from '../../../components/core/hooks/useRouter';
import { Loader2 } from 'lucide-react';
import { isNotEmpty } from '../../../lib/core/common/isEmpty';
export function GoogleLoginPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const returnUrl = searchParams.get('returnUrl');
  const [error, setError] = useState(token ? null : 'Missing token!');
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
    return _jsxs('div', {
      className: 'flex h-screen flex-col items-center justify-center gap-4 bg-background',
      children: [
        _jsx('div', { className: 'text-destructive', children: error }),
        _jsx(Link, { href: '/login', className: 'text-primary underline', children: 'Return to login' }),
      ],
    });
  }
  return _jsxs('div', {
    className: 'flex h-screen items-center justify-center bg-background text-foreground',
    children: [_jsx(Loader2, { className: 'mr-4 animate-spin' }), 'Signing in with Google...'],
  });
}
//# sourceMappingURL=GoogleLoginPage.js.map
