'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from 'react';
import PageShell from '../../../../../components/core/page/page-shell';
const PageContent = lazy(() => import('./page-content'));
export function EmailRequestsPage() {
    return (_jsx(PageShell, { title: "Email Requests", noPadding: true, mustBeTabletOrDesktop: false, children: _jsx(PageContent, {}) }));
}
//# sourceMappingURL=email-requests-page.js.map