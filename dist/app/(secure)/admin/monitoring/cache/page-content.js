'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import PageShell from '../../../../../components/core/page/page-shell';
import PageLayout from '../../../../../components/core/page/PageLayout';
import { Alert, AlertDescription, AlertTitle } from '../../../../../components/ui/alert';
import { Button } from '../../../../../components/ui/button';
import { isErrorResponse } from '../../../../../lib/core/common/error';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Database, HardDrive, Loader2, RefreshCcw, Target, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '../../../../../lib/core/client/useQuery';
import { invalidateQuery } from '../../../../../lib/core/client/useQueryBase';
import { showSuccess } from '../../../../../components/core/common/Notification';
export default function CachePageContent() {
  const [lastUpdated, setLastUpdated] = useState(null);
  const statsResult = useQuery('getCacheStats');
  const clearCacheMutation = useMutation('clearCache', {
    invalidateOnSuccess: ['getCacheStats'],
  });
  const cacheStats =
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
    return _jsx(PageLayout, {
      icon: _jsxs('div', {
        className: 'relative',
        children: [
          _jsx('div', {
            className:
              'absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl',
          }),
          _jsx('div', {
            className:
              'relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg',
            children: _jsx(Database, { className: 'h-6 w-6 text-white' }),
          }),
        ],
      }),
      title: 'Cache Dashboard',
      subTitle: 'Loading cache statistics...',
      children: _jsx('div', {
        className: 'flex h-full items-center justify-center',
        children: _jsxs('div', {
          className: 'flex flex-col items-center gap-3',
          children: [
            _jsx(Loader2, { className: 'h-8 w-8 animate-spin text-amber-500' }),
            _jsx('span', { className: 'text-muted-foreground text-sm', children: 'Loading cache data...' }),
          ],
        }),
      }),
    });
  }
  if (isErrorResponse(cacheStats)) {
    return _jsx(PageShell, {
      noPadding: true,
      title: 'Cache Dashboard',
      mustBeTabletOrDesktop: false,
      children: _jsx(PageLayout, {
        icon: _jsxs('div', {
          className: 'relative',
          children: [
            _jsx('div', {
              className: 'absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 blur-xl',
            }),
            _jsx('div', {
              className:
                'relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg',
              children: _jsx(Database, { className: 'h-6 w-6 text-white' }),
            }),
          ],
        }),
        title: 'Cache Dashboard',
        children: _jsx('div', {
          className: 'flex h-full items-center justify-center p-8',
          children: _jsxs(Alert, {
            variant: 'destructive',
            className: 'max-w-md',
            children: [
              _jsx(AlertCircle, { className: 'h-4 w-4' }),
              _jsx(AlertTitle, { children: 'Error' }),
              _jsx(AlertDescription, { children: cacheStats.message }),
            ],
          }),
        }),
      }),
    });
  }
  const hitRate =
    cacheStats && !isErrorResponse(cacheStats)
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses || 1)) * 100
      : 0;
  return _jsx(PageLayout, {
    icon: _jsxs('div', {
      className: 'relative',
      children: [
        _jsx('div', {
          className:
            'absolute inset-0 animate-pulse rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl',
        }),
        _jsx('div', {
          className:
            'relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg',
          children: _jsx(Database, { className: 'h-6 w-6 text-white' }),
        }),
      ],
    }),
    title: 'Cache Dashboard',
    subTitle: lastUpdated
      ? `Last updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
      : 'Monitoring cache performance',
    toolbar: _jsxs('div', {
      className: 'flex items-center gap-2',
      children: [
        _jsxs(Button, {
          onClick: fetchCacheData,
          disabled: loading,
          className:
            'group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl',
          'data-tip': 'Refresh cache statistics',
          activityId: 'health-dashboard-refresh',
          children: [
            _jsxs('span', {
              className: 'relative z-10 flex items-center gap-2',
              children: [
                _jsx(RefreshCcw, {
                  className: `h-4 w-4 ${loading ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}`,
                }),
                'Refresh',
              ],
            }),
            _jsx('div', {
              className:
                'absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
            }),
          ],
        }),
        _jsxs(Button, {
          onClick: handleClearCache,
          variant: 'destructive',
          className: 'gap-2',
          'data-tip': 'Clear all cached data',
          activityId: 'clear-cache',
          children: [_jsx(Trash2, { className: 'h-4 w-4' }), 'Clear Cache'],
        }),
      ],
    }),
    children: _jsx('div', {
      className: 'h-full w-full overflow-auto p-6',
      children:
        cacheStats &&
        _jsxs('div', {
          className: 'mx-auto flex w-full max-w-5xl flex-col gap-6',
          children: [
            _jsxs('div', {
              className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
              children: [
                _jsxs('div', {
                  className:
                    'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
                  children: [
                    _jsx('div', {
                      className:
                        'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent',
                    }),
                    _jsxs('div', {
                      className: 'p-5',
                      children: [
                        _jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            _jsx('div', {
                              className:
                                'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
                              children: _jsx(Zap, { className: 'h-5 w-5 text-emerald-600 dark:text-emerald-400' }),
                            }),
                            _jsxs('span', {
                              className:
                                'rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600 text-xs dark:bg-emerald-500/10 dark:text-emerald-400',
                              children: ['+', hitRate.toFixed(1), '%'],
                            }),
                          ],
                        }),
                        _jsxs('div', {
                          className: 'mt-4',
                          children: [
                            _jsx('p', {
                              className: 'font-medium text-muted-foreground text-sm',
                              children: 'Cache Hits',
                            }),
                            _jsx('p', {
                              className: 'font-bold text-2xl tracking-tight',
                              children: cacheStats.hits.toLocaleString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs('div', {
                  className:
                    'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
                  children: [
                    _jsx('div', {
                      className:
                        'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent',
                    }),
                    _jsxs('div', {
                      className: 'p-5',
                      children: [
                        _jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            _jsx('div', {
                              className:
                                'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-rose-500/10',
                              children: _jsx(Target, { className: 'h-5 w-5 text-red-600 dark:text-red-400' }),
                            }),
                            _jsxs('span', {
                              className:
                                'rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600 text-xs dark:bg-red-500/10 dark:text-red-400',
                              children: [(100 - hitRate).toFixed(1), '%'],
                            }),
                          ],
                        }),
                        _jsxs('div', {
                          className: 'mt-4',
                          children: [
                            _jsx('p', {
                              className: 'font-medium text-muted-foreground text-sm',
                              children: 'Cache Misses',
                            }),
                            _jsx('p', {
                              className: 'font-bold text-2xl tracking-tight',
                              children: cacheStats.misses.toLocaleString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs('div', {
                  className:
                    'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
                  children: [
                    _jsx('div', {
                      className:
                        'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent',
                    }),
                    _jsxs('div', {
                      className: 'p-5',
                      children: [
                        _jsx('div', {
                          className: 'flex items-center justify-between',
                          children: _jsx('div', {
                            className:
                              'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10',
                            children: _jsx(Database, { className: 'h-5 w-5 text-violet-600 dark:text-violet-400' }),
                          }),
                        }),
                        _jsxs('div', {
                          className: 'mt-4',
                          children: [
                            _jsx('p', {
                              className: 'font-medium text-muted-foreground text-sm',
                              children: 'Total Entries',
                            }),
                            _jsx('p', {
                              className: 'font-bold text-2xl tracking-tight',
                              children: cacheStats.entries.toLocaleString(),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs('div', {
                  className:
                    'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
                  children: [
                    _jsx('div', {
                      className:
                        'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent',
                    }),
                    _jsxs('div', {
                      className: 'p-5',
                      children: [
                        _jsx('div', {
                          className: 'flex items-center justify-between',
                          children: _jsx('div', {
                            className:
                              'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
                            children: _jsx(HardDrive, { className: 'h-5 w-5 text-cyan-600 dark:text-cyan-400' }),
                          }),
                        }),
                        _jsxs('div', {
                          className: 'mt-4',
                          children: [
                            _jsx('p', {
                              className: 'font-medium text-muted-foreground text-sm',
                              children: 'Memory Usage',
                            }),
                            _jsx('p', {
                              className: 'font-bold text-2xl tracking-tight',
                              children: cacheStats.memoryUsage,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            _jsxs('div', {
              className: 'group relative overflow-hidden rounded-xl border bg-card shadow-sm',
              children: [
                _jsx('div', {
                  className:
                    'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent',
                }),
                _jsxs('div', {
                  className: 'p-5',
                  children: [
                    _jsxs('div', {
                      className: 'mb-4 flex items-center justify-between',
                      children: [
                        _jsx('h3', { className: 'font-semibold', children: 'Cache Hit Rate' }),
                        _jsxs('span', { className: 'font-bold text-2xl', children: [hitRate.toFixed(1), '%'] }),
                      ],
                    }),
                    _jsx('div', {
                      className: 'h-3 overflow-hidden rounded-full bg-muted',
                      children: _jsx('div', {
                        className:
                          'h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500',
                        style: { width: `${hitRate}%` },
                      }),
                    }),
                    _jsxs('p', {
                      className: 'mt-2 text-muted-foreground text-sm',
                      children: [
                        cacheStats.hits.toLocaleString(),
                        ' hits out of',
                        ' ',
                        (cacheStats.hits + cacheStats.misses).toLocaleString(),
                        ' total requests',
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
    }),
  });
}
//# sourceMappingURL=page-content.js.map
