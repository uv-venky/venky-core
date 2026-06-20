/* Copyright (c) 2023-present Venky Corp. */

import { useMemo, useState, type Ref } from 'react';
import { Combobox } from '@/components/core/combobox';
import type { Path } from '@/components/core/mutX/ImmutableTypes';
import type { SelectOptionsColumn } from '@/components/core/smart-search/types';
import assert from '@/components/core/utils/assert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Props<T extends object> {
  column: SelectOptionsColumn<T, any>;
  ref: Ref<HTMLInputElement>;
  operator: string;
  onChange: (val: string[], done?: boolean) => void;
  value: string[];
  doNotFocusOnMount?: boolean;
  className?: string;
  path: Path;
}

function OptionItem<T extends object>({
  column,
  value,
  onRemove,
}: {
  column: SelectOptionsColumn<T, any>;
  value: string;
  onRemove: () => void;
}) {
  const option = column.options.find((option) => column.getOptionValue(option) === value);
  return (
    <div
      className="flex max-h-[24px] items-center rounded-full border bg-default pl-1"
      data-testid="multi-select-value"
    >
      {(option && column.getOptionLabel(option)) ?? value}
      <Button
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        variant="ghost"
        size="icon"
        data-testid="multi-select-remove-value"
      >
        <X />
      </Button>
    </div>
  );
}

export function MultiSelectInput<T extends object>(props: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const values = useMemo(() => {
    assert(Array.isArray(props.value), "MultiTextInput's value must be an array");
    if (props.value.length && !expanded) {
      return [props.value[0]];
    } else {
      return props.value;
    }
  }, [expanded, props.value]);

  return (
    <div className="flex flex-1 flex-wrap items-center gap-1 divide-x bg-paper pl-1">
      {values.map((val, index) => (
        <OptionItem
          // biome-ignore lint/suspicious/noArrayIndexKey: index is ok here
          key={index}
          column={props.column}
          value={val}
          onRemove={() => {
            const val = [...values];
            val.splice(index, 1);
            props.onChange(val);
          }}
        />
      ))}
      {props.value.length > 1 && !expanded && (
        <Button
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          data-tip="Show all"
          variant="ghost"
          size="icon"
          data-testid="multi-select-show-all"
        >
          +{props.value.length - 1}
        </Button>
      )}
      <Combobox
        dataTestId="multi-select-input"
        options={props.column.options.filter((option) => !props.value.includes(props.column.getOptionValue(option)))}
        getValue={props.column.getOptionValue}
        getLabel={props.column.getOptionLabel}
        onSelect={(item) => props.onChange(item ? [...props.value, item] : props.value, false)}
        className="border-none"
        disableSortByLabel={props.column.disableSortByLabel}
      />
    </div>
  );
}
