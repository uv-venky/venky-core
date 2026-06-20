/* Copyright (c) 2023-present Venky Corp. */

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { RefObject } from 'react';
import assert from '@/components/core/utils/assert';
import type { Column } from '@/components/core/smart-search/types';
import { DateInput } from '@/components/core/date-field';

interface Props<T extends object> {
  column: Column<T>;
  ref: RefObject<HTMLInputElement | null>;
  onValueChange: (val: string[], done?: boolean) => void;
  value: string[];
  className?: string;
}

export function DateRangeInput<T extends object>(props: Props<T>) {
  const value = () => {
    assert(Array.isArray(props.value) && props.value.length <= 2, "DateRangeInput's value must be an array");
    return props.value;
  };

  return (
    <div className="flex flex-nowrap items-center gap-1 divide-x bg-paper pl-1">
      <DateInput
        dataTestId="date-input-from"
        ref={props.ref}
        className={cn(
          'h-full w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0',
          props.className,
        )}
        onChange={(from) => {
          const [, to] = value();
          props.onValueChange([from ?? '', to]);
        }}
        value={value()[0] ? format(parseISO(value()[0] as string), `yyyy-MM-dd`) : ''}
      />
      <Separator orientation="vertical" className="min-h-6" />
      <DateInput
        dataTestId="date-input-to"
        className={cn(
          'h-full w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0',
          props.className,
        )}
        onChange={(to) => {
          // Don't pass usingPicker as done - the native date picker fires onChange
          // when navigating months or selecting dates, but the user isn't done yet.
          const [from] = value();
          props.onValueChange([from, to ?? '']);
        }}
        value={value()[1] ? format(parseISO(value()[1] as string), `yyyy-MM-dd`) : ''}
      />
    </div>
  );
}
