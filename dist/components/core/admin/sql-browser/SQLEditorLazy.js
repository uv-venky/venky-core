/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
const SQLEditorLoading = () => (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-muted/50", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }));
/**
 * Lazy-loaded SQL Editor component.
 * Use this instead of SQLEditor for better initial bundle size.
 */
const LazySQLEditorInner = lazy(() => import('./SQLEditor'));
function LazySQLEditor(props) {
    return (_jsx(Suspense, { fallback: _jsx(SQLEditorLoading, {}), children: _jsx(LazySQLEditorInner, { ...props }) }));
}
export { LazySQLEditor };
//# sourceMappingURL=SQLEditorLazy.js.map