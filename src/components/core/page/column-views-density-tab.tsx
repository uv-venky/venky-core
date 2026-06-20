/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { DENSITY_PROPS } from '@/components/core/pivot/PivotTypes';
import type { TableVariant } from '@/components/core/common/types';
import { PAGE_SIZE_OPTIONS } from '@/components/core/page/table-column-preferences';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const TABLE_VARIANTS: TableVariant[] = ['compact', 'default', 'roomy', 'spacious'];

export function ColumnViewsDensityTab({
  value,
  onChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  pageSizeDisabled = false,
}: {
  value: TableVariant;
  onChange: (value: TableVariant) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  pageSizeDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 px-1 py-2">
      <p className="text-muted-foreground text-sm">Adjust row height and how many rows load per page.</p>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Row height</h4>
        <RadioGroup value={value} onValueChange={(v) => onChange(v as TableVariant)} className="gap-3">
          {TABLE_VARIANTS.map((variant) => (
            <div className="flex items-center gap-2" key={variant}>
              <RadioGroupItem
                value={variant}
                id={`density-${variant}`}
                data-testid={`column-views-density-${variant}`}
              />
              <Label htmlFor={`density-${variant}`} className="cursor-pointer font-normal">
                {DENSITY_PROPS[variant].label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Rows per page</h4>
        <div className="flex items-center gap-3">
          <Select value={`${pageSize}`} disabled={pageSizeDisabled} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger
              className="h-8 w-[5.5rem]"
              data-testid="column-views-page-size-trigger"
              aria-label="Rows per page"
            >
              {pageSizeDisabled ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <SelectValue placeholder={pageSize} />
              )}
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={`${option}`} data-testid={`column-views-page-size-option-${option}`}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
