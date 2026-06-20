'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface MemoryChartProps {
  heapUsed: number;
  heapTotal: number;
  systemUsed: number;
  systemTotal: number;
  heapUnit: string;
  systemUnit: string;
}

export function MemoryChart({ heapUsed, heapTotal, systemUsed, systemTotal, heapUnit, systemUnit }: MemoryChartProps) {
  // Normalize units if they're different
  let normalizedHeapUsed = heapUsed;
  let normalizedHeapTotal = heapTotal;
  let normalizedSystemUsed = systemUsed;
  let normalizedSystemTotal = systemTotal;
  let unit = heapUnit;

  // Convert MB to GB if needed for comparison
  if (heapUnit === 'MB' && systemUnit === 'GB') {
    normalizedHeapUsed = heapUsed / 1024;
    normalizedHeapTotal = heapTotal / 1024;
    unit = 'GB';
  } else if (heapUnit === 'GB' && systemUnit === 'MB') {
    normalizedSystemUsed = systemUsed / 1024;
    normalizedSystemTotal = systemTotal / 1024;
    unit = 'GB';
  }

  const data = [
    {
      name: 'Heap Memory',
      used: normalizedHeapUsed,
      free: normalizedHeapTotal - normalizedHeapUsed,
      total: normalizedHeapTotal,
    },
    {
      name: 'System Memory',
      used: normalizedSystemUsed,
      free: normalizedSystemTotal - normalizedSystemUsed,
      total: normalizedSystemTotal,
    },
  ];

  return (
    <ChartContainer
      config={{
        used: {
          label: 'Used',
          color: 'hsl(var(--chart-1))',
        },
        free: {
          label: 'Free',
          color: 'hsl(var(--chart-2))',
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          stackOffset="expand"
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(value: number) => `${value.toFixed(1)} ${unit}`} />
          <YAxis type="category" dataKey="name" />
          <Tooltip
            content={<ChartTooltipContent formatter={(value: number) => `${Number(value).toFixed(2)} ${unit}`} />}
          />
          <Legend />
          <Bar dataKey="used" stackId="a" fill="var(--color-amber-400)" name={`Used (${unit})`} />
          <Bar dataKey="free" stackId="a" fill="var(--color-green-400)" name={`Free (${unit})`} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
