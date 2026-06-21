/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from 'react';
import PageShell from '../../../../../components/core/page/page-shell';
const PageContent = lazy(() => import('./page-content'));
export function JobsPage() {
    return (_jsx(PageShell, { title: "Job Command Center", noPadding: true, mustBeTabletOrDesktop: false, children: _jsx(PageContent, {}) }));
}
//# sourceMappingURL=JobsPage.js.map