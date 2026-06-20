/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import type { Apps } from '@/lib/common/ds/types/core/Apps';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { AppIcon } from '@/components/sidebar/icons';
import type { AppSidebarIcon } from '@/components/sidebar/icons';
import { useLoadingControl } from '@/lib/core/client/loading-tracker';

interface AppStatus {
  status: 'OK' | 'ERROR';
  appId?: string;
  appName?: string;
  timestamp?: string;
  metrics?: {
    roles: number;
    activeUsers: number;
    datasources: number;
    database: {
      connections: {
        total: number;
        idle: number;
        active: number;
        waiting: number;
        expired: number;
      };
    };
    memory: {
      process: {
        rss: string;
        heapTotal: string;
        heapUsed: string;
      };
      system: {
        total: string;
        free: string;
        used: string;
      };
    };
    cpu: {
      cores: number;
      model: string;
    };
    uptime: number;
  };
  message?: string;
}

interface AppStatusCardProps {
  app: Apps;
  onEdit?: (app: Apps) => void;
  onDelete?: (app: Apps) => void;
  onRefreshStatus?: (app: Apps) => Promise<void>;
  refreshKey?: number;
}

export function AppStatusCard({ app, onEdit, onDelete, onRefreshStatus, refreshKey }: AppStatusCardProps) {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
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

  const handleRefresh = async (e?: React.MouseEvent) => {
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

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (app.fullUrl) {
      window.open(app.fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = () => {
    onEdit?.(app);
  };

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <CardHeader className="min-w-0 pb-3">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-blue-600/10">
              <AppIcon icon={(app.icon || 'MiniLogo') as AppSidebarIcon} className="size-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
              <h3 className="min-w-0 truncate font-semibold text-lg leading-tight">{app.name}</h3>
              <p className="min-w-0 truncate text-muted-foreground text-sm">{app.fullUrl}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant()} className="text-xs">
                  {isLoadingStatus ? (
                    <Loader2 className="mr-1 size-3 animate-spin" />
                  ) : status?.status === 'OK' ? (
                    'Healthy'
                  ) : status?.status === 'ERROR' ? (
                    'Unavailable'
                  ) : (
                    'Unknown'
                  )}
                </Badge>
                {app.statusToken && (
                  <Badge variant="outline" className="text-xs">
                    Token Set
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-0.5 h-8 w-8 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit?.(app);
                }}
              >
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleOpenUrl(e);
                }}
              >
                <ExternalLink className="mr-2 size-4" />
                Open URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleRefresh(e);
                }}
                disabled={isLoadingStatus}
              >
                <RefreshCw className={cn('mr-2 size-4', isLoadingStatus && 'animate-spin')} />
                Refresh Status
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete?.(app);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {status?.status === 'OK' && status.metrics ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Roles:</span>{' '}
                <span className="font-medium">{status.metrics.roles}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Users:</span>{' '}
                <span className="font-medium">{status.metrics.activeUsers}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Datasources:</span>{' '}
                <span className="font-medium">{status.metrics.datasources}</span>
              </div>
              <div>
                <span className="text-muted-foreground">DB Connections:</span>{' '}
                <span className="font-medium">
                  {status.metrics.database.connections.active}/{status.metrics.database.connections.total}
                </span>
              </div>
            </div>
            <div className="border-t pt-2 text-muted-foreground text-xs">
              {lastRefresh && `Last updated: ${lastRefresh.toLocaleTimeString()}`}
            </div>
          </div>
        ) : status?.status === 'ERROR' ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-destructive">Status unavailable</p>
            {status.message && <p className="text-muted-foreground">{status.message}</p>}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No status data available</div>
        )}
      </CardContent>
    </Card>
  );
}
