/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton } from '../../../../../../components/ui/skeleton';
import { useQuery } from '../../../../../../lib/core/client/useQuery';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Loader2, Server } from 'lucide-react';
function formatDuration(ms) {
    if (ms == null)
        return '-';
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60_000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60_000).toFixed(1)}m`;
}
function RunStatusIcon({ run }) {
    if (run.finishedAt == null) {
        return _jsx(Loader2, { className: "h-4 w-4 animate-spin text-blue-500" });
    }
    if (run.success) {
        return _jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500" });
    }
    return _jsx(AlertCircle, { className: "h-4 w-4 text-red-500" });
}
export function JobHistoryPanel({ jobName }) {
    const historyResult = useQuery('getJobHistory', jobName);
    if (historyResult.status === 'loading') {
        return (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("div", { className: "mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Run History" }), ['a', 'b', 'c'].map((key) => (_jsx(Skeleton, { className: "h-10 rounded-lg" }, key)))] }));
    }
    if (historyResult.status === 'error') {
        return (_jsxs("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-400", children: ["Failed to load history: ", historyResult.error] }));
    }
    const { runs } = historyResult.data;
    if (runs.length === 0) {
        return _jsx("div", { className: "py-4 text-center text-muted-foreground text-sm", children: "No run history available" });
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: ["Recent Runs (", runs.length, ")"] }), _jsx("div", { className: "overflow-hidden rounded-lg border", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/30 text-muted-foreground text-xs", children: [_jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Status" }), _jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Started" }), _jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Duration" }), _jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Node" }), _jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Details" })] }) }), _jsx("tbody", { className: "divide-y", children: runs.map((run) => (_jsxs("tr", { className: "transition-colors hover:bg-muted/10", children: [_jsx("td", { className: "px-3 py-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RunStatusIcon, { run: run }), _jsx("span", { className: "text-xs", children: run.finishedAt == null ? 'Running' : run.success ? 'Success' : 'Failed' })] }) }), _jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), format(new Date(run.startedAt), 'MMM d, HH:mm:ss')] }) }), _jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: formatDuration(run.durationMs) }), _jsx("td", { className: "px-3 py-2", children: _jsxs("div", { className: "flex items-center gap-1 text-muted-foreground text-xs", children: [_jsx(Server, { className: "h-3 w-3" }), _jsx("span", { className: "max-w-[120px] truncate", title: run.node, children: run.node })] }) }), _jsx("td", { className: "px-3 py-2", children: run.error && (_jsx("span", { className: "max-w-[200px] truncate text-red-500 text-xs", title: run.error, children: run.error })) })] }, run.jobRunId))) })] }) })] }));
}
//# sourceMappingURL=job-history-panel.js.map