/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { isErrorResponse } from '../../../lib/core/common/error';
import { format, formatDistanceToNow } from 'date-fns';
import {
  BarChart3,
  Clock,
  Database,
  FileEdit,
  Layers,
  Minus,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Table2,
  User,
} from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';
import { useIsStoreBusy, useStoreRowCount } from '../../../components/core/hooks/useStoreHooks';
import { cn } from '../../../lib/utils';
import AuditCharts from './audit-charts';
import { useAuditStore } from '../../../app/(secure)/admin/monitoring/audit/hooks/use-store';
import useAuditSmartSearchColumns from '../../../app/(secure)/admin/monitoring/audit/hooks/use-smart-search-columns';
import useAuditTableColumns from '../../../app/(secure)/admin/monitoring/audit/hooks/use-table-columns';
import { useQuery } from '../../../lib/core/client/useQuery';
import Suspended from '../../../components/core/common/Suspended';
import { Filters } from '../../../components/core/page';
import DataTable from '../../../components/core/page/table';
import useTable from '../../../components/core/page/useTable';
import DataTablePagination from '../../../components/core/page/data-table-pagination';
import { WaveDots } from '../../../components/core/common/WaveDots';
import { invalidateQuery } from '../../../venky-exports/core/client';
const CHANGE_TYPE_CONFIG = {
  added: {
    icon: Plus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'Added',
    accentColor: 'bg-emerald-500',
  },
  removed: {
    icon: Minus,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20',
    label: 'Removed',
    accentColor: 'bg-red-500',
  },
  modified: {
    icon: FileEdit,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    label: 'Modified',
    accentColor: 'bg-blue-500',
  },
  activated: {
    icon: Power,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20',
    label: 'Activated',
    accentColor: 'bg-green-500',
  },
  deactivated: {
    icon: PowerOff,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    label: 'Deactivated',
    accentColor: 'bg-amber-500',
  },
};
// Stat card component
function StatCard({ icon: Icon, label, value, subValue, color, bgColor, accentColor }) {
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
              _jsx('p', { className: 'text-muted-foreground text-sm', children: label }),
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
function StatsLoadingSkeleton() {
  return _jsx('div', {
    className: 'grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5',
    children: [...Array(5)].map((_, i) =>
      _jsx(
        'div',
        {
          className:
            'relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm',
          children: _jsxs('div', {
            className: 'flex items-start justify-between',
            children: [
              _jsxs('div', {
                className: 'space-y-2',
                children: [
                  _jsx('div', { className: 'h-4 w-20 animate-pulse rounded bg-muted' }),
                  _jsx('div', { className: 'h-8 w-16 animate-pulse rounded bg-muted' }),
                  _jsx('div', { className: 'h-3 w-24 animate-pulse rounded bg-muted' }),
                ],
              }),
              _jsx('div', { className: 'size-10 animate-pulse rounded-lg bg-muted' }),
            ],
          }),
        },
        i,
      ),
    ),
  });
}
function StatsSection({ stats }) {
  const latestUpdate = stats.latestUpdate ? new Date(stats.latestUpdate) : null;
  return _jsxs('div', {
    className: 'grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5',
    children: [
      _jsx(StatCard, {
        icon: FileEdit,
        label: 'Total Changes',
        value: stats.total.toLocaleString(),
        subValue: 'All audit records',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        accentColor: 'bg-blue-500',
      }),
      _jsx(StatCard, {
        icon: Layers,
        label: 'Entities Modified',
        value: stats.uniqueEntities.toLocaleString(),
        subValue: 'Distinct records',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        accentColor: 'bg-purple-500',
      }),
      _jsx(StatCard, {
        icon: User,
        label: 'Active Users',
        value: stats.uniqueUsers,
        subValue: 'Made changes',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        accentColor: 'bg-emerald-500',
      }),
      _jsx(StatCard, {
        icon: Database,
        label: 'Data Sources',
        value: stats.uniqueDatasources,
        subValue: 'With changes',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        accentColor: 'bg-amber-500',
      }),
      _jsx(StatCard, {
        icon: Clock,
        label: 'Latest Update',
        value: latestUpdate ? formatDistanceToNow(latestUpdate, { addSuffix: true }) : 'N/A',
        subValue: latestUpdate ? format(latestUpdate, 'MMM d, h:mm a') : 'No updates',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        accentColor: 'bg-rose-500',
      }),
    ],
  });
}
function AnalyticsSection({ stats }) {
  return _jsxs('div', {
    className: 'flex min-h-full gap-4',
    children: [
      _jsx('div', {
        className: 'flex w-56 shrink-0 flex-col gap-3 self-start',
        children: Object.entries(CHANGE_TYPE_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          const count = stats.changesByType[type];
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return _jsxs(
            'div',
            {
              className:
                'relative shrink-0 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-3 backdrop-blur-sm',
              children: [
                _jsxs('div', {
                  className: 'flex items-center justify-between gap-2',
                  children: [
                    _jsxs('div', {
                      className: 'flex items-center gap-2',
                      children: [
                        _jsx('div', {
                          className: cn('rounded-lg border p-1.5', config.bgColor),
                          children: _jsx(Icon, { className: cn('size-3.5', config.color) }),
                        }),
                        _jsxs('div', {
                          children: [
                            _jsx('h4', { className: 'font-medium text-xs', children: config.label }),
                            _jsxs('p', {
                              className: 'text-[10px] text-muted-foreground',
                              children: [count, ' changes'],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs(Badge, {
                      variant: 'secondary',
                      className: cn('px-1.5 py-0.5 font-mono text-[10px]', config.color, config.bgColor),
                      children: [percentage, '%'],
                    }),
                  ],
                }),
                _jsx('div', {
                  className: 'mt-2 h-1 overflow-hidden rounded-full bg-muted/50',
                  children: _jsx('div', {
                    className: cn('h-full rounded-full transition-all duration-500', config.accentColor),
                    style: { width: `${percentage}%` },
                  }),
                }),
              ],
            },
            type,
          );
        }),
      }),
      _jsxs('div', {
        className:
          'min-w-0 flex-1 self-stretch rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
        children: [
          _jsx('div', {
            className: 'border-border/50 border-b px-4 py-3',
            children: _jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                _jsx('div', {
                  className: 'flex size-7 items-center justify-center rounded-lg bg-primary/10',
                  children: _jsx(BarChart3, { className: 'size-3.5 text-primary' }),
                }),
                _jsxs('div', {
                  children: [
                    _jsx('h3', { className: 'font-semibold text-sm', children: 'Audit Analytics' }),
                    _jsx('p', {
                      className: 'text-muted-foreground text-xs',
                      children: 'Visual breakdown of audit activity and change distribution',
                    }),
                  ],
                }),
              ],
            }),
          }),
          _jsx('div', { className: 'p-4', children: _jsx(AuditCharts, { stats: stats }) }),
        ],
      }),
    ],
  });
}
export default function AuditDashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState('table');
  const store = useAuditStore();
  const smartSearchColumns = useAuditSmartSearchColumns();
  const tableColumns = useAuditTableColumns(store);
  const table = useTable({
    store,
    tableColumns,
  });
  const isRefreshing = useIsStoreBusy(store);
  const rowCount = useStoreRowCount(store);
  // Fetch stats independently from the table data
  const statsResult = useQuery('getAuditStats');
  const handleRefresh = useCallback(() => {
    store?.refresh();
    invalidateQuery('getAuditStats');
    invalidateQuery('getAuditFilterOptions');
    setLastRefresh(new Date());
  }, [store]);
  const defaultStats = {
    total: 0,
    uniqueEntities: 0,
    uniqueUsers: 0,
    uniqueDatasources: 0,
    latestUpdate: null,
    changesByType: {
      added: 0,
      removed: 0,
      modified: 0,
      activated: 0,
      deactivated: 0,
    },
  };
  const stats =
    statsResult.status === 'success' && !isErrorResponse(statsResult.data) ? statsResult.data : defaultStats;
  return _jsxs('div', {
    className: 'flex flex-1 flex-col gap-6 overflow-hidden',
    children: [
      statsResult.status === 'loading' ? _jsx(StatsLoadingSkeleton, {}) : _jsx(StatsSection, { stats: stats }),
      _jsxs(Tabs, {
        value: activeTab,
        onValueChange: (value) => setActiveTab(value),
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
              _jsx('div', { className: cn('h-6 w-px bg-border/50', activeTab !== 'table' && 'invisible') }),
              _jsx('div', {
                className: cn('min-w-0 flex-1', activeTab !== 'table' && 'invisible'),
                children: _jsx(Suspense, {
                  fallback: _jsx(Suspended, { name: 'Filters' }),
                  children: _jsx(Filters, {
                    border: 'none',
                    store: store,
                    table: table,
                    columns: smartSearchColumns,
                    pageId: 'audit-monitor-page',
                    itemId: 'audit-monitor',
                  }),
                }),
              }),
              _jsx('div', { className: cn('h-6 w-px bg-border/50', activeTab !== 'table' && 'invisible') }),
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
            className: 'mt-0 flex-1 overflow-hidden',
            children: _jsxs('div', {
              className:
                'flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
              children: [
                _jsx('div', {
                  className: 'relative flex-1',
                  children: _jsx(DataTable, {
                    table: table,
                    store: store,
                    variant: 'default',
                    smartSearchColumns: smartSearchColumns,
                    emptyStateTitle: 'No audit records found',
                    emptyStateSubtitle: 'Try adjusting your search filters',
                  }),
                }),
                _jsxs('div', {
                  className: 'flex shrink-0 items-center justify-end space-x-2 border-border/50 border-t p-2',
                  children: [
                    isRefreshing
                      ? _jsx('div', { className: 'flex-1', children: _jsx(WaveDots, { active: true }) })
                      : rowCount != null &&
                        _jsxs('div', {
                          className: 'flex-1 text-muted-foreground text-sm',
                          children: [rowCount, ' row(s)'],
                        }),
                    _jsx('div', {
                      className: 'space-x-2',
                      children: _jsx(DataTablePagination, { table: table, store: store }),
                    }),
                  ],
                }),
              ],
            }),
          }),
          _jsx(TabsContent, {
            value: 'analytics',
            className:
              'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 mt-0 flex-1 overflow-auto',
            children: _jsx(AnalyticsSection, { stats: stats }),
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=audit-dashboard.js.map
