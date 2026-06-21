/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MemoryChart } from '../../../components/core/admin/memory-chart';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import PageLayout from '../../../components/core/page/PageLayout';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle, ArrowDownUp, CheckCircle2, Clock, Cpu, Database, Globe, HardDrive, Hash, MemoryStick, Monitor, RefreshCcw, Server, Stethoscope, Timer, XCircle, } from 'lucide-react';
import clientLogger from '../../../lib/core/client/client-logger';
import { useCallback, useEffect, useState } from 'react';
import PageShell from '../../../components/core/page/page-shell';
import { isErrorResponse } from '../../../lib/core/common/error';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { useLoadingControl } from '../../../lib/core/client/loading-tracker';
import { cn } from '../../../lib/utils';
// Stat item component for consistent styling
function StatItem({ icon: Icon, label, value, subValue, className, }) {
    return (_jsxs("div", { className: cn('flex items-start gap-3', className), children: [_jsx("div", { className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted", children: _jsx(Icon, { className: "size-4 text-muted-foreground" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: label }), _jsx("p", { className: "truncate font-medium text-sm", children: value }), subValue && _jsx("p", { className: "truncate text-muted-foreground text-xs", children: subValue })] })] }));
}
// Status indicator component
function StatusIndicator({ status, size = 'md' }) {
    const isHealthy = status.toLowerCase() === 'healthy';
    const sizeClasses = {
        sm: 'size-2',
        md: 'size-3',
        lg: 'size-4',
    };
    return (_jsx("span", { className: "relative flex items-center gap-2", children: _jsxs("span", { className: cn('relative flex', sizeClasses[size]), children: [_jsx("span", { className: cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', isHealthy ? 'bg-emerald-400' : 'bg-red-400') }), _jsx("span", { className: cn('relative inline-flex rounded-full', sizeClasses[size], isHealthy ? 'bg-emerald-500' : 'bg-red-500') })] }) }));
}
// Status card component
function StatusCard({ title, description, status, icon: Icon, children, }) {
    const isHealthy = status.toLowerCase() === 'healthy';
    return (_jsxs(Card, { className: "relative overflow-hidden", children: [_jsx("div", { className: cn('absolute inset-x-0 top-0 h-1', isHealthy ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500') }), _jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn('flex size-10 items-center justify-center rounded-xl', isHealthy ? 'bg-emerald-500/10' : 'bg-red-500/10'), children: _jsx(Icon, { className: cn('size-5', isHealthy ? 'text-emerald-500' : 'text-red-500') }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: title }), _jsx(CardDescription, { className: "text-xs", children: description })] })] }), _jsx(StatusIndicator, { status: status, size: "md" })] }) }), _jsx(CardContent, { className: "pt-0", children: children })] }));
}
// Section header component
function SectionHeader({ icon: Icon, title, description, }) {
    return (_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-primary/10", children: _jsx(Icon, { className: "size-4 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: title }), description && _jsx("p", { className: "text-muted-foreground text-xs", children: description })] })] }));
}
export function HealthDashboard() {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const { increment, decrement } = useLoadingControl();
    const fetchHealthData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/health');
            if (isErrorResponse(response)) {
                setHealthData(response);
                return;
            }
            const data = await response.json();
            setHealthData(data);
            setLastUpdated(new Date());
        }
        catch (error) {
            clientLogger.error({
                message: 'Failed to fetch health data',
                error,
            });
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        increment();
        fetchHealthData().finally(() => {
            decrement();
        });
        // Set up polling every 30 seconds
        const interval = setInterval(fetchHealthData, 30000);
        return () => clearInterval(interval);
    }, [fetchHealthData, increment, decrement]);
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        else {
            return `${remainingSeconds}s`;
        }
    };
    const parseMemoryValue = (value) => {
        const match = value.match(/^([\d.]+)([A-Z]+)$/);
        if (match) {
            const [, num, unit] = match;
            return { value: Number.parseFloat(num), unit };
        }
        return { value: 0, unit: '' };
    };
    const calculateMemoryPercentage = ({ used, total }) => {
        const usedMem = parseMemoryValue(used);
        const totalMem = parseMemoryValue(total);
        if (usedMem.unit === totalMem.unit) {
            return (usedMem.value / totalMem.value) * 100;
        }
        // Simple conversion if units are different (GB to MB or vice versa)
        if (usedMem.unit === 'MB' && totalMem.unit === 'GB') {
            return (usedMem.value / (totalMem.value * 1024)) * 100;
        }
        else if (usedMem.unit === 'GB' && totalMem.unit === 'MB') {
            return ((usedMem.value * 1024) / totalMem.value) * 100;
        }
        return 0;
    };
    if (loading && !healthData) {
        return (_jsxs("div", { className: "container mx-auto p-4 md:p-6 lg:p-8", children: [_jsxs("div", { className: "mb-8 flex items-center justify-between", children: [_jsx(Skeleton, { className: "h-10 w-64" }), _jsx(Skeleton, { className: "h-10 w-32" })] }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [...Array(3)].map((_, i) => (_jsx(Skeleton, { className: "h-40 w-full" }, i))) }), _jsx("div", { className: "mt-8", children: _jsx(Skeleton, { className: "h-64 w-full" }) })] }));
    }
    if (isErrorResponse(healthData)) {
        return (_jsx(PageShell, { mustBeTabletOrDesktop: false, noPadding: true, title: "Health Dashboard", children: _jsx(PageLayout, { icon: _jsx(Stethoscope, { className: "size-10 text-muted-foreground" }), title: "Health Dashboard", children: _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 container mx-auto h-full overflow-auto p-4 md:p-6 lg:p-8", children: _jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: healthData.message })] }) }) }) }));
    }
    const poolStatus = healthData?.services?.database?.poolStatus;
    const srv = healthData?.services?.server;
    return (_jsx(PageShell, { mustBeTabletOrDesktop: false, noPadding: true, title: "Health Dashboard", children: _jsx(PageLayout, { icon: _jsx(Stethoscope, { className: "size-10 text-muted-foreground" }), title: "Health Dashboard", subTitle: healthData && (_jsxs("div", { className: "flex items-center gap-4 text-muted-foreground text-sm", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Hash, { className: "size-3.5" }), _jsx("span", { className: "font-mono", children: healthData.version })] }), _jsx("span", { className: "text-muted-foreground/30", children: "\u2022" }), _jsxs("span", { className: "hidden items-center gap-1.5 md:flex", children: [_jsx(Clock, { className: "size-3.5" }), lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : 'Just now'] })] })), toolbar: _jsxs(Button, { onClick: fetchHealthData, variant: "default", className: "hidden md:inline-flex", "data-tip": "Manually refresh health data", activityId: "health-dashboard-refresh", children: [_jsx(RefreshCcw, { className: cn('h-4 w-4', loading && 'animate-spin') }), "Refresh"] }), children: _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 container mx-auto h-full overflow-auto p-4 md:p-6 lg:p-8", children: healthData && srv && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [_jsx(StatusCard, { title: "System", description: "Overall health status", status: healthData.status, icon: Activity, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: cn('font-semibold text-2xl', healthData.status === 'healthy' ? 'text-emerald-500' : 'text-red-500'), children: healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1) }), _jsxs("p", { className: "text-muted-foreground text-xs", children: ["Response: ", healthData.metrics.responseTime] })] }), healthData.status === 'healthy' ? (_jsx(CheckCircle2, { className: "size-8 text-emerald-500/20" })) : (_jsx(XCircle, { className: "size-8 text-red-500/20" }))] }) }), _jsx(StatusCard, { title: "Database", description: "Connection pool status", status: healthData.services.database.status, icon: Database, children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Response Time" }), _jsx("span", { className: "font-mono text-xs", children: healthData.services.database.responseTime })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Pool Connections" }), _jsxs("span", { className: "font-mono text-xs", children: [poolStatus?.idleCount, " idle / ", poolStatus?.totalCount, " total"] })] }), (poolStatus?.waitingCount ?? 0) > 0 && (_jsxs("div", { className: "flex items-center justify-between text-amber-500", children: [_jsx("span", { className: "text-xs", children: "Waiting" }), _jsx("span", { className: "font-mono text-xs", children: poolStatus?.waitingCount })] }))] }) }), _jsx(StatusCard, { title: "Server", description: "Application server", status: srv.status, icon: Server, children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Uptime" }), _jsx("span", { className: "font-mono text-xs", children: formatUptime(srv.uptime) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Environment" }), _jsx("span", { className: cn('rounded-full px-2 py-0.5 font-medium text-[10px]', srv.nodeEnv === 'production'
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-emerald-500/10 text-emerald-500'), children: srv.nodeEnv })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "PID" }), _jsx("span", { className: "font-mono text-xs", children: srv.process.pid })] })] }) })] }), _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4 md:w-[500px]", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "memory", children: "Memory" }), _jsx(TabsTrigger, { value: "cpu", children: "CPU" }), _jsx(TabsTrigger, { value: "system", children: "System" })] }), _jsx(TabsContent, { value: "overview", className: "mt-6", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: Monitor, title: "Quick Stats", description: "Key metrics at a glance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatItem, { icon: Timer, label: "Uptime", value: formatUptime(srv.uptime) }), _jsx(StatItem, { icon: Clock, label: "Timezone", value: srv.timezone }), _jsx(StatItem, { icon: Cpu, label: "CPU Cores", value: srv.cpu.cores, subValue: `Load: ${srv.cpu.loadAverage['1m']}` }), _jsx(StatItem, { icon: MemoryStick, label: "Heap Used", value: srv.memoryUsage.heapUsed, subValue: `of ${srv.memoryUsage.heapTotal}` }), _jsx(StatItem, { icon: Globe, label: "Hostname", value: srv.hostname }), _jsx(StatItem, { icon: Hash, label: "Process ID", value: srv.process.pid })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: MemoryStick, title: "Memory Overview", description: "Current allocation" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-[200px]", children: _jsx(MemoryChart, { heapUsed: parseMemoryValue(srv.memoryUsage.heapUsed).value, heapTotal: parseMemoryValue(srv.memoryUsage.heapTotal).value, systemUsed: parseMemoryValue(srv.systemMemory.used).value, systemTotal: parseMemoryValue(srv.systemMemory.total).value, heapUnit: parseMemoryValue(srv.memoryUsage.heapUsed).unit, systemUnit: parseMemoryValue(srv.systemMemory.used).unit }) }) })] })] }) }), _jsx(TabsContent, { value: "memory", className: "mt-6", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: MemoryStick, title: "Process Memory", description: "Node.js memory usage" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("span", { className: "font-medium text-sm", children: "Heap Memory" }), _jsxs("span", { className: "font-mono text-muted-foreground text-sm", children: [srv.memoryUsage.heapUsed, " / ", srv.memoryUsage.heapTotal] })] }), _jsx(Progress, { value: calculateMemoryPercentage({
                                                                            used: srv.memoryUsage.heapUsed,
                                                                            total: srv.memoryUsage.heapTotal,
                                                                        }), className: "h-2" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatItem, { icon: HardDrive, label: "RSS (Resident Set)", value: srv.memoryUsage.rss }), _jsx(StatItem, { icon: HardDrive, label: "External Memory", value: srv.memoryUsage.external }), _jsx(StatItem, { icon: HardDrive, label: "Array Buffers", value: srv.memoryUsage.arrayBuffers }), _jsx(StatItem, { icon: HardDrive, label: "Heap Total", value: srv.memoryUsage.heapTotal })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: Server, title: "System Memory", description: "Operating system memory" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("span", { className: "font-medium text-sm", children: "System Memory" }), _jsxs("span", { className: "font-mono text-muted-foreground text-sm", children: [srv.systemMemory.used, " / ", srv.systemMemory.total] })] }), _jsx(Progress, { value: calculateMemoryPercentage({
                                                                            used: srv.systemMemory.used,
                                                                            total: srv.systemMemory.total,
                                                                        }), className: "h-2" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatItem, { icon: HardDrive, label: "Total Memory", value: srv.systemMemory.total }), _jsx(StatItem, { icon: HardDrive, label: "Used Memory", value: srv.systemMemory.used }), _jsx(StatItem, { icon: HardDrive, label: "Free Memory", value: srv.systemMemory.free }), _jsx(StatItem, { icon: HardDrive, label: "Usage", value: `${calculateMemoryPercentage({ used: srv.systemMemory.used, total: srv.systemMemory.total }).toFixed(1)}%` })] })] })] })] }) }), _jsx(TabsContent, { value: "cpu", className: "mt-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: Cpu, title: "CPU Information", description: "Processor details and load" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(StatItem, { icon: Cpu, label: "CPU Model", value: srv.cpu.model }), _jsx(StatItem, { icon: Cpu, label: "CPU Cores", value: `${srv.cpu.cores} cores` })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-lg border bg-muted/30 p-4", children: [_jsx("h4", { className: "mb-3 font-medium text-sm", children: "Load Average" }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-mono font-semibold text-lg", children: srv.cpu.loadAverage['1m'] }), _jsx("p", { className: "text-muted-foreground text-xs", children: "1 min" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-mono font-semibold text-lg", children: srv.cpu.loadAverage['5m'] }), _jsx("p", { className: "text-muted-foreground text-xs", children: "5 min" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-mono font-semibold text-lg", children: srv.cpu.loadAverage['15m'] }), _jsx("p", { className: "text-muted-foreground text-xs", children: "15 min" })] })] })] }), _jsx("p", { className: "text-muted-foreground text-xs", children: "Load average represents the average system load over 1, 5, and 15 minute periods. A load of 1.0 means full utilization of one CPU core." })] })] }) })] }) }), _jsx(TabsContent, { value: "system", className: "mt-6", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: Monitor, title: "Platform", description: "Operating system details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatItem, { icon: Monitor, label: "Platform", value: srv.platform, subValue: srv.osVersion }), _jsx(StatItem, { icon: Cpu, label: "Architecture", value: srv.arch }), _jsx(StatItem, { icon: Globe, label: "Hostname", value: srv.hostname }), _jsx(StatItem, { icon: Clock, label: "Timezone", value: srv.timezone })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: Server, title: "Runtime", description: "Application runtime details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatItem, { icon: Server, label: "Node.js Version", value: srv.nodeVersion }), _jsx(StatItem, { icon: Activity, label: "Environment", value: srv.nodeEnv, className: srv.nodeEnv === 'production' ? 'text-red-500' : '' }), _jsx(StatItem, { icon: Hash, label: "Process ID", value: srv.process.pid }), _jsx(StatItem, { icon: Clock, label: "Started At", value: new Date(srv.process.startTime).toLocaleString() }), _jsx(StatItem, { icon: Timer, label: "Uptime", value: formatUptime(srv.uptime) }), _jsx(StatItem, { icon: ArrowDownUp, label: "Response Time", value: healthData.metrics.responseTime })] }) })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsx(CardHeader, { className: "pb-4", children: _jsx(SectionHeader, { icon: Hash, title: "Version Info", description: "Application and system versions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("div", { className: "rounded-lg border bg-muted/30 px-4 py-2", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: "App Version" }), _jsx("p", { className: "font-medium font-mono", children: healthData.version })] }), _jsxs("div", { className: "rounded-lg border bg-muted/30 px-4 py-2", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: "Node.js" }), _jsx("p", { className: "font-medium font-mono", children: srv.nodeVersion })] }), _jsxs("div", { className: "rounded-lg border bg-muted/30 px-4 py-2", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: "Platform" }), _jsxs("p", { className: "font-medium font-mono", children: [srv.platform, " ", srv.arch] })] }), _jsxs("div", { className: "rounded-lg border bg-muted/30 px-4 py-2", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: "OS Version" }), _jsx("p", { className: "font-medium font-mono", children: srv.osVersion })] }), _jsxs("div", { className: "rounded-lg border bg-muted/30 px-4 py-2", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: "Last Check" }), _jsx("p", { className: "font-medium font-mono", children: new Date(healthData.timestamp).toLocaleTimeString() })] })] }) })] })] }) })] }), _jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3", children: [_jsx("p", { className: "text-muted-foreground text-xs", children: "Health data refreshes automatically every 30 seconds" }), _jsxs("p", { className: "text-muted-foreground text-xs", children: ["Last refresh: ", lastUpdated?.toLocaleTimeString()] })] })] })) }) }) }));
}
//# sourceMappingURL=health-dashboard.js.map