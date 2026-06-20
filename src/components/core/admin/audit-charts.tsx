/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, PieChartIcon } from 'lucide-react';
import type { AuditStats } from '@/app/(secure)/admin/monitoring/audit/actions';

type ChangeType = 'added' | 'removed' | 'modified' | 'activated' | 'deactivated';

interface AuditChartsProps {
  stats: AuditStats;
}

const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  added: '#10b981',
  removed: '#ef4444',
  modified: '#3b82f6',
  activated: '#22c55e',
  deactivated: '#f59e0b',
};

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  added: 'Added',
  removed: 'Removed',
  modified: 'Modified',
  activated: 'Activated',
  deactivated: 'Deactivated',
};

export default function AuditCharts({ stats }: AuditChartsProps) {
  const [chartType, setChartType] = useState<'changeType' | 'breakdown'>('changeType');

  // Prepare data for change type chart
  const getChangeTypeData = () => {
    return (Object.entries(stats.changesByType) as [ChangeType, number][])
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: CHANGE_TYPE_LABELS[name],
        value,
        color: CHANGE_TYPE_COLORS[name],
      }));
  };

  // Prepare data for breakdown chart (percentage-based)
  const getBreakdownData = () => {
    const total = stats.total || 1; // Avoid division by zero
    return (Object.entries(stats.changesByType) as [ChangeType, number][])
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: CHANGE_TYPE_LABELS[name],
        value,
        percentage: Math.round((value / total) * 100),
        color: CHANGE_TYPE_COLORS[name],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const changeTypeData = getChangeTypeData();
  const breakdownData = getBreakdownData();

  // Custom pie tooltip
  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;

    const percentage = stats.total > 0 ? Math.round((payload[0].value / stats.total) * 100) : 0;

    return (
      <div className="rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-foreground text-sm">{payload[0].name}</p>
        <p className="text-muted-foreground text-xs">
          {payload[0].value} changes ({percentage}%)
        </p>
      </div>
    );
  };

  // Custom tooltip for bar charts
  const BarTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number; payload: { percentage: number } }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border border-border/50 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-foreground text-sm">{label}</p>
        <p className="text-muted-foreground text-xs">
          {payload[0].value} changes ({payload[0].payload.percentage}%)
        </p>
      </div>
    );
  };

  // Custom legend
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

  if (stats.total === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <p>No audit data available to display charts</p>
      </div>
    );
  }

  return (
    <div className="min-h-[400px]">
      <Tabs
        value={chartType}
        onValueChange={(value) => setChartType(value as typeof chartType)}
        className="flex h-full flex-col"
      >
        <TabsList className="mb-6 shrink-0 bg-background/50">
          <TabsTrigger value="changeType" className="gap-2">
            <PieChartIcon className="size-4" />
            Change Types
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-2">
            <Calendar className="size-4" />
            Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="changeType" className="h-[350px]">
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={changeTypeData}
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
                  {changeTypeData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={changeTypeData} />
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="h-[350px]">
          <div className="flex h-full flex-col">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={breakdownData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
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
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  width={75}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28} animationDuration={750}>
                  {breakdownData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <CustomLegend data={breakdownData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
