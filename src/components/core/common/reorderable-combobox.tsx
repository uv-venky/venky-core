/* Copyright (c) 2024-present Venky Corp. */

'use client';

import * as React from 'react';
import { Check, CheckCheck, ChevronsUpDown, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@/lib/utils';
import { Button, type buttonVariants } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect } from 'react';
import type { VariantProps } from 'class-variance-authority';

type OptionType = {
  value: string;
  label: string;
};

interface ReorderableComboboxProps {
  options: OptionType[];
  placeholder?: string;
  emptyMessage?: string;
  onChange?: (values: string[]) => void;
  values?: string[];
  onToggle?: (value: string, isSelected: boolean) => void;
  getDisplayLabel?: () => React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  className?: string;
  id?: string;
  dataTestId?: string;
  iconOnly?: React.ReactNode;
}

export function ReorderableComboboxNoPopover({
  options,
  placeholder = 'Select items...',
  emptyMessage = 'No items found.',
  onChange,
  values = [],
  onToggle,
  dataTestId,
}: Omit<ReorderableComboboxProps, 'variant' | 'getDisplayLabel'>) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(values);
  const [inputValue, setInputValue] = React.useState('');

  useEffect(() => {
    setSelectedValues(values);
  }, [values]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSelect = (value: string) => {
    const isSelected = selectedValues.includes(value);
    onToggle?.(value, !isSelected);
    const newValues = isSelected ? selectedValues.filter((item) => item !== value) : [...selectedValues, value];
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const handleCheckAll = () => {
    const newValues = options.map((option) => option.value);
    for (const value of newValues) {
      if (!selectedValues.includes(value)) {
        onToggle?.(value, true);
      }
    }
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const handleUnselectAll = () => {
    for (const value of selectedValues) {
      onToggle?.(value, false);
    }
    setSelectedValues([]);
    onChange?.([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedValues.indexOf(active.id as string);
      const newIndex = selectedValues.indexOf(over.id as string);
      const newValues = arrayMove(selectedValues, oldIndex, newIndex);
      setSelectedValues(newValues);
      onChange?.(newValues);
    }
  };

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;

    return options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [options, inputValue]);

  // Sort options to show selected items first and in their sorted order
  const sortedOptions = React.useMemo(() => {
    const selected = selectedValues
      .map((value) => options.find((option) => option.value === value))
      .filter(Boolean) as OptionType[];

    const unselected = options.filter((option) => !selectedValues.includes(option.value));

    return [...selected, ...unselected];
  }, [options, selectedValues]);

  return (
    <Command shouldFilter={false} className="flex flex-1 flex-col overflow-hidden">
      <CommandInput placeholder={placeholder} value={inputValue} onValueChange={setInputValue} />
      <div className="flex shrink-0 items-center justify-between border-b px-2 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="flex h-8 items-center gap-1 text-xs"
          onClick={handleCheckAll}
          data-testid="reorderable-combobox-check-all"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Check all
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex h-8 items-center gap-1 text-xs"
          onClick={handleUnselectAll}
          data-testid="reorderable-combobox-uncheck-all"
        >
          <X className="h-3.5 w-3.5" />
          Uncheck all
        </Button>
      </div>
      <CommandList className="flex max-h-[calc(var(--radix-popper-available-height)-95px)] min-w-[var(--radix-popper-anchor-width)] flex-1 flex-col overflow-auto">
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <CommandGroup>
            <SortableContext items={selectedValues} strategy={verticalListSortingStrategy}>
              {(inputValue ? filteredOptions : sortedOptions).map((option) => {
                const isSelected = selectedValues.includes(option.value);

                return isSelected ? (
                  <SortableCommandItem
                    key={option.value}
                    id={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    dataTestIdForOption={dataTestId}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {option.label}
                  </SortableCommandItem>
                ) : (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    data-testid={dataTestId ? `${dataTestId}-option-${option.value}` : undefined}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    {option.label}
                  </CommandItem>
                );
              })}
            </SortableContext>
          </CommandGroup>
        </DndContext>
      </CommandList>
    </Command>
  );
}

export function ReorderableCombobox({
  options,
  placeholder = 'Select items...',
  emptyMessage = 'No items found.',
  onChange,
  values = [],
  onToggle,
  getDisplayLabel,
  variant = 'outline',
  className,
  id,
  dataTestId,
  iconOnly,
}: ReorderableComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {iconOnly ? (
          <Button
            id={id}
            variant={variant}
            size="icon"
            aria-expanded={open}
            className={cn(options.length !== values.length && 'bg-muted', className)}
            data-testid={dataTestId ? `${dataTestId}-trigger` : undefined}
            data-tip={
              values.length > 0
                ? getDisplayLabel
                  ? getDisplayLabel()
                  : `${values.length} item${values.length > 1 ? 's' : ''} selected`
                : placeholder
            }
          >
            {iconOnly}
          </Button>
        ) : (
          <Button
            id={id}
            variant={variant}
            role="combobox"
            aria-expanded={open}
            className={cn('justify-between', className)}
            data-testid={dataTestId ? `${dataTestId}-trigger` : undefined}
          >
            <span className="truncate">
              {values.length > 0
                ? getDisplayLabel
                  ? getDisplayLabel()
                  : `${values.length} item${values.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" data-testid={dataTestId ? `${dataTestId}-content` : undefined}>
        <ReorderableComboboxNoPopover
          options={options}
          placeholder={placeholder}
          emptyMessage={emptyMessage}
          onChange={onChange}
          values={values}
          onToggle={onToggle}
          dataTestId={dataTestId}
        />
      </PopoverContent>
    </Popover>
  );
}

interface SortableCommandItemProps {
  id: string;
  value: string;
  onSelect: () => void;
  children: React.ReactNode;
  dataTestIdForOption?: string;
}

function SortableCommandItem({ id, value, onSelect, children, dataTestIdForOption }: SortableCommandItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CommandItem
        value={value}
        onSelect={() => onSelect()}
        className={cn(isDragging && 'bg-accent')}
        data-testid={dataTestIdForOption ? `${dataTestIdForOption}-option-${value}` : undefined}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">{children}</div>
          <div
            role="button"
            className="ml-2 cursor-grab touch-none"
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CommandItem>
    </div>
  );
}
