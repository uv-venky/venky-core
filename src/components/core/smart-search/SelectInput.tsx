/* Copyright (c) 2023-present Venky Corp. */

import { type RefObject, useState } from 'react';
import { Combobox } from '@/components/core/combobox';
import type { Path } from '@/components/core/mutX/ImmutableTypes';
import type { SelectOptionsColumn } from '@/components/core/smart-search/types';

interface Props<T extends object> {
  column: SelectOptionsColumn<T, any>;
  operator: string;
  onChange: (val?: string, done?: boolean) => void;
  value: string;
  doNotFocusOnMount?: boolean;
  className?: string;
  path: Path;
  ref: RefObject<HTMLInputElement | null>;
}

export function SelectInput<T extends object>(props: Props<T>) {
  const [open, setOpen] = useState(false);

  if (!props.ref.current) {
    props.ref.current = {
      focus: () => {
        setOpen(true);
      },
    } as HTMLInputElement;
  }

  return (
    <Combobox
      // ref={props.ref}
      options={props.column.options}
      getValue={props.column.getOptionValue}
      getLabel={props.column.getOptionLabel}
      onSelect={(item) => props.onChange(item, item != null)}
      value={props.value}
      className="border-none"
      open={open}
      onOpenChange={setOpen}
      dataTestId="select-input"
      disableSortByLabel={props.column.disableSortByLabel}
    />
  );
}
