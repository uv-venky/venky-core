/* Copyright (c) 2024-present Venky Corp. */

import AuditDashboard from '@/components/core/admin/audit-dashboard';
import PageShell from '@/components/core/page/page-shell';
import PageLayout from '@/components/core/page/PageLayout';
import { ShieldCheck } from 'lucide-react';

export function AuditDashboardPage() {
  return (
    <PageShell noPadding title="Data Audit Monitor" mustBeTabletOrDesktop={false}>
      <PageLayout
        icon={<ShieldCheck className="size-10 text-muted-foreground" />}
        title="Data Audit"
        subTitle="Track and review all data changes across your system in real-time"
        transparentMainSection
      >
        <AuditDashboard />
      </PageLayout>
    </PageShell>
  );
}
