/* Copyright (c) 2024-present Venky Corp. */
'use client';

import { useCallback, useMemo, useState } from 'react';
import { addHours, addDays, addMinutes, format, parseISO } from 'date-fns';
import { Calendar, ChevronDown, Clock, Filter, RotateCcw, Users, Zap, MousePointer, Eye, LogIn } from 'lucide-react';
import WithActionData from '@/components/core/WithActionData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActivityFilters } from '@/app/(secure)/admin/monitoring/activity/data';
import type { Activity } from '@/lib/core/common/types/Activity';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

type TimeRange = '10m' | '1h' | '24h' | '7d' | '30d' | 'custom';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '10m', label: 'Last 10 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
];

function getDateRange(range: TimeRange): { from: Date; to: Date } {
  const now = new Date();
  switch (range) {
    case '10m':
      return { from: addMinutes(now, -10), to: now };
    case '1h':
      return { from: addHours(now, -1), to: now };
    case '24h':
      return { from: addHours(now, -24), to: now };
    case '7d':
      return { from: addDays(now, -7), to: now };
    case '30d':
      return { from: addDays(now, -30), to: now };
    default:
      return { from: addMinutes(now, -10), to: now };
  }
}

// Helper to create rounded ISO strings (no milliseconds)
function getRoundedISOString(date: Date): string {
  return new Date(Math.floor(date.getTime() / 1000) * 1000).toISOString();
}

// Helper to get filters for a time range
function getFiltersForRange(range: TimeRange, customFrom?: Date | null, customTo?: Date | null): ActivityFilters {
  if (range === 'custom' && customFrom && customTo) {
    return {
      fromDate: getRoundedISOString(customFrom),
      toDate: getRoundedISOString(customTo),
    };
  }
  const { from, to } = getDateRange(range);
  return {
    fromDate: getRoundedISOString(from),
    toDate: getRoundedISOString(to),
  };
}

export default function ActivityMonitor() {
  // Initialize filters ONCE with lazy initializer - stable across remounts
  const [filters, setFilters] = useState<ActivityFilters>(() => getFiltersForRange('10m'));
  const [timeRange, setTimeRange] = useState<TimeRange>('10m');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [eventType, setEventType] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  // Update filters when time range changes
  const handleTimeRangeChange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange);
    if (newRange !== 'custom') {
      setFilters(getFiltersForRange(newRange));
    }
  }, []);

  // Update filters when custom dates change
  const handleCustomFromChange = useCallback(
    (date: Date) => {
      setCustomFrom(date);
      setTimeRange('custom');
      if (customTo) {
        setFilters(getFiltersForRange('custom', date, customTo));
      }
    },
    [customTo],
  );

  const handleCustomToChange = useCallback(
    (date: Date) => {
      setCustomTo(date);
      setTimeRange('custom');
      if (customFrom) {
        setFilters(getFiltersForRange('custom', customFrom, date));
      }
    },
    [customFrom],
  );

  return (
    <WithActionData<'getActivityEvents'> action="getActivityEvents" params={[filters]} fallback={<ActivitySkeleton />}>
      {(events) => (
        <ActivityMonitorContent
          events={events as readonly Activity[]}
          eventType={eventType}
          user={user}
          setEventType={setEventType}
          setUser={setUser}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={handleCustomFromChange}
          onCustomToChange={handleCustomToChange}
        />
      )}
    </WithActionData>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-xl bg-card/50" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
          <div key={i} className="h-28 animate-pulse rounded-xl bg-card/50" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-card/50" />
        <div className="h-80 animate-pulse rounded-xl bg-card/50" />
      </div>
    </div>
  );
}

interface ContentProps {
  events: readonly Activity[];
  eventType: string | null;
  user: string | null;
  setEventType: (v: string | null) => void;
  setUser: (v: string | null) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (v: TimeRange) => void;
  customFrom: Date | null;
  customTo: Date | null;
  onCustomFromChange: (v: Date) => void;
  onCustomToChange: (v: Date) => void;
}

