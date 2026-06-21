/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Card, CardContent, CardHeader } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../../../components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '../../../../../../lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { AppIcon } from '../../../../../../components/sidebar/icons';
import { useLoadingControl } from '../../../../../../lib/core/client/loading-tracker';
export function AppStatusCard({ app, onEdit, onDelete, onRefreshStatus, refreshKey }) {
  const [status, setStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const { increment, decrement } = useLoadingControl();
  const fetchStatus = useCallback(async () => {
    if (!app.appId) {
      setStatus({ status: 'ERROR', message: 'App ID is required' });
      return;
    }
    increment();
    setIsLoadingStatus(true);
    try {
      // Use proxy route to avoid CSP violations - all requests go through same origin
      const response = await fetch(`/api/apps/${encodeURIComponent(app.appId)}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch status' }));
        setStatus({ status: 'ERROR', message: errorData.message || 'Failed to fetch status' });
      }
    } catch (error) {
      setStatus({
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setIsLoadingStatus(false);
      setLastRefresh(new Date());
      decrement();
    }
  }, [app.appId, increment, decrement]);
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus, refreshKey]);
  const handleRefresh = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    await fetchStatus();
    if (onRefreshStatus) {
      await onRefreshStatus(app);
    }
  };
  const getStatusBadgeVariant = () => {
    if (!status) return 'outline';
    if (status.status === 'OK') return 'success';
    return 'destructive';
  };
  const handleOpenUrl = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (app.fullUrl) {
      window.open(app.fullUrl, '_blank', 'noopener,noreferrer');
    }
  };
  const handleCardClick = () => {
    onEdit?.(app);
  };
  return _jsxs(Card, {
    className: 'group relative cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg',
    onClick: handleCardClick,
    children: [
      _jsx(CardHeader, {
        className: 'min-w-0 pb-3',
        children: _jsxs('div', {
          className: 'flex min-w-0 items-start justify-between gap-4',
          children: [
            _jsxs('div', {
              className: 'flex min-w-0 flex-1 items-start gap-3',
              children: [
                _jsx('div', {
                  className:
                    'mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-blue-600/10',
                  children: _jsx(AppIcon, { icon: app.icon || 'MiniLogo', className: 'size-6 text-blue-600' }),
                }),
                _jsxs('div', {
                  className: 'min-w-0 flex-1 space-y-1 overflow-hidden',
                  children: [
                    _jsx('h3', {
                      className: 'min-w-0 truncate font-semibold text-lg leading-tight',
                      children: app.name,
                    }),
                    _jsx('p', { className: 'min-w-0 truncate text-muted-foreground text-sm', children: app.fullUrl }),
                    _jsxs('div', {
                      className: 'flex flex-wrap items-center gap-2',
                      children: [
                        _jsx(Badge, {
                          variant: getStatusBadgeVariant(),
                          className: 'text-xs',
                          children: isLoadingStatus
                            ? _jsx(Loader2, { className: 'mr-1 size-3 animate-spin' })
                            : status?.status === 'OK'
                              ? 'Healthy'
                              : status?.status === 'ERROR'
                                ? 'Unavailable'
                                : 'Unknown',
                        }),
                        app.statusToken &&
                          _jsx(Badge, { variant: 'outline', className: 'text-xs', children: 'Token Set' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            _jsxs(DropdownMenu, {
              children: [
                _jsx(DropdownMenuTrigger, {
                  asChild: true,
                  children: _jsx(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    className: 'mt-0.5 h-8 w-8 shrink-0',
                    onClick: (e) => e.stopPropagation(),
                    children: _jsx(MoreVertical, { className: 'size-4' }),
                  }),
                }),
                _jsxs(DropdownMenuContent, {
                  align: 'end',
                  children: [
                    _jsxs(DropdownMenuItem, {
                      onClick: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onEdit?.(app);
                      },
                      children: [_jsx(Edit, { className: 'mr-2 size-4' }), 'Edit'],
                    }),
                    _jsxs(DropdownMenuItem, {
                      onClick: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleOpenUrl(e);
                      },
                      children: [_jsx(ExternalLink, { className: 'mr-2 size-4' }), 'Open URL'],
                    }),
                    _jsxs(DropdownMenuItem, {
                      onClick: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRefresh(e);
                      },
                      disabled: isLoadingStatus,
                      children: [
                        _jsx(RefreshCw, { className: cn('mr-2 size-4', isLoadingStatus && 'animate-spin') }),
                        'Refresh Status',
                      ],
                    }),
                    _jsxs(DropdownMenuItem, {
                      className: 'text-destructive',
                      onClick: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete?.(app);
                      },
                      children: [_jsx(Trash2, { className: 'mr-2 size-4' }), 'Delete'],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      _jsx(CardContent, {
        className: 'pt-0',
        children:
          status?.status === 'OK' && status.metrics
            ? _jsxs('div', {
                className: 'space-y-2',
                children: [
                  _jsxs('div', {
                    className: 'grid grid-cols-2 gap-2 text-sm',
                    children: [
                      _jsxs('div', {
                        children: [
                          _jsx('span', { className: 'text-muted-foreground', children: 'Roles:' }),
                          ' ',
                          _jsx('span', { className: 'font-medium', children: status.metrics.roles }),
                        ],
                      }),
                      _jsxs('div', {
                        children: [
                          _jsx('span', { className: 'text-muted-foreground', children: 'Users:' }),
                          ' ',
                          _jsx('span', { className: 'font-medium', children: status.metrics.activeUsers }),
                        ],
                      }),
                      _jsxs('div', {
                        children: [
                          _jsx('span', { className: 'text-muted-foreground', children: 'Datasources:' }),
                          ' ',
                          _jsx('span', { className: 'font-medium', children: status.metrics.datasources }),
                        ],
                      }),
                      _jsxs('div', {
                        children: [
                          _jsx('span', { className: 'text-muted-foreground', children: 'DB Connections:' }),
                          ' ',
                          _jsxs('span', {
                            className: 'font-medium',
                            children: [
                              status.metrics.database.connections.active,
                              '/',
                              status.metrics.database.connections.total,
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsx('div', {
                    className: 'border-t pt-2 text-muted-foreground text-xs',
                    children: lastRefresh && `Last updated: ${lastRefresh.toLocaleTimeString()}`,
                  }),
                ],
              })
            : status?.status === 'ERROR'
              ? _jsxs('div', {
                  className: 'space-y-1 text-sm',
                  children: [
                    _jsx('p', { className: 'font-medium text-destructive', children: 'Status unavailable' }),
                    status.message && _jsx('p', { className: 'text-muted-foreground', children: status.message }),
                  ],
                })
              : _jsx('div', { className: 'text-muted-foreground text-sm', children: 'No status data available' }),
      }),
    ],
  });
}
//# sourceMappingURL=AppStatusCard.js.map
