/* Copyright (c) 2024-present Venky Corp. */

import PageShell from '@/components/core/page/page-shell';
import ActivityMonitor from '@/components/core/admin/activity-monitor';

export function ActivityMonitorPage() {
  return (
    <PageShell title="Activity Monitor" mustBeTabletOrDesktop={false}>
      <ActivityMonitor />
    </PageShell>
  );
}
