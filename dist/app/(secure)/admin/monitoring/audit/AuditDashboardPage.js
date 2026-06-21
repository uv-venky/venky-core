import { jsx as _jsx } from "react/jsx-runtime";
/* Copyright (c) 2024-present Venky Corp. */
import AuditDashboard from '../../../../../components/core/admin/audit-dashboard';
import PageShell from '../../../../../components/core/page/page-shell';
import PageLayout from '../../../../../components/core/page/PageLayout';
import { ShieldCheck } from 'lucide-react';
export function AuditDashboardPage() {
    return (_jsx(PageShell, { noPadding: true, title: "Data Audit Monitor", mustBeTabletOrDesktop: false, children: _jsx(PageLayout, { icon: _jsx(ShieldCheck, { className: "size-10 text-muted-foreground" }), title: "Data Audit", subTitle: "Track and review all data changes across your system in real-time", transparentMainSection: true, children: _jsx(AuditDashboard, {}) }) }));
}
//# sourceMappingURL=AuditDashboardPage.js.map