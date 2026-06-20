'use client';

import PageShell from '@/components/core/page/page-shell';
import PageLayout from '@/components/core/page/PageLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isErrorResponse, type ErrorResponse } from '@/lib/core/common/error';
import type { CacheStats } from '@/lib/core/server/cache';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Database, HardDrive, Loader2, RefreshCcw, Target, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@/lib/core/client/useQuery';
import { invalidateQuery } from '@/lib/core/client/useQueryBase';
import { showSuccess } from '@/components/core/common/Notification';

export default function CachePageContent() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const statsResult = useQuery('getCacheStats');
  const clearCacheMutation = useMutation('clearCache', {
    invalidateOnSuccess: ['getCacheStats'],
  });

  const cacheStats: CacheStats | null | ErrorResponse =
    statsResult.status === 'success'
      ? statsResult.data
      : statsResult.status === 'error'
        ? { status: 'ERROR', message: statsResult.error }
        : null;
  const loading = statsResult.status === 'loading';

  const fetchCacheData = () => {
    invalidateQuery('getCacheStats');
    setLastUpdated(new Date());
  };

  const handleClearCache = async () => {
    try {
      await clearCacheMutation();
      showSuccess('Cache cleared successfully');
    } catch {
      // Error already shown by mutation
    }
  };

  if (loading && !cacheStats) {
    return (
      <PageLayout
        icon={
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
          </div>
        }
        title="Cache Dashboard"
        subTitle="Loading cache statistics..."
      >
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="text-muted-foreground text-sm">Loading cache data...</span>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isErrorResponse(cacheStats)) {
    return (
      <PageShell noPadding title="Cache Dashboard" mustBeTabletOrDesktop={false}>
        <PageLayout
          icon={
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 blur-xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
          }
          title="Cache Dashboard"
        >
          <div className="flex h-full items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{cacheStats.message}</AlertDescription>
            </Alert>
          </div>
        </PageLayout>
      </PageShell>
    );
  }

  const hitRate =
    cacheStats && !isErrorResponse(cacheStats)
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses || 1)) * 100
      : 0;

  return (
    <PageLayout
      icon={
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
        </div>
      }
      title="Cache Dashboard"
      subTitle={
        lastUpdated
          ? `Last updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
          : 'Monitoring cache performance'
      }
      toolbar={
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchCacheData}
            disabled={loading}
            className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            data-tip="Refresh cache statistics"
            activityId="health-dashboard-refresh"
          >
            <span className="relative z-10 flex items-center gap-2">
              <RefreshCcw
                className={`h-4 w-4 ${loading ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}`}
              />
              Refresh
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Button>
          <Button
            onClick={handleClearCache}
            variant="destructive"
            className="gap-2"
            data-tip="Clear all cached data"
            activityId="clear-cache"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      }
    >
      <div className="h-full w-full overflow-auto p-6">
        {cacheStats && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Hits */}
              <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                      <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600 text-xs dark:bg-emerald-500/10 dark:text-emerald-400">
                      +{hitRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium text-muted-foreground text-sm">Cache Hits</p>
                    <p className="font-bold text-2xl tracking-tight">{cacheStats.hits.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Misses */}
              <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-rose-500/10">
                      <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600 text-xs dark:bg-red-500/10 dark:text-red-400">
                      {(100 - hitRate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium text-muted-foreground text-sm">Cache Misses</p>
                    <p className="font-bold text-2xl tracking-tight">{cacheStats.misses.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Entries */}
              <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                      <Database className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium text-muted-foreground text-sm">Total Entries</p>
                    <p className="font-bold text-2xl tracking-tight">{cacheStats.entries.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                      <HardDrive className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium text-muted-foreground text-sm">Memory Usage</p>
                    <p className="font-bold text-2xl tracking-tight">{cacheStats.memoryUsage}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hit Rate Progress */}
            <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Cache Hit Rate</h3>
                  <span className="font-bold text-2xl">{hitRate.toFixed(1)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${hitRate}%` }}
                  />
                </div>
                <p className="mt-2 text-muted-foreground text-sm">
                  {cacheStats.hits.toLocaleString()} hits out of{' '}
                  {(cacheStats.hits + cacheStats.misses).toLocaleString()} total requests
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
