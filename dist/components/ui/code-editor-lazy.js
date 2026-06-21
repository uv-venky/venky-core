/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { lazy, Suspense } from 'react';
const CodeEditorLoading = () =>
  _jsx('div', {
    className: 'flex h-full w-full items-center justify-center bg-muted/50',
    children: _jsx('div', {
      className: 'h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent',
    }),
  });
/**
 * Lazy-loaded Monaco Code Editor component.
 * Use this instead of CodeEditor for better initial bundle size.
 */
const LazyCodeEditorInner = lazy(() => import('./code-editor').then((mod) => ({ default: mod.CodeEditor })));
export function LazyCodeEditor(props) {
  return _jsx(Suspense, { fallback: _jsx(CodeEditorLoading, {}), children: _jsx(LazyCodeEditorInner, { ...props }) });
}
//# sourceMappingURL=code-editor-lazy.js.map
