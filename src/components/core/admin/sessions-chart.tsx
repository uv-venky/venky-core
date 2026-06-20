/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserSessions } from '@/lib/common/ds/types/core/UserSessions';
import type { DBRow } from '@/lib/core/common/ds/types/filter';
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

interface SessionsChartProps {
  sessions: readonly DBRow<UserSessions>[];
}

const STATUS_COLORS = {
  active: '#10b981',
  expired: '#f59e0b',
  'signed-out': '#3b82f6',
};

const BROWSER_COLORS: Record<string, string> = {
  Chrome: '#4285F4',
  Firefox: '#FF7139',
  Safari: '#0fb5ee',
  Edge: '#0078D7',
  Other: '#6b7280',
};

export default function SessionsChart({ sessions }: SessionsChartProps) {
  const [chartType, setChartType] = useState<'daily' | 'status' | 'browser'>('status');

  const getSessionStatus = (session: DBRow<UserSessions>) => {
    const now = new Date();
    const expiresAt = parseISO(session.expiresAt);

    if (session.signedOutAt) {
      return 'signed-out';
    } else if (now > expiresAt) {
      return 'expired';
    }
    return 'active';
  };

  const getBrowserInfo = (userAgent: string) => {
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
      statusCounts[status as keyof typeof statusCounts]++;
    }

    return [
      { name: 'Active', value: statusCounts.active, color: STATUS_COLORS.active },
      { name: 'Expired', value: statusCounts.expired, color: STATUS_COLORS.expired },
      { name: 'Signed Out', value: statusCounts['signed-out'], color: STATUS_COLORS['signed-out'] },
    ].filter((item) => item.value > 0);
  };

  // Prepare data for browser chart
  const getBrowserData = () => {
    const browserCounts: Record<string, number> = {};

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
  const DailyTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: { fullDate: string; sessions: number } }[];
  }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;

    return (
      <div className="rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-foreground text-sm">{data.fullDate}</p>
        <p className="text-muted-foreground text-xs">{data.sessions} sessions</p>
      </div>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-foreground text-sm">{label}</p>
        <p className="text-muted-foreground text-xs">{payload[0].value} sessions</p>
      </div>
    );
  };

  // Custom pie tooltip
  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-foreground text-sm">{payload[0].name}</p>
        <p className="text-muted-foreground text-xs">{payload[0].value} sessions</p>
      </div>
    );
  };

  // Custom legend for pie charts
  const CustomLegend = ({ data }: { data: { name: string; value: number; color: string }[] }) => (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      {data.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="size-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground text-xs">{entry.name}</span>
          <span className="font-medium font-mono text-xs">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-[450px]">
      <Tabs
        value={chartType}
        onValueChange={(value) => setChartType(value as 'daily' | 'status' | 'browser')}
        className="flex h-full flex-col"
      >
        <TabsList className="mb-6 shrink-0 bg-background/50">
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="size-4" />
            Daily Activity
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <Globe className="size-4" />
            Status Distribution
          </TabsTrigger>
          <TabsTrigger value="browser" className="gap-2">
            <SiGooglechrome className="size-4" />
            Browsers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="h-[350px]">
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fullDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<DailyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                  animationDuration={750}
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: '#3b82f6', strokeWidth: 2, stroke: '#fff', r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center text-muted-foreground text-xs">Sessions created in the last 7 days</div>
          </div>
        </TabsContent>

        <TabsContent value="status" className="h-[350px]">
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                  animationDuration={750}
                >
                  {statusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={statusData} />
          </div>
        </TabsContent>

        <TabsContent value="browser" className="h-[350px]">
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={browserData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={32} animationDuration={750}>
                  {browserData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <CustomLegend data={browserData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
