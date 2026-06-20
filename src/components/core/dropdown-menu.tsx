'use client';

import type * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu as DropdownMenuComponent,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

export function DropdownMenuField<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = 'Select...',
  children,
  startIcon,
  open,
  onOpenChange,
  onCloseAutoFocus,
  dataTestId,
  iconTrigger = false,
}: {
  options: ReadonlyArray<T>;
  value: string;
  getLabel: (option: T) => React.ReactNode;
  getValue: (option: T) => string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: ((event: Event) => void) | undefined;
  dataTestId?: string;
  iconTrigger?: boolean;
}) {
  const selected = useMemo(() => options.find((option) => getValue(option) === value), [options, value, getValue]);

  return (
    <DropdownMenuComponent open={open} onOpenChange={onOpenChange} modal={false}>
      {startIcon}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          data-testid={dataTestId}
          size={iconTrigger ? 'icon' : 'default'}
          data-tip={iconTrigger && selected && typeof getLabel(selected) === 'string' ? getLabel(selected) : undefined}
        >
          <div className="flex flex-row items-center justify-between gap-2">
            {children ?? (selected ? getLabel(selected) : placeholder)}
            {!iconTrigger && <ChevronDown className="size-4" />}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-[var(--radix-popper-available-height)] overflow-auto"
        onCloseAutoFocus={onCloseAutoFocus}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              data-testid={`dropdown-menu-item-${getValue(option)}`}
              key={getValue(option)}
              value={getValue(option)}
              className="flex cursor-pointer items-center justify-between whitespace-nowrap"
            >
              {getLabel(option)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuComponent>
  );
}
