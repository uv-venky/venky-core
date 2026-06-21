/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { lazy, Suspense } from 'react';
const MonacoEditorLoading = () =>
  _jsx('div', {
    className: 'flex h-full w-full items-center justify-center bg-muted/50',
    children: _jsx('div', {
      className: 'h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent',
    }),
  });
/**
 * Lazy-loaded Monaco Editor component for API Playground.
 * Use this instead of MonacoEditor for better initial bundle size.
 */
const LazyMonacoEditorInner = lazy(() => import('./MonacoEditor'));
function LazyMonacoEditor(props) {
  return _jsx(Suspense, {
    fallback: _jsx(MonacoEditorLoading, {}),
    children: _jsx(LazyMonacoEditorInner, { ...props }),
  });
}
export { LazyMonacoEditor };
//# sourceMappingURL=MonacoEditorLazy.js.map
