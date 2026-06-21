'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from 'react';
import PageShell from '../../../../components/core/page/page-shell';
const WVAuditPageContent = lazy(() => import('./page-content'));
export function WVAuditPage() {
    return (_jsx(PageShell, { title: "Wv Audit", noPadding: true, children: _jsx(WVAuditPageContent, {}) }));
}
//# sourceMappingURL=WVAuditPage.js.map