'use client';

import { lazy } from 'react';
import type { UserSession } from '@/lib/core/common/types/UserSession';

const ClientRootLayoutDynamic = lazy(() => import('./client-root-layout-dynamic'));

export default function ClientRootLayout({
  children,
  session,
  hideSidebar,
}: Readonly<{
  children: React.ReactNode;
  session: UserSession | null;
  hideSidebar?: boolean;
}>) {
  return (
    <ClientRootLayoutDynamic session={session} hideSidebar={hideSidebar}>
      {children}
    </ClientRootLayoutDynamic>
  );
}
