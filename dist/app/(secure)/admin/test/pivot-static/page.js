'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from 'react';
import PageShell from '../../../../../components/core/page/page-shell';
const PageContent = lazy(() => import('./page-content'));
export default function PivotStaticPage() {
    return (_jsx(PageShell, { title: "Pivot (Static Sample)", noPadding: true, children: _jsx(PageContent, {}) }));
}
//# sourceMappingURL=page.js.map