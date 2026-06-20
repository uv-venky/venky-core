'use client';

import { lazy } from 'react';
import PageShell from '@/components/core/page/page-shell';

const PageContent = lazy(() => import('./page-content'));

export function EmailRequestsPage() {
  return (
    <PageShell title="Email Requests" noPadding mustBeTabletOrDesktop={false}>
      <PageContent />
    </PageShell>
  );
}
