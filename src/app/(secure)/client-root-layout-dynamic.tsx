'use client';

import DefaultSecureLayout from '@/components/core/admin/default-secure-layout';
import UserConfirmation from '@/components/core/common/UserConfirmation';
import type { UserSession } from '@/lib/core/common/types/UserSession';
import ErrorBoundary from '@/components/core/common/ErrorBoundary';
import { useEffect } from 'react';
import { usePathname } from '@/components/core/hooks/usePathname';
import { useRouter } from '@/components/core/hooks/useRouter';
import { useSearchParams } from '@/components/core/hooks/useSearchParams';

export default function ClientRootLayout({
  children,
  session,
  hideSidebar,
}: Readonly<{
  children: React.ReactNode;
  session: UserSession | null;
  hideSidebar?: boolean;
}>) {
  if (!session) {
    return <ClientRedirect />;
  }

  return (
    <ErrorBoundary>
      <DefaultSecureLayout session={session} hideSidebar={hideSidebar}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <UserConfirmation />
      </DefaultSecureLayout>
    </ErrorBoundary>
  );
}

function ClientRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams().toString();

  useEffect(() => {
    const sourceUrl = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
    const redirectUrl = new URL('/login', window.location.origin);
    redirectUrl.searchParams.set('sourceUrl', sourceUrl);
    router.push(redirectUrl.toString());
  }, [router, pathname, searchParams]);

  return null;
}
