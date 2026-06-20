/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { lazy, Suspense, type ComponentProps } from 'react';
import type { SQLEditorProps } from './SQLEditor';

const SQLEditorLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted/50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Lazy-loaded SQL Editor component.
 * Use this instead of SQLEditor for better initial bundle size.
 */
const LazySQLEditorInner = lazy(() => import('./SQLEditor'));

function LazySQLEditor(props: ComponentProps<typeof LazySQLEditorInner>) {
  return (
    <Suspense fallback={<SQLEditorLoading />}>
      <LazySQLEditorInner {...props} />
    </Suspense>
  );
}

export { LazySQLEditor };
export type { SQLEditorProps };
