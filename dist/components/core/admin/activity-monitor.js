/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { useCallback, useMemo, useState } from 'react';
import { addHours, addDays, addMinutes, format, parseISO } from 'date-fns';
import { Calendar, ChevronDown, Clock, Filter, RotateCcw, Users, Zap, MousePointer, Eye, LogIn } from 'lucide-react';
import WithActionData from '../../../components/core/WithActionData';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
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
const TIME_RANGES = [
  { value: '10m', label: 'Last 10 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
];
function getDateRange(range) {
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
function getRoundedISOString(date) {
  return new Date(Math.floor(date.getTime() / 1000) * 1000).toISOString();
}
// Helper to get filters for a time range
function getFiltersForRange(range, customFrom, customTo) {
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
  const [filters, setFilters] = useState(() => getFiltersForRange('10m'));
  const [timeRange, setTimeRange] = useState('10m');
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [eventType, setEventType] = useState(null);
  const [user, setUser] = useState(null);
  // Update filters when time range changes
  const handleTimeRangeChange = useCallback((newRange) => {
    setTimeRange(newRange);
    if (newRange !== 'custom') {
      setFilters(getFiltersForRange(newRange));
    }
  }, []);
  // Update filters when custom dates change
  const handleCustomFromChange = useCallback(
    (date) => {
      setCustomFrom(date);
      setTimeRange('custom');
      if (customTo) {
        setFilters(getFiltersForRange('custom', date, customTo));
      }
    },
    [customTo],
  );
  const handleCustomToChange = useCallback(
    (date) => {
      setCustomTo(date);
      setTimeRange('custom');
      if (customFrom) {
        setFilters(getFiltersForRange('custom', customFrom, date));
      }
    },
    [customFrom],
  );
  return _jsx(WithActionData, {
    action: 'getActivityEvents',
    params: [filters],
    fallback: _jsx(ActivitySkeleton, {}),
    children: (events) =>
      _jsx(ActivityMonitorContent, {
        events: events,
        eventType: eventType,
        user: user,
        setEventType: setEventType,
        setUser: setUser,
        timeRange: timeRange,
        onTimeRangeChange: handleTimeRangeChange,
        customFrom: customFrom,
        customTo: customTo,
        onCustomFromChange: handleCustomFromChange,
        onCustomToChange: handleCustomToChange,
      }),
  });
}
function ActivitySkeleton() {
  return _jsxs('div', {
    className: 'space-y-6',
    children: [
      _jsx('div', { className: 'h-16 animate-pulse rounded-xl bg-card/50' }),
      _jsx('div', {
        className: 'grid grid-cols-2 gap-4 lg:grid-cols-4',
        children: [...Array(4)].map((_, i) =>
          _jsx('div', { className: 'h-28 animate-pulse rounded-xl bg-card/50' }, i),
        ),
      }),
      _jsxs('div', {
        className: 'grid gap-6 lg:grid-cols-2',
        children: [
          _jsx('div', { className: 'h-80 animate-pulse rounded-xl bg-card/50' }),
          _jsx('div', { className: 'h-80 animate-pulse rounded-xl bg-card/50' }),
        ],
      }),
    ],
  });
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
}) {
  const eventTypes = useMemo(() => Array.from(new Set(events.map((e) => e.eventType))), [events]);
  const users = useMemo(() => Array.from(new Set(events.map((e) => e.userName))), [events]);
  return _jsxs('div', {
    className: 'flex flex-col gap-6',
    children: [
      _jsxs('div', {
        className:
          'flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm',
        children: [
          _jsxs(Popover, {
            children: [
              _jsx(PopoverTrigger, {
                asChild: true,
                children: _jsxs(Button, {
                  variant: 'outline',
                  className: 'h-9 gap-2 border-border/50 bg-background/50',
                  children: [
                    _jsx(Clock, { className: 'size-4 text-muted-foreground' }),
                    _jsx('span', { children: TIME_RANGES.find((r) => r.value === timeRange)?.label }),
                    _jsx(ChevronDown, { className: 'size-4 text-muted-foreground' }),
                  ],
                }),
              }),
              _jsxs(PopoverContent, {
                className: 'w-80 p-0',
                align: 'start',
                children: [
                  _jsx('div', {
                    className: 'grid gap-1 p-2',
                    children: TIME_RANGES.filter((r) => r.value !== 'custom').map((range) =>
                      _jsx(
                        Button,
                        {
                          variant: timeRange === range.value ? 'secondary' : 'ghost',
                          className: 'justify-start',
                          onClick: () => onTimeRangeChange(range.value),
                          children: range.label,
                        },
                        range.value,
                      ),
                    ),
                  }),
                  _jsx(DropdownMenuSeparator, {}),
                  _jsxs('div', {
                    className: 'space-y-3 p-4',
                    children: [
                      _jsx(Label, { className: 'text-muted-foreground text-xs', children: 'Custom Range' }),
                      _jsxs('div', {
                        className: 'grid grid-cols-2 gap-2',
                        children: [
                          _jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              _jsx(Label, { className: 'text-xs', children: 'From' }),
                              _jsx(Input, {
                                type: 'datetime-local',
                                className: 'h-8 text-xs',
                                value: customFrom ? format(customFrom, "yyyy-MM-dd'T'HH:mm") : '',
                                onChange: (e) => {
                                  if (e.target.value) {
                                    onCustomFromChange(new Date(e.target.value));
                                  }
                                },
                              }),
                            ],
                          }),
                          _jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              _jsx(Label, { className: 'text-xs', children: 'To' }),
                              _jsx(Input, {
                                type: 'datetime-local',
                                className: 'h-8 text-xs',
                                value: customTo ? format(customTo, "yyyy-MM-dd'T'HH:mm") : '',
                                onChange: (e) => {
                                  if (e.target.value) {
                                    onCustomToChange(new Date(e.target.value));
                                  }
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsx('div', { className: 'h-6 w-px bg-border/50' }),
          _jsxs(DropdownMenu, {
            children: [
              _jsx(DropdownMenuTrigger, {
                asChild: true,
                children: _jsxs(Button, {
                  variant: 'outline',
                  className: cn(
                    'h-9 gap-2 border-border/50 bg-background/50',
                    eventType && 'border-primary/50 bg-primary/10',
                  ),
                  children: [
                    _jsx(Filter, { className: 'size-4 text-muted-foreground' }),
                    _jsx('span', { children: eventType || 'All Events' }),
                    _jsx(ChevronDown, { className: 'size-4 text-muted-foreground' }),
                  ],
                }),
              }),
              _jsxs(DropdownMenuContent, {
                align: 'start',
                className: 'w-48',
                children: [
                  _jsx(DropdownMenuLabel, { className: 'text-muted-foreground text-xs', children: 'Event Type' }),
                  _jsx(DropdownMenuSeparator, {}),
                  _jsx(DropdownMenuCheckboxItem, {
                    checked: eventType === null,
                    onCheckedChange: () => setEventType(null),
                    children: 'All Events',
                  }),
                  eventTypes.map((type) =>
                    _jsx(
                      DropdownMenuCheckboxItem,
                      { checked: eventType === type, onCheckedChange: () => setEventType(type), children: type },
                      type,
                    ),
                  ),
                ],
              }),
            ],
          }),
          _jsxs(DropdownMenu, {
            children: [
              _jsx(DropdownMenuTrigger, {
                asChild: true,
                children: _jsxs(Button, {
                  variant: 'outline',
                  className: cn(
                    'h-9 gap-2 border-border/50 bg-background/50',
                    user && 'border-primary/50 bg-primary/10',
                  ),
                  children: [
                    _jsx(Users, { className: 'size-4 text-muted-foreground' }),
                    _jsx('span', { children: user || 'All Users' }),
                    _jsx(ChevronDown, { className: 'size-4 text-muted-foreground' }),
                  ],
                }),
              }),
              _jsxs(DropdownMenuContent, {
                align: 'start',
                className: 'w-48',
                children: [
                  _jsx(DropdownMenuLabel, { className: 'text-muted-foreground text-xs', children: 'User' }),
                  _jsx(DropdownMenuSeparator, {}),
                  _jsx(DropdownMenuCheckboxItem, {
                    checked: user === null,
                    onCheckedChange: () => setUser(null),
                    children: 'All Users',
                  }),
                  users.map((u) =>
                    _jsx(
                      DropdownMenuCheckboxItem,
                      { checked: user === u, onCheckedChange: () => setUser(u), children: u },
                      u,
                    ),
                  ),
                ],
              }),
            ],
          }),
          (eventType || user) &&
            _jsxs(_Fragment, {
              children: [
                _jsx('div', { className: 'h-6 w-px bg-border/50' }),
                _jsxs(Button, {
                  variant: 'ghost',
                  size: 'sm',
                  className: 'h-9 gap-2 text-muted-foreground hover:text-foreground',
                  onClick: () => {
                    setEventType(null);
                    setUser(null);
                  },
                  children: [_jsx(RotateCcw, { className: 'size-4' }), 'Clear filters'],
                }),
              ],
            }),
        ],
      }),
      _jsx(ActivityDashboard, { events: events, eventType: eventType, user: user }),
    ],
  });
}
const EVENT_CONFIG = {
  'Page View': { icon: Eye, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  Action: { icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  'Sidebar Click': { icon: MousePointer, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  Query: { icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  'Sign In': { icon: LogIn, color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
};
const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4', '#84cc16'];
function ActivityDashboard({ events, eventType, user }) {
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (eventType && e.eventType !== eventType) return false;
      if (user && e.userName !== user) return false;
      return true;
    });
  }, [events, eventType, user]);
  const stats = useMemo(() => {
    const byType = {};
    for (const e of filteredEvents) {
      byType[e.eventType] = (byType[e.eventType] || 0) + 1;
    }
    return Object.entries(byType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);
  const timelineData = useMemo(() => {
    const byTime = {};
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
  return _jsxs('div', {
    className: 'space-y-6',
    children: [
      _jsx('div', {
        className: 'grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5',
        children: stats.slice(0, 5).map((stat, index) => {
          const config = EVENT_CONFIG[stat.type] || {
            icon: Zap,
            color: 'text-gray-400',
            bgColor: 'bg-gray-500/10',
          };
          const Icon = config.icon;
          return _jsxs(
            'div',
            {
              className:
                'group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg',
              children: [
                _jsxs('div', {
                  className: 'flex items-start justify-between',
                  children: [
                    _jsxs('div', {
                      className: 'space-y-2',
                      children: [
                        _jsx('p', { className: 'text-muted-foreground text-sm', children: stat.type }),
                        _jsx('p', { className: 'font-semibold text-3xl tracking-tight', children: stat.count }),
                      ],
                    }),
                    _jsx('div', {
                      className: cn('rounded-lg p-2.5', config.bgColor),
                      children: _jsx(Icon, { className: cn('size-5', config.color) }),
                    }),
                  ],
                }),
                _jsx('div', {
                  className: 'absolute inset-x-0 bottom-0 h-1 opacity-50',
                  style: { background: CHART_COLORS[index % CHART_COLORS.length] },
                }),
              ],
            },
            stat.type,
          );
        }),
      }),
      _jsxs('div', {
        className: 'grid gap-6 lg:grid-cols-2',
        children: [
          _jsxs('div', {
            className:
              'rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm',
            children: [
              _jsx('h3', {
                className: 'mb-4 font-medium text-muted-foreground text-sm',
                children: 'Activity Over Time',
              }),
              _jsx('div', {
                className: 'h-64',
                children: _jsx(ResponsiveContainer, {
                  width: '100%',
                  height: '100%',
                  children: _jsxs(AreaChart, {
                    data: timelineData,
                    margin: { top: 10, right: 10, left: -20, bottom: 0 },
                    children: [
                      _jsx('defs', {
                        children: _jsxs('linearGradient', {
                          id: 'colorCount',
                          x1: '0',
                          y1: '0',
                          x2: '0',
                          y2: '1',
                          children: [
                            _jsx('stop', { offset: '5%', stopColor: '#3b82f6', stopOpacity: 0.3 }),
                            _jsx('stop', { offset: '95%', stopColor: '#3b82f6', stopOpacity: 0 }),
                          ],
                        }),
                      }),
                      _jsx(XAxis, {
                        dataKey: 'time',
                        axisLine: false,
                        tickLine: false,
                        tick: { fill: '#6b7280', fontSize: 11 },
                        interval: 'preserveStartEnd',
                      }),
                      _jsx(YAxis, {
                        axisLine: false,
                        tickLine: false,
                        tick: { fill: '#6b7280', fontSize: 11 },
                        allowDecimals: false,
                      }),
                      _jsx(Tooltip, {
                        contentStyle: {
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        },
                        itemStyle: { color: 'hsl(var(--foreground))' },
                        labelStyle: { color: 'hsl(var(--foreground))' },
                      }),
                      _jsx(Area, {
                        type: 'monotone',
                        dataKey: 'count',
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        fillOpacity: 1,
                        fill: 'url(#colorCount)',
                      }),
                    ],
                  }),
                }),
              }),
            ],
          }),
          _jsxs('div', {
            className:
              'rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm',
            children: [
              _jsx('h3', {
                className: 'mb-4 font-medium text-muted-foreground text-sm',
                children: 'Event Distribution',
              }),
              _jsx('div', {
                className: 'h-64',
                children: _jsx(ResponsiveContainer, {
                  width: '100%',
                  height: '100%',
                  children: _jsxs(PieChart, {
                    children: [
                      _jsx(Pie, {
                        data: pieData,
                        dataKey: 'value',
                        nameKey: 'name',
                        cx: '50%',
                        cy: '50%',
                        innerRadius: 50,
                        outerRadius: 80,
                        paddingAngle: 4,
                        strokeWidth: 0,
                        children: pieData.map((_entry, index) =>
                          _jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`),
                        ),
                      }),
                      _jsx(Tooltip, {
                        contentStyle: {
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        },
                        itemStyle: { color: 'hsl(var(--foreground))' },
                      }),
                    ],
                  }),
                }),
              }),
              _jsx('div', {
                className: 'mt-4 flex flex-wrap justify-center gap-4',
                children: pieData.map((entry, index) =>
                  _jsxs(
                    'div',
                    {
                      className: 'flex items-center gap-2',
                      children: [
                        _jsx('div', {
                          className: 'size-2.5 rounded-full',
                          style: { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
                        }),
                        _jsx('span', { className: 'text-muted-foreground text-xs', children: entry.name }),
                        _jsx('span', { className: 'font-medium text-xs', children: entry.value }),
                      ],
                    },
                    entry.name,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        className: 'rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm',
        children: [
          _jsx('h3', { className: 'mb-4 font-medium text-muted-foreground text-sm', children: 'Events by Type' }),
          _jsx('div', {
            className: 'h-64',
            children: _jsx(ResponsiveContainer, {
              width: '100%',
              height: '100%',
              children: _jsxs(BarChart, {
                data: stats,
                layout: 'vertical',
                margin: { top: 10, right: 30, left: 60, bottom: 0 },
                children: [
                  _jsx(XAxis, {
                    type: 'number',
                    axisLine: false,
                    tickLine: false,
                    tick: { fill: '#6b7280', fontSize: 11 },
                  }),
                  _jsx(YAxis, {
                    type: 'category',
                    dataKey: 'type',
                    axisLine: false,
                    tickLine: false,
                    tick: { fill: '#6b7280', fontSize: 11 },
                    width: 80,
                  }),
                  _jsx(Tooltip, {
                    contentStyle: {
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    },
                    itemStyle: { color: 'hsl(var(--foreground))' },
                    labelStyle: { color: 'hsl(var(--foreground))' },
                    cursor: { fill: 'hsl(var(--muted))', opacity: 0.3 },
                  }),
                  _jsx(Bar, {
                    dataKey: 'count',
                    radius: [0, 4, 4, 0],
                    maxBarSize: 32,
                    children: stats.map((_entry, index) =>
                      _jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`),
                    ),
                  }),
                ],
              }),
            }),
          }),
        ],
      }),
      _jsxs('div', {
        className: 'rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
        children: [
          _jsx('div', {
            className: 'border-border/50 border-b px-6 py-4',
            children: _jsx('h3', {
              className: 'font-medium text-muted-foreground text-sm',
              children: 'Recent Activity',
            }),
          }),
          _jsx('div', {
            className: 'max-h-96 overflow-auto',
            children: _jsxs('table', {
              className: 'w-full',
              children: [
                _jsx('thead', {
                  className: 'sticky top-0 bg-card/95 backdrop-blur-sm',
                  children: _jsxs('tr', {
                    className: 'border-border/50 border-b text-left text-muted-foreground text-xs',
                    children: [
                      _jsx('th', { className: 'px-6 py-3 font-medium', children: 'Time' }),
                      _jsx('th', { className: 'px-6 py-3 font-medium', children: 'Event' }),
                      _jsx('th', { className: 'px-6 py-3 font-medium', children: 'User' }),
                      _jsx('th', { className: 'px-6 py-3 font-medium', children: 'Page' }),
                      _jsx('th', { className: 'px-6 py-3 text-right font-medium', children: 'Duration' }),
                    ],
                  }),
                }),
                _jsx('tbody', {
                  className: 'divide-y divide-border/30',
                  children: filteredEvents.slice(0, 20).map((event, index) => {
                    const config = EVENT_CONFIG[event.eventType] || {
                      icon: Zap,
                      color: 'text-gray-400',
                      bgColor: 'bg-gray-500/10',
                    };
                    const Icon = config.icon;
                    return _jsxs(
                      'tr',
                      {
                        className: 'transition-colors hover:bg-muted/30',
                        children: [
                          _jsx('td', {
                            className: 'px-6 py-3 font-mono text-muted-foreground text-xs',
                            children: format(parseISO(event.createdAt), 'HH:mm:ss'),
                          }),
                          _jsx('td', {
                            className: 'px-6 py-3',
                            children: _jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                _jsx('div', {
                                  className: cn('rounded p-1', config.bgColor),
                                  children: _jsx(Icon, { className: cn('size-3', config.color) }),
                                }),
                                _jsx('span', { className: 'text-sm', children: event.eventType }),
                              ],
                            }),
                          }),
                          _jsx('td', { className: 'px-6 py-3 text-sm', children: event.userName }),
                          _jsx('td', {
                            className: 'max-w-48 truncate px-6 py-3 text-muted-foreground text-xs',
                            children: event.pageUrl || '—',
                          }),
                          _jsx('td', {
                            className: 'px-6 py-3 text-right font-mono text-muted-foreground text-xs',
                            children: event.elapsedTimeMs ? `${event.elapsedTimeMs}ms` : '—',
                          }),
                        ],
                      },
                      event.eventId || `event-${index}`,
                    );
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=activity-monitor.js.map
