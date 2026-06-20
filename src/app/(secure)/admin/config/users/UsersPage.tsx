/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { ReactNode } from 'react';
import PageShell from '@/components/core/page/page-shell';
import PageContent from './page-content';

export function UsersPage(props: { toolbarContent?: ReactNode }) {
  return (
    <PageShell title="Users" noPadding mustBeTabletOrDesktop={false}>
      <PageContent {...props} />
    </PageShell>
  );
}
