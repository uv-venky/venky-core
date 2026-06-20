'use client';

import { lazy } from 'react';
import PageShell from '@/components/core/page/page-shell';

const PageContent = lazy(() => import('./page-content'));

export default function PivotStaticPage() {
  return (
    <PageShell title="Pivot (Static Sample)" noPadding>
      <PageContent />
    </PageShell>
  );
}
