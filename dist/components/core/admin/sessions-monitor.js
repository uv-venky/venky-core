/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useStore } from '../../../lib/core/client/store';
import { isAfter, parseISO, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
  Activity,
  BarChart3,
  Table2,
  Globe,
  Laptop,
} from 'lucide-react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Suspended from '../../../components/core/common/Suspended';
import { useDBRows, useIsStoreBusy, useStoreError } from '../../../components/core/hooks/useStoreHooks';
import { Filters } from '../../../components/core/page';
import DataTable from '../../../components/core/page/table';
import useTable from '../../../components/core/page/useTable';
import SessionsChart from '../../../components/core/admin/sessions-chart';
import useSmartSearchColumns from '../../../components/core/admin/useSmartSearchColumns';
import useTableColumns from '../../../components/core/admin/useTableColumns';
import { cn } from '../../../lib/utils';
import { Badge } from '../../../components/ui/badge';
const STATUS_CONFIG = {
  active: { icon: ShieldCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Active' },
  expired: { icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Expired' },
  'signed-out': { icon: LogOut, color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Signed Out' },
};
function getSessionStatus(session) {
  const now = new Date();
  const expiresAt = parseISO(session.expiresAt);
  if (session.signedOutAt) {
    return 'signed-out';
  } else if (isAfter(now, expiresAt)) {
    return 'expired';
  }
  return 'active';
}
function calculateStats(sessions) {
  const stats = {
    total: sessions.length,
    active: 0,
    expired: 0,
    signedOut: 0,
    uniqueUsers: 0,
    uniqueIPs: 0,
  };
  const uniqueUsers = new Set();
  const uniqueIPs = new Set();
  for (const session of sessions) {
    const status = getSessionStatus(session);
    if (status === 'active') stats.active++;
    else if (status === 'expired') stats.expired++;
    else stats.signedOut++;
    if (session.userName) uniqueUsers.add(session.userName);
    if (session.ipAddress) uniqueIPs.add(session.ipAddress);
  }
  stats.uniqueUsers = uniqueUsers.size;
  stats.uniqueIPs = uniqueIPs.size;
  return stats;
}
// Pulsing status indicator for live active sessions
function LiveIndicator({ isActive }) {
  if (!isActive) return null;
  return _jsxs('span', {
    className: 'relative flex size-2.5',
    children: [
      _jsx('span', {
        className: 'absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75',
      }),
      _jsx('span', { className: 'relative inline-flex size-2.5 rounded-full bg-emerald-500' }),
    ],
  });
}
// Stat card component
function StatCard({ icon: Icon, label, value, subValue, color, bgColor, accentColor, isLive }) {
  return _jsxs('div', {
    className:
      'group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg',
    children: [
      _jsxs('div', {
        className: 'flex items-start justify-between',
        children: [
          _jsxs('div', {
            className: 'space-y-2',
            children: [
              _jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  _jsx('p', { className: 'text-muted-foreground text-sm', children: label }),
                  isLive && _jsx(LiveIndicator, { isActive: true }),
                ],
              }),
              _jsx('p', { className: 'font-semibold text-3xl tracking-tight', children: value }),
              subValue && _jsx('p', { className: 'text-muted-foreground text-xs', children: subValue }),
            ],
          }),
          _jsx('div', {
            className: cn('rounded-lg p-2.5', bgColor),
            children: _jsx(Icon, { className: cn('size-5', color) }),
          }),
        ],
      }),
      _jsx('div', { className: cn('absolute inset-x-0 bottom-0 h-1 opacity-50', accentColor) }),
    ],
  });
}
export default function SessionsMonitor() {
  const store = useStore({
    datasourceId: 'UserSessions',
    page: 'user-sessions-page',
    alias: 'user-sessions-all',
    limit: 2000,
    includeCount: true,
    onInitialized: async (store) => {
      await store.executeQuery({
        query: {},
      });
    },
  });
  const sessions = useDBRows(store);
  const isRefreshing = useIsStoreBusy(store);
  const error = useStoreError(store);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const tableColumns = useTableColumns(store);
  const smartSearchColumns = useSmartSearchColumns();
  const table = useTable({
    store,
    tableColumns,
  });
  const handleRefresh = useCallback(() => {
    store?.refresh();
    setLastRefresh(new Date());
  }, [store]);
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);
  const stats = calculateStats(sessions);
  if (error) {
    return _jsx('div', {
      className: 'flex flex-1 items-center justify-center p-8',
      children: _jsxs('div', {
        className:
          'max-w-md rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5 p-8 text-center backdrop-blur-sm',
        children: [
          _jsx('div', {
            className: 'mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10',
            children: _jsx(AlertTriangle, { className: 'size-8 text-red-400' }),
          }),
          _jsx('h3', { className: 'mb-2 font-semibold text-lg', children: 'Error Loading Sessions' }),
          _jsx('p', { className: 'mb-6 text-muted-foreground text-sm', children: error }),
          _jsxs(Button, {
            onClick: handleRefresh,
            variant: 'outline',
            className: 'gap-2',
            children: [_jsx(RefreshCw, { className: 'size-4' }), 'Try Again'],
          }),
        ],
      }),
    });
  }
  return _jsxs('div', {
    className: 'flex flex-1 flex-col gap-6 overflow-hidden',
    children: [
      _jsxs('div', {
        className: 'grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6',
        children: [
          _jsx(StatCard, {
            icon: Users,
            label: 'Total Sessions',
            value: stats.total,
            subValue: `${stats.uniqueUsers} unique users`,
            color: 'text-slate-400',
            bgColor: 'bg-slate-500/10',
            accentColor: 'bg-slate-500',
          }),
          _jsx(StatCard, {
            icon: ShieldCheck,
            label: 'Active Sessions',
            value: stats.active,
            subValue: 'Currently online',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            accentColor: 'bg-emerald-500',
            isLive: stats.active > 0,
          }),
          _jsx(StatCard, {
            icon: Clock,
            label: 'Expired Sessions',
            value: stats.expired,
            subValue: 'Timed out',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            accentColor: 'bg-amber-500',
          }),
          _jsx(StatCard, {
            icon: LogOut,
            label: 'Signed Out',
            value: stats.signedOut,
            subValue: 'Logged out manually',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            accentColor: 'bg-blue-500',
          }),
          _jsx(StatCard, {
            icon: Globe,
            label: 'Unique IPs',
            value: stats.uniqueIPs,
            subValue: 'Distinct locations',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            accentColor: 'bg-purple-500',
          }),
          _jsx(StatCard, {
            icon: Laptop,
            label: 'Active Rate',
            value: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%',
            subValue: 'Of all sessions',
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
            accentColor: 'bg-rose-500',
          }),
        ],
      }),
      _jsxs(Tabs, {
        defaultValue: 'table',
        className: 'flex flex-1 flex-col overflow-hidden',
        children: [
          _jsxs('div', {
            className:
              'mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-gradient-to-r from-card/60 to-card/30 p-3 backdrop-blur-sm',
            children: [
              _jsxs(TabsList, {
                className: 'shrink-0 bg-background/50 p-1',
                children: [
                  _jsxs(TabsTrigger, {
                    value: 'table',
                    className: 'gap-2',
                    children: [_jsx(Table2, { className: 'size-4' }), 'Table'],
                  }),
                  _jsxs(TabsTrigger, {
                    value: 'analytics',
                    className: 'gap-2',
                    children: [_jsx(BarChart3, { className: 'size-4' }), 'Analytics'],
                  }),
                ],
              }),
              _jsx('div', { className: 'h-6 w-px bg-border/50' }),
              _jsx('div', {
                className: 'min-w-0 flex-1',
                children: _jsx(Suspense, {
                  fallback: _jsx(Suspended, { name: 'Filters' }),
                  children: _jsx(Filters, {
                    border: 'none',
                    store: store,
                    table: table,
                    columns: smartSearchColumns,
                    pageId: 'user-sessions-page',
                    itemId: 'user-sessions',
                    disableSavedSearches: true,
                  }),
                }),
              }),
              _jsx('div', { className: 'h-6 w-px bg-border/50' }),
              _jsxs('button', {
                type: 'button',
                onClick: () => setAutoRefresh(!autoRefresh),
                className: cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors',
                  autoRefresh
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                ),
                children: [
                  _jsx(Activity, { className: cn('size-3.5', autoRefresh && 'animate-pulse') }),
                  'Auto-refresh ',
                  autoRefresh ? 'on' : 'off',
                ],
              }),
              _jsxs('div', {
                className: 'flex items-center gap-2 text-muted-foreground text-xs',
                children: [
                  _jsx(Clock, { className: 'size-3.5' }),
                  _jsxs('span', { children: ['Updated ', formatDistanceToNow(lastRefresh, { addSuffix: true })] }),
                ],
              }),
              _jsxs(Button, {
                variant: 'outline',
                size: 'sm',
                className: 'gap-2',
                onClick: handleRefresh,
                disabled: isRefreshing,
                children: [_jsx(RefreshCw, { className: cn('size-4', isRefreshing && 'animate-spin') }), 'Refresh'],
              }),
            ],
          }),
          _jsx(TabsContent, {
            value: 'table',
            className: 'mt-0 flex-1',
            children: _jsx('div', {
              className:
                'flex h-full flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
              children: _jsx(DataTable, { table: table, store: store, smartSearchColumns: smartSearchColumns }),
            }),
          }),
          _jsx(TabsContent, {
            value: 'analytics',
            className:
              'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 mt-0 flex-1 overflow-auto',
            children: _jsxs('div', {
              className: 'space-y-6',
              children: [
                _jsx('div', {
                  className: 'grid gap-4 md:grid-cols-3',
                  children: ['active', 'expired', 'signed-out'].map((status) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const count =
                      status === 'active' ? stats.active : status === 'expired' ? stats.expired : stats.signedOut;
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return _jsxs(
                      'div',
                      {
                        className:
                          'relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm',
                        children: [
                          _jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              _jsxs('div', {
                                className: 'flex items-center gap-3',
                                children: [
                                  _jsx('div', {
                                    className: cn('rounded-xl p-3', config.bgColor),
                                    children: _jsx(Icon, { className: cn('size-6', config.color) }),
                                  }),
                                  _jsxs('div', {
                                    children: [
                                      _jsx('h4', { className: 'font-medium', children: config.label }),
                                      _jsxs('p', {
                                        className: 'text-muted-foreground text-sm',
                                        children: [count, ' sessions'],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              _jsx('div', {
                                className: 'text-right',
                                children: _jsxs(Badge, {
                                  variant: 'secondary',
                                  className: cn('font-mono text-lg', config.color, config.bgColor),
                                  children: [percentage, '%'],
                                }),
                              }),
                            ],
                          }),
                          _jsx('div', {
                            className: 'mt-4 h-2 overflow-hidden rounded-full bg-muted/50',
                            children: _jsx('div', {
                              className: cn('h-full rounded-full transition-all duration-500', config.bgColor),
                              style: {
                                width: `${percentage}%`,
                                backgroundColor: `hsl(var(--${status === 'active' ? 'chart-2' : status === 'expired' ? 'chart-3' : 'chart-1'}))`,
                              },
                            }),
                          }),
                        ],
                      },
                      status,
                    );
                  }),
                }),
                _jsxs('div', {
                  className:
                    'rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
                  children: [
                    _jsx('div', {
                      className: 'border-border/50 border-b px-6 py-4',
                      children: _jsxs('div', {
                        className: 'flex items-center gap-3',
                        children: [
                          _jsx('div', {
                            className: 'flex size-8 items-center justify-center rounded-lg bg-primary/10',
                            children: _jsx(BarChart3, { className: 'size-4 text-primary' }),
                          }),
                          _jsxs('div', {
                            children: [
                              _jsx('h3', { className: 'font-semibold text-sm', children: 'Sessions Analytics' }),
                              _jsx('p', {
                                className: 'text-muted-foreground text-xs',
                                children: 'Visual breakdown of session activity and browser distribution',
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    _jsx('div', { className: 'p-6', children: _jsx(SessionsChart, { sessions: sessions }) }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=sessions-monitor.js.map
