'use client';

import PageShell from '@/components/core/page/page-shell';
import CachePageContent from './page-content';

export function CacheDashboard() {
  return (
    <PageShell noPadding title="Cache Dashboard" mustBeTabletOrDesktop={false}>
      <CachePageContent />
    </PageShell>
  );
}
