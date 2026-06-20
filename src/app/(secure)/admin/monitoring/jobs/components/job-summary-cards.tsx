/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Activity, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import type { JobDashboardSummary } from '../action';

interface JobSummaryCardsProps {
  summary: JobDashboardSummary;
}

const cards = [
  {
    key: 'total',
    label: 'Total Jobs',
    icon: Layers,
    gradient: 'from-indigo-500/10 to-violet-500/10',
    border: 'via-indigo-500/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    getValue: (s: JobDashboardSummary) => s.total,
  },
  {
    key: 'running',
    label: 'Currently Running',
    icon: Activity,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    border: 'via-blue-500/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    getValue: (s: JobDashboardSummary) => s.running,
    getBadge: (s: JobDashboardSummary) => (s.running > 0 ? 'active' : null),
  },
  {
    key: 'failed',
    label: 'Failed (24h)',
    icon: AlertTriangle,
    gradient: 'from-red-500/10 to-rose-500/10',
    border: 'via-red-500/50',
    iconColor: 'text-red-600 dark:text-red-400',
    getValue: (s: JobDashboardSummary) => s.failed24h,
  },
  {
    key: 'success',
    label: 'Success Rate (24h)',
    icon: CheckCircle2,
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'via-emerald-500/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    getValue: (s: JobDashboardSummary) => `${s.successRate24h}%`,
  },
] as const;

export function JobSummaryCards({ summary }: JobSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(summary);
        const badge = 'getBadge' in card ? card.getBadge(summary) : null;

        return (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${card.border} to-transparent`}
            />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                {badge && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-600 text-xs dark:bg-blue-500/10 dark:text-blue-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                    {badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="font-medium text-muted-foreground text-sm">{card.label}</p>
                <p className="font-bold text-2xl tracking-tight">{value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
