'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command';
import clientLogger from '@/lib/core/client/client-logger';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getErrorMessage } from '@/lib/core/common/error';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

export type MultiComboboxProps<T> = {
  bottomGroup?: React.ReactNode;
  className?: string;
  dataTestId?: string;
  disabled?: boolean;
  emptyText?: string;
  getLabel: (option: Readonly<T>) => string;
  getOptions?: (filter: string) => Promise<readonly T[]>;
  getValue: (option: Readonly<T>) => string;
  groupHeading?: string;
  id?: string;
  minSearchLength?: number;
  onOpenChange?: (open: boolean) => void;
  onSelect: (value: string[], option: readonly T[]) => void;
  open?: boolean;
  options?: readonly T[];
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
  value: string[];
  isLoading?: boolean;
  getOptionsForValue?: (value: string[]) => Promise<readonly T[]>;
  helpText?: string;
  disableSortByLabel?: boolean;
  trigger?: React.ReactNode;
  topContent?: React.ReactNode;
};

export function MultiCombobox<T>(props: MultiComboboxProps<T>) {
  const {
    bottomGroup,
    className,
    dataTestId,
    disabled,
    emptyText = 'No options found',
    getLabel,
    getOptions,
    getValue,
    groupHeading,
    id,
    minSearchLength = 3,
    onOpenChange,
    onSelect,
    open,
    placeholder = 'Select options...',
    required,
    searchPlaceholder = 'Search for an option...',
    value,
    isLoading: isLoadingProp,
    getOptionsForValue,
    disableSortByLabel = false,
    trigger,
    topContent,
  } = props;

  const [filter, setFilter] = useState('');
  const [options, setOptions] = useState<readonly T[]>(props.options ?? []);
  const [selectedOptions, setSelectedOptions] = useState<readonly T[]>([]);
  const [isLoading, setIsLoading] = useState(isLoadingProp ?? false);
  const deferredFilter = useDeferredValue(filter);

  useEffect(() => {
    if (isLoadingProp != null) {
      setIsLoading(isLoadingProp);
    }
  }, [isLoadingProp]);

  useEffect(() => {
    if (!getOptions || deferredFilter.length < minSearchLength) return;
    setIsLoading(true);
    getOptions(deferredFilter)
      .then(setOptions)
      .catch((error) => {
        clientLogger.error({ message: 'fetch options error', error });
        toast.error(`Error fetching options: ${getErrorMessage(error)}`);
      })
      .finally(() => setIsLoading(false));
  }, [deferredFilter, getOptions, minSearchLength]);

  useEffect(() => {
    const nextOptions = disableSortByLabel
      ? (props.options ?? [])
      : [...(props.options ?? [])].sort((a, b) => getLabel(a).localeCompare(getLabel(b)));

    if (!nextOptions || nextOptions.length === 0) {
      setOptions(nextOptions);
      return;
    }

    const allIndex = nextOptions.findIndex((option) => getValue(option) === '(All)');
    if (allIndex === -1) {
      setOptions(nextOptions);
      return;
    }

    const allOption = nextOptions[allIndex];
    const remaining = [...nextOptions.slice(0, allIndex), ...nextOptions.slice(allIndex + 1)];
    setOptions([allOption, ...remaining]);
  }, [getLabel, props.options, disableSortByLabel, getValue]);

  useEffect(() => {
    if (!value.length) {
      setSelectedOptions([]);
      return;
    }
    const selectedOptions = value.map((v) => options.find((o) => getValue(o) === v) ?? (null as T)).filter(Boolean);
    if (selectedOptions) {
      setSelectedOptions(selectedOptions);
    } else if (options.length === 0) {
      getOptionsForValue?.(value).then((options) => {
        if (options) {
          setSelectedOptions(options);
        }
      });
    }
  }, [options, value, getValue, getOptionsForValue]);

  const valueSet = useMemo(() => new Set(value), [value]);

  const valueOptionMap = useMemo(() => {
    const map = new Map<string, T>();
    options.forEach((option) => {
      map.set(getValue(option), option);
    });
    return map;
  }, [options, getValue]);

  const filteredOptions = useMemo(() => {
    if (!filter) return options;
    const matches = options.filter((o) => getLabel(o).toLowerCase().includes(filter.toLowerCase()));

    const allOption = matches.find((option) => getValue(option) === '(All)');
    if (!allOption) {
      return matches;
    }

    return [allOption, ...matches.filter((option) => getValue(option) !== '(All)')];
  }, [filter, options, getLabel, getValue]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', className)}
            data-testid={dataTestId}
            disabled={disabled}
          >
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-left',
                (value.length === 0 || selectedOptions.length === 0) && 'font-normal text-muted-foreground',
              )}
            >
              {value.length > 0 && selectedOptions.length > 0
                ? selectedOptions.map((o) => getLabel(o)).join(', ')
                : placeholder}
            </span>
            <div className="flex flex-row items-center gap-2">
              {value.length > 0 && !(required && value.length === 1) && (
                <div
                  role="button"
                  className="cursor-pointer p-2 opacity-50"
                  data-testid={dataTestId ? `${dataTestId}-clear` : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect([], []);
                  }}
                >
                  <X className="size-3.5" />
                </div>
              )}
              <ChevronsUpDown className="opacity-50" />
            </div>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[max(var(--radix-popper-anchor-width),14rem)] max-w-[min(24rem,calc(100vw-2rem))] overflow-hidden p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} className="w-full min-w-0">
          <div className="sticky top-0 z-10 bg-popover">
            <CommandInput value={filter} placeholder={searchPlaceholder} className="h-9" onValueChange={setFilter} />
            {topContent ? <div className="border-b bg-popover">{topContent}</div> : null}
          </div>
          <CommandList className="max-h-[calc(var(--radix-popper-available-height)-56px)] overflow-y-auto">
            {isLoading && (
              <CommandLoading>
                <div className="flex flex-row items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> loading...
                </div>
              </CommandLoading>
            )}
            {!isLoading && <CommandEmpty>{emptyText}</CommandEmpty>}
            <CommandGroup heading={groupHeading} onClick={(e) => e.stopPropagation()}>
              {filteredOptions.length === 0 ? (
                <CommandItem disabled>{emptyText}</CommandItem>
              ) : (
                filteredOptions.map((option) => (
                  <CommandItem
                    key={getValue(option)}
                    value={getValue(option)}
                    data-testid={`combobox-item-${getValue(option)}`}
                    onSelect={() => {
                      const val = getValue(option);
                      const checked = !valueSet.has(val);
                      if (!checked && required && value.length === 1) {
                        return;
                      }
                      const newValues = !checked ? value.filter((v) => v !== val) : [...value, val];
                      onSelect(
                        newValues,
                        newValues.map((v) => valueOptionMap.get(v) ?? ({} as T)),
                      );
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex w-full items-center gap-2">
                      <Checkbox
                        checked={valueSet.has(getValue(option))}
                        tabIndex={-1}
                        aria-hidden
                        className="pointer-events-none"
                      />
                      <span className="flex-1 truncate text-left">{getLabel(option)}</span>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            {bottomGroup}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type MultiComboboxFieldProps<T> = Omit<
  MultiComboboxProps<T>,
  'getOptions' | 'onOpenChange' | 'open' | 'bottomGroup' | 'minSearchLength'
>;

export function MultiComboboxField<T>({
  className,
  dataTestId,
  disabled,
  emptyText,
  getLabel,
  getValue,
  groupHeading,
  id,
  onSelect,
  options,
  placeholder,
  required,
  searchPlaceholder,
  value,
  isLoading,
  disableSortByLabel,
}: MultiComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <MultiCombobox
      className={className}
      dataTestId={dataTestId}
      disabled={disabled}
      emptyText={emptyText}
      getLabel={getLabel}
      getValue={getValue}
      groupHeading={groupHeading}
      id={id}
      onOpenChange={setOpen}
      onSelect={onSelect}
      open={open}
      options={options}
      placeholder={placeholder}
      required={required}
      searchPlaceholder={searchPlaceholder}
      value={value}
      isLoading={isLoading}
      disableSortByLabel={disableSortByLabel}
    />
  );
}

export type AsyncMultiComboboxFieldProps<T> = Omit<
  MultiComboboxProps<T>,
  'onOpenChange' | 'open' | 'bottomGroup' | 'options' | 'isLoading'
>;

export function AsyncMultiComboboxField<T>({
  className,
  dataTestId,
  disabled,
  emptyText,
  getLabel,
  getOptions,
  getValue,
  groupHeading,
  id,
  minSearchLength = 3,
  onSelect,
  placeholder,
  required,
  searchPlaceholder,
  value,
  getOptionsForValue,
  disableSortByLabel = false,
}: AsyncMultiComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <MultiCombobox
      className={className}
      dataTestId={dataTestId}
      disabled={disabled}
      emptyText={emptyText}
      getLabel={getLabel}
      getOptions={getOptions}
      getValue={getValue}
      groupHeading={groupHeading}
      id={id}
      minSearchLength={minSearchLength}
      onOpenChange={setOpen}
      onSelect={onSelect}
      open={open}
      placeholder={placeholder}
      required={required}
      searchPlaceholder={searchPlaceholder}
      value={value}
      getOptionsForValue={getOptionsForValue}
      disableSortByLabel={disableSortByLabel}
    />
  );
}
