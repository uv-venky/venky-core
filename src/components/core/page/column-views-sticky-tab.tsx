/* Copyright (c) 2024-present Venky Corp. */

'use client';

import type { TableColumnPreferences } from '@/components/core/page/table-column-preferences';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const STICKY_LEFT_OPTIONS: Array<{ value: TableColumnPreferences['stickyLeftCount']; label: string }> = [
  { value: 0, label: 'None' },
  { value: 1, label: 'First column' },
  { value: 2, label: 'First two columns' },
  { value: 3, label: 'First three columns' },
];

const STICKY_RIGHT_OPTIONS: Array<{ value: TableColumnPreferences['stickyRightCount']; label: string }> = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Last column' },
  { value: 2, label: 'Last two columns' },
  { value: 3, label: 'Last three columns' },
];

export function ColumnViewsStickyTab({
  stickyLeftCount,
  stickyRightCount,
  onStickyLeftChange,
  onStickyRightChange,
}: {
  stickyLeftCount: TableColumnPreferences['stickyLeftCount'];
  stickyRightCount: TableColumnPreferences['stickyRightCount'];
  onStickyLeftChange: (count: TableColumnPreferences['stickyLeftCount']) => void;
  onStickyRightChange: (count: TableColumnPreferences['stickyRightCount']) => void;
}) {
  return (
    <div className="flex flex-col gap-6 px-1 py-2">
      <p className="text-muted-foreground text-sm">Select which columns stay frozen on your table.</p>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">First columns</h4>
        <RadioGroup
          value={String(stickyLeftCount)}
          onValueChange={(v) => onStickyLeftChange(Number(v) as TableColumnPreferences['stickyLeftCount'])}
          className="gap-3"
        >
          {STICKY_LEFT_OPTIONS.map((option) => (
            <div className="flex items-center gap-2" key={option.value}>
              <RadioGroupItem
                value={String(option.value)}
                id={`sticky-left-${option.value}`}
                data-testid={`column-views-sticky-left-${option.value}`}
              />
              <Label htmlFor={`sticky-left-${option.value}`} className="cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Last columns</h4>
        <RadioGroup
          value={String(stickyRightCount)}
          onValueChange={(v) => onStickyRightChange(Number(v) as TableColumnPreferences['stickyRightCount'])}
          className="gap-3"
        >
          {STICKY_RIGHT_OPTIONS.map((option) => (
            <div className="flex items-center gap-2" key={option.value}>
              <RadioGroupItem
                value={String(option.value)}
                id={`sticky-right-${option.value}`}
                data-testid={`column-views-sticky-right-${option.value}`}
              />
              <Label htmlFor={`sticky-right-${option.value}`} className="cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
