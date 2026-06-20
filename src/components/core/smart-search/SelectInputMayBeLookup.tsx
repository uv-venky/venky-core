/* Copyright (c) 2023-present Venky Corp. */

import { type RefObject, useEffect, useMemo, useState } from 'react';
import type { Path } from '@/components/core/mutX/ImmutableTypes';
import { SelectInput } from './SelectInput';
import {
  isSelectLookupColumn,
  isSelectOptionsColumn,
  type SelectColumn,
  type SelectLookupColumn,
  type SelectOptionsColumn,
} from '@/components/core/smart-search/types';
import { getLookupsByType } from '@/lib/core/client/lookups';

interface Props {
  operator: string;
  onChange: (val?: string, done?: boolean) => void;
  value: string;
  doNotFocusOnMount?: boolean;
  className?: string;
  path: Path;
  ref: RefObject<HTMLInputElement | null>;
}

function SelectInputLookup<T extends object>(props: Props & { column: SelectLookupColumn<T> }) {
  const { column: columnProp, ...restProps } = props;
  const { lookupType } = columnProp;
  const [options, setOptions] = useState<any[]>([]);

  const column: SelectOptionsColumn<T, any> = useMemo(() => {
    const { lookupType: _, ...rest } = columnProp;
    return {
      ...rest,
      options,
      getOptionLabel: (option: any) => option.label ?? option.value,
      getOptionValue: (option: any) => option.value,
    };
  }, [columnProp, options]);

  useEffect(() => {
    getLookupsByType(lookupType).then(setOptions);
  }, [lookupType]);

  return <SelectInput column={column} {...restProps} />;
}

export function SelectInputMayBeLookup<T extends object>({
  column,
  ...rest
}: Props & { column: SelectColumn<T, any> }) {
  if (isSelectOptionsColumn(column)) {
    return <SelectInput column={column} {...rest} />;
  }
  if (isSelectLookupColumn(column)) {
    return <SelectInputLookup column={column} {...rest} />;
  }
  return <div className="text-red-500">Invalid select type</div>;
}
