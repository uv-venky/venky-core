'use client';

import { lazy } from 'react';
import PageShell from '@/components/core/page/page-shell';

const WVAuditPageContent = lazy(() => import('./page-content'));

export function WVAuditPage() {
  return (
    <PageShell title="Wv Audit" noPadding>
      <WVAuditPageContent />
    </PageShell>
  );
}
