/* Copyright (c) 2024-present Venky Corp. */

'use client';

import PageShell from '@/components/core/page/page-shell';
import SQLBrowser from '@/components/core/admin/sql-browser/SQLBrowser';

export function SQLBrowserPage() {
  return (
    <PageShell title="SQL Browser" noPadding>
      <SQLBrowser />
    </PageShell>
  );
}
