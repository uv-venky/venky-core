/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { lazy, Suspense, type ComponentProps } from 'react';
import type { EditorProps } from '@monaco-editor/react';

const CodeEditorLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted/50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Lazy-loaded Monaco Code Editor component.
 * Use this instead of CodeEditor for better initial bundle size.
 */
const LazyCodeEditorInner = lazy(() => import('./code-editor').then((mod) => ({ default: mod.CodeEditor })));

export function LazyCodeEditor(props: ComponentProps<typeof LazyCodeEditorInner>) {
  return (
    <Suspense fallback={<CodeEditorLoading />}>
      <LazyCodeEditorInner {...props} />
    </Suspense>
  );
}

export type { EditorProps };
