/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AsyncMultiComboboxField } from '@/components/core/multi-combobox';
import type { Store } from '@/lib/core/common/types/Store';
import { cn } from '@/lib/utils';

export type LOVComboboxProps<T extends object> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: Store<T>;
  onSelect: (values: string[], rows: readonly T[]) => void;
  title?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  getLabel: (row: Readonly<T>) => string;
  getValue: (row: Readonly<T>) => string;
  getOptions: (filter: string) => Promise<readonly T[]>;
  getOptionsForValue?: (values: string[]) => Promise<readonly T[]>;
  minSearchLength?: number;
  trigger?: React.ReactNode;
  className?: string;
  singleSelection?: boolean;
  value?: string[];
};

export default function LOVCombobox<T extends object>({
  open,
  onOpenChange,
  store: _store,
  onSelect,
  title = 'Select Values',
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  getLabel,
  getValue,
  getOptions,
  getOptionsForValue,
  minSearchLength = 2,
  trigger,
  className,
  singleSelection = false,
  value = [],
}: LOVComboboxProps<T>) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const selectedOptionsRef = useRef<readonly T[]>([]);
  const shouldResetOnCloseRef = useRef(false);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);
  // Reset selection when popover closes after a successful confirmation
  useEffect(() => {
    if (!open && shouldResetOnCloseRef.current) {
      // Reset selection after popover closes (only if we confirmed)
      setSelectedValues([]);
      selectedOptionsRef.current = [];
      shouldResetOnCloseRef.current = false;
    }
  }, [open]);

  const handleSelect = (values: string[], options: readonly T[]) => {
    setSelectedValues(values);
    selectedOptionsRef.current = options;
    // For single selection, auto-submit and close
    if (singleSelection && values.length > 0) {
      onSelect(values, options);
      shouldResetOnCloseRef.current = true;
      onOpenChange(false);
    }
    // For multi-select, don't call onSelect yet - wait for user to click "Select" button
  };

  const handleConfirm = async () => {
    if (selectedValues.length === 0) return;

    // Get the full row data for selected values
    let rows: readonly T[] = [];
    if (selectedOptionsRef.current.length > 0) {
      rows = selectedOptionsRef.current;
    } else if (getOptionsForValue) {
      // Fallback: fetch options if we don't have them in ref
      rows = await getOptionsForValue(selectedValues);
    }

    onSelect(selectedValues, rows);
    shouldResetOnCloseRef.current = true;
    onOpenChange(false);
    // Don't reset here - let the useEffect handle it when popover closes
  };

  const handleCancel = () => {
    shouldResetOnCloseRef.current = false; // Don't reset on cancel
    onOpenChange(false);
    // Keep selection for next time when cancelled
  };

  // If no trigger is provided, use a hidden button as trigger
  const triggerButton = trigger || (
    <Button variant="outline" className="sr-only" aria-hidden="true">
      {title}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={handleCancel} modal={true}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      {open && (
        <PopoverContent
          className={cn('w-[500px] p-0', className)}
          align="end"
          side="bottom"
          sideOffset={-1}
          onInteractOutside={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col p-4">
            <div className="mb-3 font-semibold text-sm">{title}</div>
            <AsyncMultiComboboxField<T>
              key={`lov-combobox-${open}`}
              value={selectedValues}
              onSelect={handleSelect}
              getOptions={getOptions}
              getLabel={getLabel}
              getValue={getValue}
              getOptionsForValue={getOptionsForValue}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              minSearchLength={minSearchLength}
              emptyText="No options found"
              className="w-full"
            />
            {!singleSelection && (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={selectedValues.length === 0}>
                  Select ({selectedValues.length})
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
