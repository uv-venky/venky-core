/* Copyright (c) 2023-present Venky Corp. */

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RefObject } from 'react';
import type { Path } from '@/components/core/mutX/ImmutableTypes';
import type { Column } from '@/components/core/smart-search/types';

interface Props<T extends object> {
  column: Column<T>;
  ref: RefObject<HTMLButtonElement | null>;
  operator: string;
  value: string;
  className?: string;
  path: Path;
  options: { label: string; value: string }[];
  onChange: (val: unknown, done?: boolean) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EntryEditorOptionsValueInput<T extends object>(props: Props<T>) {
  const { options, ref, open, onOpenChange } = props;

  return (
    <Select
      value={props.value}
      open={open}
      onOpenChange={onOpenChange}
      onValueChange={(val) => {
        props.onChange(val, true);
      }}
    >
      <SelectTrigger className="cursor-pointer truncate border-none focus:outline-1 focus:ring-4" ref={ref}>
        <SelectValue placeholder="Choose an option" data-testid="select-value" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
              data-testid={`select-item-${option.value}`}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
