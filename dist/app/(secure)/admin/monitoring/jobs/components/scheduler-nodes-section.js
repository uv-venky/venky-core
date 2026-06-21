/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from '../../../../../../components/ui/badge';
import { cn } from '../../../../../../lib/utils';
import { ChevronDown, ChevronRight, Cpu, HardDrive, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '../../../../../../lib/core/client/useQuery';
import { invalidateQuery } from '../../../../../../lib/core/client/useQueryBase';
import { formatDistanceToNow } from 'date-fns';
function StatusBadge({ status }) {
    if (status === 'online') {
        return (_jsxs(Badge, { variant: "outline", className: "gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400", children: [_jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" }), "Online"] }));
    }
    if (status === 'offline') {
        return (_jsx(Badge, { variant: "outline", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400", children: "Offline" }));
    }
    return (_jsx(Badge, { variant: "outline", className: "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400", children: "Stale" }));
}
function formatTimeAgo(iso) {
    try {
        return formatDistanceToNow(new Date(iso), { addSuffix: true });
    }
    catch {
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
    const data = nodesResult.status === 'success' ? nodesResult.data : null;
    if (!data || data.nodes.length === 0) {
        return null;
    }
    return (_jsxs("div", { className: "overflow-hidden rounded-xl border bg-card shadow-sm", children: [_jsxs("button", { type: "button", onClick: () => setExpanded((prev) => !prev), className: "flex w-full items-center gap-3 border-b bg-muted/30 px-5 py-3 text-left transition-colors hover:bg-muted/50", children: [expanded ? (_jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })) : (_jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })), _jsx(Server, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "font-semibold text-sm", children: "Scheduler Nodes" }), _jsxs("span", { className: "ml-2 flex items-center gap-2 text-muted-foreground text-xs", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500" }), data.onlineCount, " online"] }), data.offlineCount > 0 && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-red-500" }), data.offlineCount, " offline"] }))] })] }), expanded && (_jsxs("div", { children: [_jsx("div", { className: "border-b bg-muted/20 px-5 py-2", children: _jsxs("div", { className: "grid grid-cols-[1fr_8rem_4rem_5rem_7rem_7rem_4rem_4rem_8rem] items-center gap-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: [_jsx("div", { children: "Node" }), _jsx("div", { children: "Scheduler ID" }), _jsx("div", { children: "PID" }), _jsx("div", { children: "Status" }), _jsx("div", { children: "Started" }), _jsx("div", { children: "Last Seen" }), _jsx("div", { children: "CPU" }), _jsx("div", { children: "Mem" }), _jsx("div", { children: "Jobs" })] }) }), _jsx("div", { className: "divide-y", children: data.nodes.map((node) => (_jsxs("div", { className: cn('grid grid-cols-[1fr_8rem_4rem_5rem_7rem_7rem_4rem_4rem_8rem] items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/20', node.status !== 'online' && 'opacity-60'), children: [_jsxs("div", { className: "flex items-center gap-2 truncate", children: [_jsx(HardDrive, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }), _jsx("span", { className: "truncate font-medium text-sm", title: node.nodeId, children: node.nodeId })] }), _jsx("div", { className: "truncate text-muted-foreground text-xs", title: node.schedulerId, children: node.schedulerId }), _jsx("div", { className: "text-muted-foreground text-xs", children: node.pid }), _jsx("div", { children: _jsx(StatusBadge, { status: node.status }) }), _jsx("div", { className: "text-muted-foreground text-xs", title: node.startedAt, children: formatTimeAgo(node.startedAt) }), _jsx("div", { className: "text-muted-foreground text-xs", title: node.lastSeenAt, children: formatTimeAgo(node.lastSeenAt) }), _jsxs("div", { className: "flex items-center gap-1 text-muted-foreground text-xs", children: [_jsx(Cpu, { className: "h-3 w-3 shrink-0" }), node.cpuUsage != null ? `${node.cpuUsage}%` : '-'] }), _jsx("div", { className: "text-muted-foreground text-xs", children: node.memoryMb != null ? `${node.memoryMb}M` : '-' }), _jsxs("div", { className: "text-muted-foreground text-xs", "data-tip": `Scheduled: ${node.jobsScheduled}, Running: ${node.jobsRunning}, Executed: ${node.jobsExecuted}`, "data-tip-at": "left", children: [node.jobsScheduled, "/", node.jobsRunning, "/", node.jobsExecuted] })] }, `${node.nodeId}-${node.pid}`))) })] }))] }));
}
//# sourceMappingURL=scheduler-nodes-section.js.map