/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { MemoryChart } from '@/components/core/admin/memory-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/core/page/PageLayout';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Hash,
  MemoryStick,
  Monitor,
  RefreshCcw,
  Server,
  Stethoscope,
  Timer,
  XCircle,
} from 'lucide-react';
import clientLogger from '@/lib/core/client/client-logger';
import { useCallback, useEffect, useState } from 'react';
import PageShell from '@/components/core/page/page-shell';
import type { PoolStatus } from '@/lib/core/common/types/PoolStatus';
import { isErrorResponse, type ErrorResponse } from '@/lib/core/common/error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLoadingControl } from '@/lib/core/client/loading-tracker';
import { cn } from '@/lib/utils';

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
  services: {
    database: {
      status: string;
      responseTime: string;
      poolStatus: PoolStatus;
    };
    server: {
      status: string;
      uptime: number;
      memoryUsage: {
        rss: string;
        heapTotal: string;
        heapUsed: string;
        external: string;
        arrayBuffers: string;
      };
      systemMemory: {
        total: string;
        free: string;
        used: string;
      };
      cpu: {
        model: string;
        cores: number;
        loadAverage: {
          '1m': string;
          '5m': string;
          '15m': string;
        };
      };
      process: {
        pid: number;
        startTime: string;
      };
      platform: string;
      arch: string;
      osVersion: string;
      hostname: string;
      nodeVersion: string;
      nodeEnv: string;
      timezone: string;
    };
  };
  metrics: {
    responseTime: string;
  };
}

// Stat item component for consistent styling
function StatItem({
  icon: Icon,
  label,
  value,
  subValue,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate font-medium text-sm">{value}</p>
        {subValue && <p className="truncate text-muted-foreground text-xs">{subValue}</p>}
      </div>
    </div>
  );
}

// Status indicator component
function StatusIndicator({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const isHealthy = status.toLowerCase() === 'healthy';
  const sizeClasses = {
    sm: 'size-2',
    md: 'size-3',
    lg: 'size-4',
  };

  return (
    <span className="relative flex items-center gap-2">
      <span className={cn('relative flex', sizeClasses[size])}>
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            isHealthy ? 'bg-emerald-400' : 'bg-red-400',
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full',
            sizeClasses[size],
            isHealthy ? 'bg-emerald-500' : 'bg-red-500',
          )}
        />
      </span>
    </span>
  );
}

// Status card component
function StatusCard({
  title,
  description,
  status,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) {
  const isHealthy = status.toLowerCase() === 'healthy';

  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          isHealthy ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500',
        )}
      />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-xl',
                isHealthy ? 'bg-emerald-500/10' : 'bg-red-500/10',
              )}
            >
              <Icon className={cn('size-5', isHealthy ? 'text-emerald-500' : 'text-red-500')} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <StatusIndicator status={status} size="md" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// Section header component
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
    </div>
  );
}

