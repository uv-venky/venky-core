/* Copyright (c) 2023-present Venky Corp. */

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, parse, parseISO } from 'date-fns';
import type { Ref } from 'react';
import assert from '@/components/core/utils/assert';
import type { Column } from '@/components/core/smart-search/types';
import { isEmpty } from '@/lib/core/common/isEmpty';

interface Props<T extends object> {
  column: Column<T>;
  ref: Ref<HTMLInputElement>;
  onChange: (val: string[]) => void;
  value: string[];
  className?: string;
}

export function DateTimeRangeInput<T extends object>(props: Props<T>) {
  const value = () => {
    assert(Array.isArray(props.value) && props.value.length <= 2, "DateTimeRangeInput's value must be an array");
    return props.value;
  };
  return (
    <div className="flex flex-nowrap items-center gap-1 divide-x bg-paper pl-1">
      <Input
        ref={props.ref}
        className={cn(
          'w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0',
          props.className,
        )}
        type="datetime-local"
        style={{ height: '28px' }}
        onChange={(e) => {
          const [, to] = value();
          let from = e.currentTarget.value;
          if (!isEmpty(from)) {
            const date = parse(from, `yyyy-MM-dd'T'HH:mm`, new Date());
            from = date.toISOString();
          }
          props.onChange([from, to]);
        }}
        value={value()[0] ? format(parseISO(value()[0] as string), `yyyy-MM-dd'T'HH:mm`) : ''}
        data-testid="date-time-input-from"
      />
      <Separator orientation="vertical" className="min-h-6" />
      <Input
        className={cn(
          'w-full border-none focus-visible:border-none focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0',
          props.className,
        )}
        type="datetime-local"
        style={{ height: '28px' }}
        onChange={(e) => {
          const [from] = value();
          let to = e.currentTarget.value;
          if (!isEmpty(to)) {
            const date = parse(to, `yyyy-MM-dd'T'HH:mm`, new Date());
            to = date.toISOString();
          }
          props.onChange([from, to]);
        }}
        value={value()[1] ? format(parseISO(value()[1] as string), `yyyy-MM-dd'T'HH:mm`) : ''}
        data-testid="date-time-input-to"
      />
    </div>
  );
}
