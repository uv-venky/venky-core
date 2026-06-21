import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2024-present Venky Corp. */
import SessionsMonitor from '../../../components/core/admin/sessions-monitor';
import PageShell from '../../../components/core/page/page-shell';
import PageLayout from '../../../components/core/page/PageLayout';
import { Shield } from 'lucide-react';
export function SessionsMonitorPage() {
  return _jsx(PageShell, {
    noPadding: true,
    title: 'User Sessions Monitor',
    mustBeTabletOrDesktop: false,
    children: _jsx(PageLayout, {
      icon: _jsx(Shield, { className: 'size-10 text-muted-foreground' }),
      title: 'User Sessions',
      subTitle: 'Track and manage active user sessions across your platform in real-time',
      transparentMainSection: true,
      children: _jsx(SessionsMonitor, {}),
    }),
  });
}
//# sourceMappingURL=SessionsMonitorPage.js.map
