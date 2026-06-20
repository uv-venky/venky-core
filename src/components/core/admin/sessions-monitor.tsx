/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserSessions } from '@/lib/common/ds/types/core/UserSessions';
import { useStore } from '@/lib/core/client/store';
import type { DBRow } from '@/lib/core/common/ds/types/filter';
import { isAfter, parseISO, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  LogOut,
  RefreshCw,
  type Shield,
  ShieldCheck,
  Users,
  Activity,
  BarChart3,
  Table2,
  Globe,
  Laptop,
} from 'lucide-react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Suspended from '@/components/core/common/Suspended';
import { useDBRows, useIsStoreBusy, useStoreError } from '@/components/core/hooks/useStoreHooks';
import { Filters } from '@/components/core/page';
import DataTable from '@/components/core/page/table';
import useTable from '@/components/core/page/useTable';
import SessionsChart from '@/components/core/admin/sessions-chart';
import useSmartSearchColumns from '@/components/core/admin/useSmartSearchColumns';
import useTableColumns from '@/components/core/admin/useTableColumns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type SessionStatus = 'active' | 'expired' | 'signed-out';

interface SessionStats {
  total: number;
  active: number;
  expired: number;
  signedOut: number;
  uniqueUsers: number;
  uniqueIPs: number;
}

const STATUS_CONFIG: Record<SessionStatus, { icon: typeof Shield; color: string; bgColor: string; label: string }> = {
  active: { icon: ShieldCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Active' },
  expired: { icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Expired' },
  'signed-out': { icon: LogOut, color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Signed Out' },
};

function getSessionStatus(session: DBRow<UserSessions>): SessionStatus {
  const now = new Date();
  const expiresAt = parseISO(session.expiresAt);

  if (session.signedOutAt) {
    return 'signed-out';
  } else if (isAfter(now, expiresAt)) {
    return 'expired';
  }
  return 'active';
}

function calculateStats(sessions: readonly DBRow<UserSessions>[]): SessionStats {
  const stats: SessionStats = {
    total: sessions.length,
    active: 0,
    expired: 0,
    signedOut: 0,
    uniqueUsers: 0,
    uniqueIPs: 0,
  };

  const uniqueUsers = new Set<string>();
  const uniqueIPs = new Set<string>();

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
function LiveIndicator({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <span className="relative flex size-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  bgColor,
  accentColor,
  isLive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  subValue?: string;
  color: string;
  bgColor: string;
  accentColor: string;
  isLive?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">{label}</p>
            {isLive && <LiveIndicator isActive />}
          </div>
          <p className="font-semibold text-3xl tracking-tight">{value}</p>
          {subValue && <p className="text-muted-foreground text-xs">{subValue}</p>}
        </div>
        <div className={cn('rounded-lg p-2.5', bgColor)}>
          <Icon className={cn('size-5', color)} />
        </div>
      </div>
      {/* Accent bar */}
      <div className={cn('absolute inset-x-0 bottom-0 h-1 opacity-50', accentColor)} />
    </div>
  );
}

export default function SessionsMonitor() {
  const store = useStore<UserSessions>({
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const tableColumns = useTableColumns(store);
  const smartSearchColumns = useSmartSearchColumns();
  const table = useTable<UserSessions>({
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
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <h3 className="mb-2 font-semibold text-lg">Error Loading Sessions</h3>
          <p className="mb-6 text-muted-foreground text-sm">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="size-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-hidden">
      {/* Stats Grid */}
      <div className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Users}
          label="Total Sessions"
          value={stats.total}
          subValue={`${stats.uniqueUsers} unique users`}
          color="text-slate-400"
          bgColor="bg-slate-500/10"
          accentColor="bg-slate-500"
        />
        <StatCard
          icon={ShieldCheck}
          label="Active Sessions"
          value={stats.active}
          subValue="Currently online"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          accentColor="bg-emerald-500"
          isLive={stats.active > 0}
        />
        <StatCard
          icon={Clock}
          label="Expired Sessions"
          value={stats.expired}
          subValue="Timed out"
          color="text-amber-400"
          bgColor="bg-amber-500/10"
          accentColor="bg-amber-500"
        />
        <StatCard
          icon={LogOut}
          label="Signed Out"
          value={stats.signedOut}
          subValue="Logged out manually"
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          accentColor="bg-blue-500"
        />
        <StatCard
          icon={Globe}
          label="Unique IPs"
          value={stats.uniqueIPs}
          subValue="Distinct locations"
          color="text-purple-400"
          bgColor="bg-purple-500/10"
          accentColor="bg-purple-500"
        />
        <StatCard
          icon={Laptop}
          label="Active Rate"
          value={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%'}
          subValue="Of all sessions"
          color="text-rose-400"
          bgColor="bg-rose-500/10"
          accentColor="bg-rose-500"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="table" className="flex flex-1 flex-col overflow-hidden">
        {/* Filter & Control Bar */}
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-gradient-to-r from-card/60 to-card/30 p-3 backdrop-blur-sm">
          {/* Tab Toggles */}
          <TabsList className="shrink-0 bg-background/50 p-1">
            <TabsTrigger value="table" className="gap-2">
              <Table2 className="size-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="size-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="h-6 w-px bg-border/50" />

          {/* Search Filters */}
          <div className="min-w-0 flex-1">
            <Suspense fallback={<Suspended name="Filters" />}>
              <Filters
                border="none"
                store={store}
                table={table}
                columns={smartSearchColumns}
                pageId="user-sessions-page"
                itemId="user-sessions"
                disableSavedSearches
              />
            </Suspense>
          </div>

          <div className="h-6 w-px bg-border/50" />

          {/* Auto-refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors',
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            <Activity className={cn('size-3.5', autoRefresh && 'animate-pulse')} />
            Auto-refresh {autoRefresh ? 'on' : 'off'}
          </button>

          {/* Last refresh indicator */}
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Clock className="size-3.5" />
            <span>Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}</span>
          </div>

          {/* Manual refresh */}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Table View */}
        <TabsContent value="table" className="mt-0 flex-1">
          <div className="flex h-full flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <DataTable table={table} store={store} smartSearchColumns={smartSearchColumns} />
          </div>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent
          value="analytics"
          className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 mt-0 flex-1 overflow-auto"
        >
          <div className="space-y-6">
            {/* Status Distribution Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {(['active', 'expired', 'signed-out'] as const).map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                const count =
                  status === 'active' ? stats.active : status === 'expired' ? stats.expired : stats.signedOut;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div
                    key={status}
                    className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('rounded-xl p-3', config.bgColor)}>
                          <Icon className={cn('size-6', config.color)} />
                        </div>
                        <div>
                          <h4 className="font-medium">{config.label}</h4>
                          <p className="text-muted-foreground text-sm">{count} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className={cn('font-mono text-lg', config.color, config.bgColor)}>
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/50">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', config.bgColor)}
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: `hsl(var(--${status === 'active' ? 'chart-2' : status === 'expired' ? 'chart-3' : 'chart-1'}))`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <div className="border-border/50 border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Sessions Analytics</h3>
                    <p className="text-muted-foreground text-xs">
                      Visual breakdown of session activity and browser distribution
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <SessionsChart sessions={sessions} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
