/* Copyright (c) 2023-present Venky Corp. */

import { CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { memo, useEffect } from 'react';
import { Combobox } from '@/components/core/combobox';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import type { Path } from '@/components/core/mutX/ImmutableTypes';
import { COMBINER_OPTIONS } from '@/components/core/smart-search/SmartSearchTypes';
import { useSmartSearchColumns, useSmartSearchDispatcher } from '@/components/core/smart-search/context';
import { ALargeSmall, Calendar, Check, Hash, List, FileQuestion, Zap } from 'lucide-react';

type Props<T extends object> = {
  attributeCode: string;
  index: number;
  path: Path;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  stickyFilters?: (keyof T)[];
};

function ColumnList<T extends object>(props: Props<T>) {
  useWhyDidYouUpdate('ColumnList', props);
  const { attributeCode, index, path, open, onOpenChange, stickyFilters } = props;
  const columns = useSmartSearchColumns();
  const dispatch = useSmartSearchDispatcher<T>();

  useEffect(() => {
    if (!attributeCode) {
      onOpenChange?.(true);
    }
  }, [attributeCode, onOpenChange]);

  return (
    <Combobox
      open={open}
      onOpenChange={onOpenChange}
      options={columns.filter((c) => !stickyFilters?.includes(c.key as keyof T))}
      value={attributeCode}
      getLabel={(o) => o.label}
      getValue={(o) => o.key}
      groupHeading="Fields"
      placeholder="Select a field"
      searchPlaceholder="Search for a field..."
      required
      dataTestId="field-selector"
      onSelect={(key) => {
        const column = columns.find((c) => c.key === key);
        if (!column) {
          throw new Error(`Column not found: ${key}`);
        }
        dispatch({
          type: 'setColumn',
          path: path,
          index: index,
          column,
        });
        onOpenChange?.(false);
      }}
      getIcon={(o) => {
        let icon = <FileQuestion className="h-3 w-3" />;
        switch (o.type) {
          case 'Number':
            icon = <Hash className="h-3 w-3" />;
            break;
          case 'Date':
            icon = <Calendar className="h-3 w-3" />;
            break;
          case 'Boolean':
          case 'YN':
          case 'TF':
            icon = <Check className="h-3 w-3" />;
            break;
          case 'Select':
          case 'TextArray':
            icon = <List className="h-3 w-3" />;
            break;
          case 'Text':
            icon = <ALargeSmall className="h-3 w-3" />;
            break;
        }
        return icon;
      }}
      className="border-none"
      bottomGroup={
        <>
          <CommandSeparator />
          <CommandGroup heading="Nested filters">
            {COMBINER_OPTIONS.map((o) => (
              <CommandItem
                key={o.value}
                value={o.value}
                className="flex cursor-pointer items-center justify-between"
                data-testid={`combiner-${o.value}`}
                onSelect={() => {
                  dispatch({
                    type: 'newCombiner',
                    path: [...path, index],
                    combiner: o.value,
                  });
                }}
              >
                <Zap className="h-3 w-3" />
                <span className="whitespace-nowrap">{o.label}</span>
                <CommandShortcut className="justify-end justify-self-end whitespace-nowrap text-xs">
                  {o.hint}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      }
    />
  );
}

export default memo(ColumnList) as <T extends object>(props: Props<T>) => React.ReactNode;
