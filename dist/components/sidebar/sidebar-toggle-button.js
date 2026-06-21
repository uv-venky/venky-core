/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from 'react/jsx-runtime';
import { SidebarTrigger, useSidebar } from '../../components/ui/sidebar';
import { useClientSession } from '../../components/core/session-context';
import { userSessionState } from '../../components/core/hooks/useClientSessionSnapshot';
import { cn } from '../../lib/utils';
export function SidebarToggleButton() {
  const session = useClientSession();
  const { isMobile } = useSidebar();
  if (isMobile) {
    return null;
  }
  return _jsx('div', {
    className: cn(
      'absolute top-1/2 -right-4 z-50 -translate-y-1/2 transition-all duration-300 ease-in-out',
      'opacity-0',
      'group-hover/sidebar:opacity-100',
    ),
    'data-sidebar': 'toggle-button',
    children: _jsx(SidebarTrigger, {
      className: 'h-7 w-7',
      onClick: () => {
        userSessionState.session.settings.sidebarOpen = !(session.settings.sidebarOpen ?? true);
      },
    }),
  });
}
//# sourceMappingURL=sidebar-toggle-button.js.map