function ActivityMonitorContent({
  events,
  eventType,
  user,
  setEventType,
  setUser,
  timeRange,
  onTimeRangeChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: ContentProps) {
  const eventTypes = useMemo(() => Array.from(new Set(events.map((e) => e.eventType))), [events]);
  const users = useMemo(() => Array.from(new Set(events.map((e) => e.userName))), [events]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm">
        {/* Time Range Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 gap-2 border-border/50 bg-background/50">
              <Clock className="size-4 text-muted-foreground" />
              <span>{TIME_RANGES.find((r) => r.value === timeRange)?.label}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="grid gap-1 p-2">
              {TIME_RANGES.filter((r) => r.value !== 'custom').map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => onTimeRangeChange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-3 p-4">
              <Label className="text-muted-foreground text-xs">Custom Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="datetime-local"
                    className="h-8 text-xs"
                    value={customFrom ? format(customFrom, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        onCustomFromChange(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="datetime-local"
                    className="h-8 text-xs"
                    value={customTo ? format(customTo, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        onCustomToChange(new Date(e.target.value));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-6 w-px bg-border/50" />

        {/* Event Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 gap-2 border-border/50 bg-background/50',
                eventType && 'border-primary/50 bg-primary/10',
              )}
            >
              <Filter className="size-4 text-muted-foreground" />
              <span>{eventType || 'All Events'}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-muted-foreground text-xs">Event Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={eventType === null} onCheckedChange={() => setEventType(null)}>
              All Events
            </DropdownMenuCheckboxItem>
            {eventTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={eventType === type}
                onCheckedChange={() => setEventType(type)}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn('h-9 gap-2 border-border/50 bg-background/50', user && 'border-primary/50 bg-primary/10')}
            >
              <Users className="size-4 text-muted-foreground" />
              <span>{user || 'All Users'}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-muted-foreground text-xs">User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={user === null} onCheckedChange={() => setUser(null)}>
              All Users
            </DropdownMenuCheckboxItem>
            {users.map((u) => (
              <DropdownMenuCheckboxItem key={u} checked={user === u} onCheckedChange={() => setUser(u)}>
                {u}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(eventType || user) && (
          <>
            <div className="h-6 w-px bg-border/50" />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEventType(null);
                setUser(null);
              }}
            >
              <RotateCcw className="size-4" />
              Clear filters
            </Button>
          </>
        )}
      </div>

      {/* Main Content */}
      <ActivityDashboard events={events} eventType={eventType} user={user} />
    </div>
  );
}

interface DashboardProps {
  events: readonly Activity[];
  eventType: string | null;
  user: string | null;
}

const EVENT_CONFIG: Record<string, { icon: typeof Zap; color: string; bgColor: string }> = {
  'Page View': { icon: Eye, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  Action: { icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  'Sidebar Click': { icon: MousePointer, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  Query: { icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  'Sign In': { icon: LogIn, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
};

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4', '#84cc16'];

function ActivityDashboard({ events, eventType, user }: DashboardProps) {
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (eventType && e.eventType !== eventType) return false;
      if (user && e.userName !== user) return false;
      return true;
    });
  }, [events, eventType, user]);

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const e of filteredEvents) {
      byType[e.eventType] = (byType[e.eventType] || 0) + 1;
    }
    return Object.entries(byType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  const timelineData = useMemo(() => {
    const byTime: Record<string, number> = {};
    for (const e of filteredEvents) {
      const time = format(parseISO(e.createdAt), 'HH:mm');
      byTime[time] = (byTime[time] || 0) + 1;
    }
    return Object.entries(byTime)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredEvents]);

  const pieData = useMemo(() => {
    return stats.map((s) => ({ name: s.type, value: s.count }));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {stats.slice(0, 5).map((stat, index) => {
          const config = EVENT_CONFIG[stat.type] || {
            icon: Zap,
            color: 'text-gray-400',
            bgColor: 'bg-gray-500/10',
          };
          const Icon = config.icon;

          return (
            <div
              key={stat.type}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">{stat.type}</p>
                  <p className="font-semibold text-3xl tracking-tight">{stat.count}</p>
                </div>
                <div className={cn('rounded-lg p-2.5', config.bgColor)}>
                  <Icon className={cn('size-5', config.color)} />
                </div>
              </div>
              {/* Subtle gradient accent */}
              <div
                className="absolute inset-x-0 bottom-0 h-1 opacity-50"
                style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              />
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline Chart */}
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-medium text-muted-foreground text-sm">Activity Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-medium text-muted-foreground text-sm">Event Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {pieData.map((_entry, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: chart data
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-muted-foreground text-xs">{entry.name}</span>
                <span className="font-medium text-xs">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Bar Chart */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-medium text-muted-foreground text-sm">Events by Type</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="type"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
                {stats.map((_entry, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: chart data
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
        <div className="border-border/50 border-b px-6 py-4">
          <h3 className="font-medium text-muted-foreground text-sm">Recent Activity</h3>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card/95 backdrop-blur-sm">
              <tr className="border-border/50 border-b text-left text-muted-foreground text-xs">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Page</th>
                <th className="px-6 py-3 text-right font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredEvents.slice(0, 20).map((event, index) => {
                const config = EVENT_CONFIG[event.eventType] || {
                  icon: Zap,
                  color: 'text-gray-400',
                  bgColor: 'bg-gray-500/10',
                };
                const Icon = config.icon;

                return (
                  <tr key={event.eventId || `event-${index}`} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3 font-mono text-muted-foreground text-xs">
                      {format(parseISO(event.createdAt), 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('rounded p-1', config.bgColor)}>
                          <Icon className={cn('size-3', config.color)} />
                        </div>
                        <span className="text-sm">{event.eventType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">{event.userName}</td>
                    <td className="max-w-48 truncate px-6 py-3 text-muted-foreground text-xs">
                      {event.pageUrl || '—'}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-muted-foreground text-xs">
                      {event.elapsedTimeMs ? `${event.elapsedTimeMs}ms` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
