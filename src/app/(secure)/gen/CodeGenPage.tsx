'use client';

import PageShell from '@/components/core/page/page-shell';
import PageContent, { type Props } from './page-content';

export function CodeGenPage(props: Props) {
  return (
    <PageShell title="Code Generator">
      {process.env.NODE_ENV === 'development' ? (
        <PageContent {...props} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="font-bold text-2xl">Code Generator Page is only available in development mode</div>
        </div>
      )}
    </PageShell>
  );
}
