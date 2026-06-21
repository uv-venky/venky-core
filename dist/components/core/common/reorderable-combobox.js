/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { Check, CheckCheck, ChevronsUpDown, GripVertical, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { useEffect } from 'react';
export function ReorderableComboboxNoPopover({
  options,
  placeholder = 'Select items...',
  emptyMessage = 'No items found.',
  onChange,
  values = [],
  onToggle,
  dataTestId,
}) {
  const [selectedValues, setSelectedValues] = React.useState(values);
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
  const handleSelect = (value) => {
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
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = selectedValues.indexOf(active.id);
      const newIndex = selectedValues.indexOf(over.id);
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
    const selected = selectedValues.map((value) => options.find((option) => option.value === value)).filter(Boolean);
    const unselected = options.filter((option) => !selectedValues.includes(option.value));
    return [...selected, ...unselected];
  }, [options, selectedValues]);
  return _jsxs(Command, {
    shouldFilter: false,
    className: 'flex flex-1 flex-col overflow-hidden',
    children: [
      _jsx(CommandInput, { placeholder: placeholder, value: inputValue, onValueChange: setInputValue }),
      _jsxs('div', {
        className: 'flex shrink-0 items-center justify-between border-b px-2 py-1.5',
        children: [
          _jsxs(Button, {
            variant: 'ghost',
            size: 'sm',
            className: 'flex h-8 items-center gap-1 text-xs',
            onClick: handleCheckAll,
            'data-testid': 'reorderable-combobox-check-all',
            children: [_jsx(CheckCheck, { className: 'h-3.5 w-3.5' }), 'Check all'],
          }),
          _jsxs(Button, {
            variant: 'ghost',
            size: 'sm',
            className: 'flex h-8 items-center gap-1 text-xs',
            onClick: handleUnselectAll,
            'data-testid': 'reorderable-combobox-uncheck-all',
            children: [_jsx(X, { className: 'h-3.5 w-3.5' }), 'Uncheck all'],
          }),
        ],
      }),
      _jsxs(CommandList, {
        className:
          'flex max-h-[calc(var(--radix-popper-available-height)-95px)] min-w-[var(--radix-popper-anchor-width)] flex-1 flex-col overflow-auto',
        children: [
          _jsx(CommandEmpty, { children: emptyMessage }),
          _jsx(DndContext, {
            sensors: sensors,
            collisionDetection: closestCenter,
            onDragEnd: handleDragEnd,
            children: _jsx(CommandGroup, {
              children: _jsx(SortableContext, {
                items: selectedValues,
                strategy: verticalListSortingStrategy,
                children: (inputValue ? filteredOptions : sortedOptions).map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return isSelected
                    ? _jsxs(
                        SortableCommandItem,
                        {
                          id: option.value,
                          value: option.value,
                          onSelect: () => handleSelect(option.value),
                          dataTestIdForOption: dataTestId,
                          children: [_jsx(Check, { className: 'mr-2 h-4 w-4' }), option.label],
                        },
                        option.value,
                      )
                    : _jsxs(
                        CommandItem,
                        {
                          value: option.value,
                          onSelect: () => handleSelect(option.value),
                          'data-testid': dataTestId ? `${dataTestId}-option-${option.value}` : undefined,
                          children: [_jsx(Check, { className: 'mr-2 h-4 w-4 opacity-0' }), option.label],
                        },
                        option.value,
                      );
                }),
              }),
            }),
          }),
        ],
      }),
    ],
  });
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
}) {
  const [open, setOpen] = React.useState(false);
  return _jsxs(Popover, {
    open: open,
    onOpenChange: setOpen,
    children: [
      _jsx(PopoverTrigger, {
        asChild: true,
        children: iconOnly
          ? _jsx(Button, {
              id: id,
              variant: variant,
              size: 'icon',
              'aria-expanded': open,
              className: cn(options.length !== values.length && 'bg-muted', className),
              'data-testid': dataTestId ? `${dataTestId}-trigger` : undefined,
              'data-tip':
                values.length > 0
                  ? getDisplayLabel
                    ? getDisplayLabel()
                    : `${values.length} item${values.length > 1 ? 's' : ''} selected`
                  : placeholder,
              children: iconOnly,
            })
          : _jsxs(Button, {
              id: id,
              variant: variant,
              role: 'combobox',
              'aria-expanded': open,
              className: cn('justify-between', className),
              'data-testid': dataTestId ? `${dataTestId}-trigger` : undefined,
              children: [
                _jsx('span', {
                  className: 'truncate',
                  children:
                    values.length > 0
                      ? getDisplayLabel
                        ? getDisplayLabel()
                        : `${values.length} item${values.length > 1 ? 's' : ''} selected`
                      : placeholder,
                }),
                _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' }),
              ],
            }),
      }),
      _jsx(PopoverContent, {
        className: 'p-0',
        align: 'start',
        'data-testid': dataTestId ? `${dataTestId}-content` : undefined,
        children: _jsx(ReorderableComboboxNoPopover, {
          options: options,
          placeholder: placeholder,
          emptyMessage: emptyMessage,
          onChange: onChange,
          values: values,
          onToggle: onToggle,
          dataTestId: dataTestId,
        }),
      }),
    ],
  });
}
function SortableCommandItem({ id, value, onSelect, children, dataTestIdForOption }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return _jsx('div', {
    ref: setNodeRef,
    style: style,
    ...attributes,
    children: _jsx(CommandItem, {
      value: value,
      onSelect: () => onSelect(),
      className: cn(isDragging && 'bg-accent'),
      'data-testid': dataTestIdForOption ? `${dataTestIdForOption}-option-${value}` : undefined,
      children: _jsxs('div', {
        className: 'flex w-full items-center justify-between',
        children: [
          _jsx('div', { className: 'flex items-center', children: children }),
          _jsx('div', {
            role: 'button',
            className: 'ml-2 cursor-grab touch-none',
            ...listeners,
            onClick: (e) => e.stopPropagation(),
            children: _jsx(GripVertical, { className: 'h-4 w-4 text-muted-foreground' }),
          }),
        ],
      }),
    }),
  });
}
//# sourceMappingURL=reorderable-combobox.js.map
