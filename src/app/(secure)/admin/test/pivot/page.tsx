'use client';

import { lazy } from 'react';
import PageShell from '@/components/core/page/page-shell';

const PageContent = lazy(() => import('./page-content'));

export default function UsersPivotPage() {
  return (
    <PageShell title="Users Pivot" noPadding>
      <PageContent />
    </PageShell>
  );
}
