/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import { Calendar, Globe } from 'lucide-react';
import { SiGooglechrome } from '@icons-pack/react-simple-icons';
const STATUS_COLORS = {
  active: '#10b981',
  expired: '#f59e0b',
  'signed-out': '#3b82f6',
};
const BROWSER_COLORS = {
  Chrome: '#4285F4',
  Firefox: '#FF7139',
  Safari: '#0fb5ee',
  Edge: '#0078D7',
  Other: '#6b7280',
};
export default function SessionsChart({ sessions }) {
  const [chartType, setChartType] = useState('status');
  const getSessionStatus = (session) => {
    const now = new Date();
    const expiresAt = parseISO(session.expiresAt);
    if (session.signedOutAt) {
      return 'signed-out';
    } else if (now > expiresAt) {
      return 'expired';
    }
    return 'active';
  };
  const getBrowserInfo = (userAgent) => {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };
  // Prepare data for daily sessions chart
  const getDailySessionsData = () => {
    // Get the last 7 days
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i)); // Start from 6 days ago to today
      return date;
    });
    // Initialize data for each day
    const dailyData = dates.map((date) => ({
      date: format(date, 'EEE'),
      fullDate: format(date, 'MMM dd'),
      sessions: 0,
      dateKey: format(date, 'yyyy-MM-dd'),
    }));
    // Count sessions per day
    for (const session of sessions) {
      const signedInDate = parseISO(session.signedInAt);
      const signedInKey = format(signedInDate, 'yyyy-MM-dd');
      const dayData = dailyData.find((d) => d.dateKey === signedInKey);
      if (dayData) {
        dayData.sessions += 1;
      }
    }
    return dailyData;
  };
  // Prepare data for status chart
  const getStatusData = () => {
    const statusCounts = {
      active: 0,
      expired: 0,
      'signed-out': 0,
    };
    for (const session of sessions) {
      const status = getSessionStatus(session);
      statusCounts[status]++;
    }
    return [
      { name: 'Active', value: statusCounts.active, color: STATUS_COLORS.active },
      { name: 'Expired', value: statusCounts.expired, color: STATUS_COLORS.expired },
      { name: 'Signed Out', value: statusCounts['signed-out'], color: STATUS_COLORS['signed-out'] },
    ].filter((item) => item.value > 0);
  };
  // Prepare data for browser chart
  const getBrowserData = () => {
    const browserCounts = {};
    for (const session of sessions) {
      const browser = getBrowserInfo(session.userAgent);
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    }
    return Object.entries(browserCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: BROWSER_COLORS[name] || BROWSER_COLORS.Other,
      }))
      .sort((a, b) => b.value - a.value);
  };
  const dailyData = getDailySessionsData();
  const statusData = getStatusData();
  const browserData = getBrowserData();
  // Custom tooltip component for daily chart
  const DailyTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return _jsxs('div', {
      className: 'rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm',
      children: [
        _jsx('p', { className: 'font-medium text-foreground text-sm', children: data.fullDate }),
        _jsxs('p', { className: 'text-muted-foreground text-xs', children: [data.sessions, ' sessions'] }),
      ],
    });
  };
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return _jsxs('div', {
      className: 'rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm',
      children: [
        _jsx('p', { className: 'font-medium text-foreground text-sm', children: label }),
        _jsxs('p', { className: 'text-muted-foreground text-xs', children: [payload[0].value, ' sessions'] }),
      ],
    });
  };
  // Custom pie tooltip
  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return _jsxs('div', {
      className: 'rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm',
      children: [
        _jsx('p', { className: 'font-medium text-foreground text-sm', children: payload[0].name }),
        _jsxs('p', { className: 'text-muted-foreground text-xs', children: [payload[0].value, ' sessions'] }),
      ],
    });
  };
  // Custom legend for pie charts
  const CustomLegend = ({ data }) =>
    _jsx('div', {
      className: 'mt-4 flex flex-wrap justify-center gap-4',
      children: data.map((entry) =>
        _jsxs(
          'div',
          {
            className: 'flex items-center gap-2',
            children: [
              _jsx('div', { className: 'size-3 rounded-full', style: { backgroundColor: entry.color } }),
              _jsx('span', { className: 'text-muted-foreground text-xs', children: entry.name }),
              _jsx('span', { className: 'font-medium font-mono text-xs', children: entry.value }),
            ],
          },
          entry.name,
        ),
      ),
    });
  return _jsx('div', {
    className: 'min-h-[450px]',
    children: _jsxs(Tabs, {
      value: chartType,
      onValueChange: (value) => setChartType(value),
      className: 'flex h-full flex-col',
      children: [
        _jsxs(TabsList, {
          className: 'mb-6 shrink-0 bg-background/50',
          children: [
            _jsxs(TabsTrigger, {
              value: 'daily',
              className: 'gap-2',
              children: [_jsx(Calendar, { className: 'size-4' }), 'Daily Activity'],
            }),
            _jsxs(TabsTrigger, {
              value: 'status',
              className: 'gap-2',
              children: [_jsx(Globe, { className: 'size-4' }), 'Status Distribution'],
            }),
            _jsxs(TabsTrigger, {
              value: 'browser',
              className: 'gap-2',
              children: [_jsx(SiGooglechrome, { className: 'size-4' }), 'Browsers'],
            }),
          ],
        }),
        _jsx(TabsContent, {
          value: 'daily',
          className: 'h-[350px]',
          children: _jsxs('div', {
            className: 'flex h-full flex-col',
            children: [
              _jsx(ResponsiveContainer, {
                width: '100%',
                height: 300,
                children: _jsxs(AreaChart, {
                  data: dailyData,
                  margin: { top: 20, right: 20, left: -10, bottom: 0 },
                  children: [
                    _jsx('defs', {
                      children: _jsxs('linearGradient', {
                        id: 'colorSessions',
                        x1: '0',
                        y1: '0',
                        x2: '0',
                        y2: '1',
                        children: [
                          _jsx('stop', { offset: '5%', stopColor: '#3b82f6', stopOpacity: 0.4 }),
                          _jsx('stop', { offset: '95%', stopColor: '#3b82f6', stopOpacity: 0.05 }),
                        ],
                      }),
                    }),
                    _jsx(XAxis, {
                      dataKey: 'fullDate',
                      axisLine: false,
                      tickLine: false,
                      tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
                    }),
                    _jsx(YAxis, {
                      axisLine: false,
                      tickLine: false,
                      tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
                      allowDecimals: false,
                      domain: [0, 'auto'],
                    }),
                    _jsx(Tooltip, { content: _jsx(DailyTooltip, {}) }),
                    _jsx(Area, {
                      type: 'monotone',
                      dataKey: 'sessions',
                      stroke: '#3b82f6',
                      strokeWidth: 2,
                      fillOpacity: 1,
                      fill: 'url(#colorSessions)',
                      animationDuration: 750,
                      dot: { fill: '#3b82f6', strokeWidth: 0, r: 4 },
                      activeDot: { fill: '#3b82f6', strokeWidth: 2, stroke: '#fff', r: 6 },
                    }),
                  ],
                }),
              }),
              _jsx('div', {
                className: 'mt-2 text-center text-muted-foreground text-xs',
                children: 'Sessions created in the last 7 days',
              }),
            ],
          }),
        }),
        _jsx(TabsContent, {
          value: 'status',
          className: 'h-[350px]',
          children: _jsxs('div', {
            className: 'flex h-full flex-col',
            children: [
              _jsx(ResponsiveContainer, {
                width: '100%',
                height: 280,
                children: _jsxs(PieChart, {
                  children: [
                    _jsx(Pie, {
                      data: statusData,
                      cx: '50%',
                      cy: '50%',
                      innerRadius: 60,
                      outerRadius: 100,
                      paddingAngle: 4,
                      dataKey: 'value',
                      nameKey: 'name',
                      strokeWidth: 0,
                      animationDuration: 750,
                      children: statusData.map((entry) => _jsx(Cell, { fill: entry.color }, `cell-${entry.name}`)),
                    }),
                    _jsx(Tooltip, { content: _jsx(CustomPieTooltip, {}) }),
                  ],
                }),
              }),
              _jsx(CustomLegend, { data: statusData }),
            ],
          }),
        }),
        _jsx(TabsContent, {
          value: 'browser',
          className: 'h-[350px]',
          children: _jsxs('div', {
            className: 'flex h-full flex-col',
            children: [
              _jsx(ResponsiveContainer, {
                width: '100%',
                height: 280,
                children: _jsxs(BarChart, {
                  data: browserData,
                  layout: 'vertical',
                  margin: { top: 10, right: 30, left: 60, bottom: 0 },
                  children: [
                    _jsx(XAxis, {
                      type: 'number',
                      axisLine: false,
                      tickLine: false,
                      tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
                    }),
                    _jsx(YAxis, {
                      type: 'category',
                      dataKey: 'name',
                      axisLine: false,
                      tickLine: false,
                      tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
                      width: 70,
                    }),
                    _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }),
                    _jsx(Bar, {
                      dataKey: 'value',
                      radius: [0, 6, 6, 0],
                      maxBarSize: 32,
                      animationDuration: 750,
                      children: browserData.map((entry) => _jsx(Cell, { fill: entry.color }, `cell-${entry.name}`)),
                    }),
                  ],
                }),
              }),
              _jsx(CustomLegend, { data: browserData }),
            ],
          }),
        }),
      ],
    }),
  });
}
//# sourceMappingURL=sessions-chart.js.map