export function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null | ErrorResponse>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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
    } catch (error) {
      clientLogger.error({
        message: 'Failed to fetch health data',
        error,
      });
    } finally {
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

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const parseMemoryValue = (value: string) => {
    const match = value.match(/^([\d.]+)([A-Z]+)$/);
    if (match) {
      const [, num, unit] = match;
      return { value: Number.parseFloat(num), unit };
    }
    return { value: 0, unit: '' };
  };

  const calculateMemoryPercentage = ({ used, total }: { used: string; total: string }) => {
    const usedMem = parseMemoryValue(used);
    const totalMem = parseMemoryValue(total);

    if (usedMem.unit === totalMem.unit) {
      return (usedMem.value / totalMem.value) * 100;
    }

    // Simple conversion if units are different (GB to MB or vice versa)
    if (usedMem.unit === 'MB' && totalMem.unit === 'GB') {
      return (usedMem.value / (totalMem.value * 1024)) * 100;
    } else if (usedMem.unit === 'GB' && totalMem.unit === 'MB') {
      return ((usedMem.value * 1024) / totalMem.value) * 100;
    }

    return 0;
  };

  if (loading && !healthData) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
        <div className="mt-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isErrorResponse(healthData)) {
    return (
      <PageShell mustBeTabletOrDesktop={false} noPadding title="Health Dashboard">
        <PageLayout icon={<Stethoscope className="size-10 text-muted-foreground" />} title="Health Dashboard">
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 container mx-auto h-full overflow-auto p-4 md:p-6 lg:p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{healthData.message}</AlertDescription>
            </Alert>
          </div>
        </PageLayout>
      </PageShell>
    );
  }

  const poolStatus = healthData?.services?.database?.poolStatus;
  const srv = healthData?.services?.server;

  return (
    <PageShell mustBeTabletOrDesktop={false} noPadding title="Health Dashboard">
      <PageLayout
        icon={<Stethoscope className="size-10 text-muted-foreground" />}
        title="Health Dashboard"
        subTitle={
          healthData && (
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <Hash className="size-3.5" />
                <span className="font-mono">{healthData.version}</span>
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="hidden items-center gap-1.5 md:flex">
                <Clock className="size-3.5" />
                {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : 'Just now'}
              </span>
            </div>
          )
        }
        toolbar={
          <Button
            onClick={fetchHealthData}
            variant="default"
            className="hidden md:inline-flex"
            data-tip="Manually refresh health data"
            activityId="health-dashboard-refresh"
          >
            <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        }
      >
        <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 container mx-auto h-full overflow-auto p-4 md:p-6 lg:p-8">
          {healthData && srv && (
            <div className="space-y-8">
              {/* Status Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatusCard
                  title="System"
                  description="Overall health status"
                  status={healthData.status}
                  icon={Activity}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={cn(
                          'font-semibold text-2xl',
                          healthData.status === 'healthy' ? 'text-emerald-500' : 'text-red-500',
                        )}
                      >
                        {healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
                      </p>
                      <p className="text-muted-foreground text-xs">Response: {healthData.metrics.responseTime}</p>
                    </div>
                    {healthData.status === 'healthy' ? (
                      <CheckCircle2 className="size-8 text-emerald-500/20" />
                    ) : (
                      <XCircle className="size-8 text-red-500/20" />
                    )}
                  </div>
                </StatusCard>

                <StatusCard
                  title="Database"
                  description="Connection pool status"
                  status={healthData.services.database.status}
                  icon={Database}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Response Time</span>
                      <span className="font-mono text-xs">{healthData.services.database.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Pool Connections</span>
                      <span className="font-mono text-xs">
                        {poolStatus?.idleCount} idle / {poolStatus?.totalCount} total
                      </span>
                    </div>
                    {(poolStatus?.waitingCount ?? 0) > 0 && (
                      <div className="flex items-center justify-between text-amber-500">
                        <span className="text-xs">Waiting</span>
                        <span className="font-mono text-xs">{poolStatus?.waitingCount}</span>
                      </div>
                    )}
                  </div>
                </StatusCard>

                <StatusCard title="Server" description="Application server" status={srv.status} icon={Server}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Uptime</span>
                      <span className="font-mono text-xs">{formatUptime(srv.uptime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Environment</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-medium text-[10px]',
                          srv.nodeEnv === 'production'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-emerald-500/10 text-emerald-500',
                        )}
                      >
                        {srv.nodeEnv}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">PID</span>
                      <span className="font-mono text-xs">{srv.process.pid}</span>
                    </div>
                  </div>
                </StatusCard>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 md:w-[500px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="cpu">CPU</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Quick Stats */}
                    <Card>
                      <CardHeader className="pb-4">
                        <SectionHeader icon={Monitor} title="Quick Stats" description="Key metrics at a glance" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <StatItem icon={Timer} label="Uptime" value={formatUptime(srv.uptime)} />
                          <StatItem icon={Clock} label="Timezone" value={srv.timezone} />
                          <StatItem
                            icon={Cpu}
                            label="CPU Cores"
                            value={srv.cpu.cores}
                            subValue={`Load: ${srv.cpu.loadAverage['1m']}`}
                          />
                          <StatItem
                            icon={MemoryStick}
                            label="Heap Used"
                            value={srv.memoryUsage.heapUsed}
                            subValue={`of ${srv.memoryUsage.heapTotal}`}
                          />
                          <StatItem icon={Globe} label="Hostname" value={srv.hostname} />
                          <StatItem icon={Hash} label="Process ID" value={srv.process.pid} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Memory Overview */}
                    <Card>
                      <CardHeader className="pb-4">
                        <SectionHeader icon={MemoryStick} title="Memory Overview" description="Current allocation" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px]">
                          <MemoryChart
                            heapUsed={parseMemoryValue(srv.memoryUsage.heapUsed).value}
                            heapTotal={parseMemoryValue(srv.memoryUsage.heapTotal).value}
                            systemUsed={parseMemoryValue(srv.systemMemory.used).value}
                            systemTotal={parseMemoryValue(srv.systemMemory.total).value}
                            heapUnit={parseMemoryValue(srv.memoryUsage.heapUsed).unit}
                            systemUnit={parseMemoryValue(srv.systemMemory.used).unit}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="memory" className="mt-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Process Memory */}
                    <Card>
                      <CardHeader className="pb-4">
                        <SectionHeader icon={MemoryStick} title="Process Memory" description="Node.js memory usage" />
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium text-sm">Heap Memory</span>
                            <span className="font-mono text-muted-foreground text-sm">
                              {srv.memoryUsage.heapUsed} / {srv.memoryUsage.heapTotal}
                            </span>
                          </div>
                          <Progress
                            value={calculateMemoryPercentage({
                              used: srv.memoryUsage.heapUsed,
                              total: srv.memoryUsage.heapTotal,
                            })}
                            className="h-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <StatItem icon={HardDrive} label="RSS (Resident Set)" value={srv.memoryUsage.rss} />
                          <StatItem icon={HardDrive} label="External Memory" value={srv.memoryUsage.external} />
                          <StatItem icon={HardDrive} label="Array Buffers" value={srv.memoryUsage.arrayBuffers} />
                          <StatItem icon={HardDrive} label="Heap Total" value={srv.memoryUsage.heapTotal} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* System Memory */}
                    <Card>
                      <CardHeader className="pb-4">
                        <SectionHeader icon={Server} title="System Memory" description="Operating system memory" />
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium text-sm">System Memory</span>
                            <span className="font-mono text-muted-foreground text-sm">
                              {srv.systemMemory.used} / {srv.systemMemory.total}
                            </span>
                          </div>
                          <Progress
                            value={calculateMemoryPercentage({
                              used: srv.systemMemory.used,
                              total: srv.systemMemory.total,
                            })}
                            className="h-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <StatItem icon={HardDrive} label="Total Memory" value={srv.systemMemory.total} />
                          <StatItem icon={HardDrive} label="Used Memory" value={srv.systemMemory.used} />
                          <StatItem icon={HardDrive} label="Free Memory" value={srv.systemMemory.free} />
                          <StatItem
                            icon={HardDrive}
                            label="Usage"
                            value={`${calculateMemoryPercentage({ used: srv.systemMemory.used, total: srv.systemMemory.total }).toFixed(1)}%`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="cpu" className="mt-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <SectionHeader icon={Cpu} title="CPU Information" description="Processor details and load" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                          <StatItem icon={Cpu} label="CPU Model" value={srv.cpu.model} />
                          <StatItem icon={Cpu} label="CPU Cores" value={`${srv.cpu.cores} cores`} />
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border bg-muted/30 p-4">
                            <h4 className="mb-3 font-medium text-sm">Load Average</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="font-mono font-semibold text-lg">{srv.cpu.loadAverage['1m']}</p>
                                <p className="text-muted-foreground text-xs">1 min</p>
                              </div>
                              <div className="text-center">
                                <p className="font-mono font-semibold text-lg">{srv.cpu.loadAverage['5m']}</p>
                                <p className="text-muted-foreground text-xs">5 min</p>
                              </div>
                              <div className="text-center">
                                <p className="font-mono font-semibold text-lg">{srv.cpu.loadAverage['15m']}</p>
                                <p className="text-muted-foreground text-xs">15 min</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Load average represents the average system load over 1, 5, and 15 minute periods. A load of
                            1.0 means full utilization of one CPU core.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="system" className="mt-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Platform Info */}
                    <Card>
                      <CardHeader className="pb-4">
                        <SectionHeader icon={Monitor} title="Platform" description="Operating system details" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <StatItem icon={Monitor} label="Platform" value={srv.platform} subValue={srv.osVersion} />
                          <StatItem icon={Cpu} label="Architecture" value={srv.arch} />
                          <StatItem icon={Globe} label="Hostname" value={srv.hostname} />
                          <StatItem icon={Clock} label="Timezone" value={srv.timezone} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Runtime Info */}
                    <Card>
                      <CardHeader className="pb-4">
                        <SectionHeader icon={Server} title="Runtime" description="Application runtime details" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <StatItem icon={Server} label="Node.js Version" value={srv.nodeVersion} />
                          <StatItem
                            icon={Activity}
                            label="Environment"
                            value={srv.nodeEnv}
                            className={srv.nodeEnv === 'production' ? 'text-red-500' : ''}
                          />
                          <StatItem icon={Hash} label="Process ID" value={srv.process.pid} />
                          <StatItem
                            icon={Clock}
                            label="Started At"
                            value={new Date(srv.process.startTime).toLocaleString()}
                          />
                          <StatItem icon={Timer} label="Uptime" value={formatUptime(srv.uptime)} />
                          <StatItem icon={ArrowDownUp} label="Response Time" value={healthData.metrics.responseTime} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Version Info */}
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-4">
                        <SectionHeader icon={Hash} title="Version Info" description="Application and system versions" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-lg border bg-muted/30 px-4 py-2">
                            <p className="text-muted-foreground text-xs">App Version</p>
                            <p className="font-medium font-mono">{healthData.version}</p>
                          </div>
                          <div className="rounded-lg border bg-muted/30 px-4 py-2">
                            <p className="text-muted-foreground text-xs">Node.js</p>
                            <p className="font-medium font-mono">{srv.nodeVersion}</p>
                          </div>
                          <div className="rounded-lg border bg-muted/30 px-4 py-2">
                            <p className="text-muted-foreground text-xs">Platform</p>
                            <p className="font-medium font-mono">
                              {srv.platform} {srv.arch}
                            </p>
                          </div>
                          <div className="rounded-lg border bg-muted/30 px-4 py-2">
                            <p className="text-muted-foreground text-xs">OS Version</p>
                            <p className="font-medium font-mono">{srv.osVersion}</p>
                          </div>
                          <div className="rounded-lg border bg-muted/30 px-4 py-2">
                            <p className="text-muted-foreground text-xs">Last Check</p>
                            <p className="font-medium font-mono">
                              {new Date(healthData.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-muted-foreground text-xs">Health data refreshes automatically every 30 seconds</p>
                <p className="text-muted-foreground text-xs">Last refresh: {lastUpdated?.toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </PageShell>
  );
}
