/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { lazy } from 'react';
import PageShell from '@/components/core/page/page-shell';

const PageContent = lazy(() => import('./page-content'));

export function JobsPage() {
  return (
    <PageShell title="Job Command Center" noPadding mustBeTabletOrDesktop={false}>
      <PageContent />
    </PageShell>
  );
}
