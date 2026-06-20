/* Copyright (c) 2024-present Venky Corp. */

import { camelCase, startCase } from 'lodash-es';
import type { State } from '../../types';

export default ({ dsName, template }: State): string => {
  const dsTitle = startCase(camelCase(dsName));

  return `/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { lazy, Suspense } ${'from'} 'react';
import { Suspended } ${'from'} '@/components/core/common';
import { PageShell } ${'from'} '@/components/core/page';

const PageContent = lazy(() => import('./page-content'));

export default function Page() {

  return (
    <PageShell title="${dsTitle}"${template === 'page-layout' ? ' noPadding' : ''}>
      <Suspense fallback={<Suspended name="${dsName} Page" />}>
        <PageContent />
      </Suspense>
    </PageShell>
  );
}
`;
};
