'use client';

import { useMemo, useState } from 'react';
import { MultiCombobox } from '@/components/core/multi-combobox';
import { cn } from '@/lib/utils';
import type { PivotSearchAsyncSource } from '@/components/core/pivot/PivotSearchAsyncSource';
import { FunnelIcon } from 'lucide-react';

export type PivotSearchableMultiSelectorProps<Item, ColumnKey extends string> = {
  searchSource: PivotSearchAsyncSource<Item, ColumnKey>;
  value: string[];
  onChange: (value: ReadonlyArray<string>) => void;
  buttonSize?: 'compact' | 'default';
  className?: string;
  visible?: boolean;
};

export default function PivotSearchableMultiSelector<Item, ColumnKey extends string>({
  searchSource,
  value,
  onChange,
  //buttonSize = 'compact',
  className,
  visible = true,
}: PivotSearchableMultiSelectorProps<Item, ColumnKey>) {
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    const unique = new Set<string>();
    searchSource.data.forEach((row) => {
      unique.add(searchSource.getTextValue(row, searchSource.key));
    });
    return Array.from(unique).sort();
  }, [searchSource]);

  if (!visible) {
    return null;
  }

  return (
    <MultiCombobox<string>
      open={open}
      onOpenChange={setOpen}
      value={value}
      onSelect={(vals) => onChange(vals)}
      options={options}
      getLabel={(v) => v}
      getValue={(v) => v}
      placeholder=""
      searchPlaceholder="Search..."
      minSearchLength={0}
      disableSortByLabel
      trigger={
        <FunnelIcon
          className={cn(
            'mr-4 size-3.5 cursor-pointer group-hover/resizable:visible',
            open || value.length > 0 ? 'visible' : 'invisible',
            value.length > 0 && 'text-blue-600',
            className,
          )}
        />
      }
    />
  );
}
