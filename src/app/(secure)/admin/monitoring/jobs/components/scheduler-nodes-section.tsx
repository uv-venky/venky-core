/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Cpu, HardDrive, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@/lib/core/client/useQuery';
import { invalidateQuery } from '@/lib/core/client/useQueryBase';
import { formatDistanceToNow } from 'date-fns';
import type { SchedulerNodesResult } from '../action';

function StatusBadge({ status }: { status: 'online' | 'offline' | 'stale' }) {
  if (status === 'online') {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Online
      </Badge>
    );
  }
  if (status === 'offline') {
    return (
      <Badge
        variant="outline"
        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
      >
        Offline
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      Stale
    </Badge>
  );
}

function formatTimeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '-';
  }
}

export function SchedulerNodesSection() {
  const [expanded, setExpanded] = useState(true);
  const nodesResult = useQuery('getSchedulerNodes');

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      invalidateQuery('getSchedulerNodes');
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const data: SchedulerNodesResult | null = nodesResult.status === 'success' ? nodesResult.data : null;

  if (!data || data.nodes.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 border-b bg-muted/30 px-5 py-3 text-left transition-colors hover:bg-muted/50"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Server className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-sm">Scheduler Nodes</span>
        <span className="ml-2 flex items-center gap-2 text-muted-foreground text-xs">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {data.onlineCount} online
          </span>
          {data.offlineCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {data.offlineCount} offline
            </span>
          )}
        </span>
      </button>

      {/* Table */}
      {expanded && (
        <div>
          <div className="border-b bg-muted/20 px-5 py-2">
            <div className="grid grid-cols-[1fr_8rem_4rem_5rem_7rem_7rem_4rem_4rem_8rem] items-center gap-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <div>Node</div>
              <div>Scheduler ID</div>
              <div>PID</div>
              <div>Status</div>
              <div>Started</div>
              <div>Last Seen</div>
              <div>CPU</div>
              <div>Mem</div>
              <div>Jobs</div>
            </div>
          </div>
          <div className="divide-y">
            {data.nodes.map((node) => (
              <div
                key={`${node.nodeId}-${node.pid}`}
                className={cn(
                  'grid grid-cols-[1fr_8rem_4rem_5rem_7rem_7rem_4rem_4rem_8rem] items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/20',
                  node.status !== 'online' && 'opacity-60',
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <HardDrive className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-sm" title={node.nodeId}>
                    {node.nodeId}
                  </span>
                </div>
                <div className="truncate text-muted-foreground text-xs" title={node.schedulerId}>
                  {node.schedulerId}
                </div>
                <div className="text-muted-foreground text-xs">{node.pid}</div>
                <div>
                  <StatusBadge status={node.status} />
                </div>
                <div className="text-muted-foreground text-xs" title={node.startedAt}>
                  {formatTimeAgo(node.startedAt)}
                </div>
                <div className="text-muted-foreground text-xs" title={node.lastSeenAt}>
                  {formatTimeAgo(node.lastSeenAt)}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Cpu className="h-3 w-3 shrink-0" />
                  {node.cpuUsage != null ? `${node.cpuUsage}%` : '-'}
                </div>
                <div className="text-muted-foreground text-xs">{node.memoryMb != null ? `${node.memoryMb}M` : '-'}</div>
                <div
                  className="text-muted-foreground text-xs"
                  data-tip={`Scheduled: ${node.jobsScheduled}, Running: ${node.jobsRunning}, Executed: ${node.jobsExecuted}`}
                  data-tip-at="left"
                >
                  {node.jobsScheduled}/{node.jobsRunning}/{node.jobsExecuted}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
