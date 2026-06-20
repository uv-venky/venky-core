/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { lazy, Suspense, type ComponentProps } from 'react';

const MonacoEditorLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted/50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

interface MonacoEditorProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  datasourceId?: string;
  type: 'Query' | 'Post' | 'Result';
}

/**
 * Lazy-loaded Monaco Editor component for API Playground.
 * Use this instead of MonacoEditor for better initial bundle size.
 */
const LazyMonacoEditorInner = lazy(() => import('./MonacoEditor'));

function LazyMonacoEditor(props: ComponentProps<typeof LazyMonacoEditorInner>) {
  return (
    <Suspense fallback={<MonacoEditorLoading />}>
      <LazyMonacoEditorInner {...props} />
    </Suspense>
  );
}

export { LazyMonacoEditor };
export type { MonacoEditorProps };
