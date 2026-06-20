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
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useDebounce from '@/components/core/hooks/useDebounce';

export type ComboboxProps<T> = {
  bottomGroup?: React.ReactNode;
  className?: string;
  dataTestId?: string;
  disabled?: boolean;
  emptyText?: string;
  getLabel: (option: Readonly<T>) => string;
  renderOption?: (option: Readonly<T>) => React.ReactNode;
  getOptions?: (filter: string) => Promise<readonly T[]>;
  getValue: (option: Readonly<T>) => string;
  groupHeading?: string;
  id?: string;
  minSearchLength?: number;
  onOpenChange?: (open: boolean) => void;
  onSelect: (value?: string, option?: Readonly<T>) => void;
  open?: boolean;
  options?: readonly T[];
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
  value?: string | null;
  isLoading?: boolean;
  getOptionForValue?: (value: string) => Promise<Readonly<T> | undefined>;
  helpText?: string;
  disableSortByLabel?: boolean;
  getIcon?: (option: Readonly<T>) => React.ReactNode;
};

export function Combobox<T>(props: ComboboxProps<T>) {
  const {
    bottomGroup,
    className,
    dataTestId,
    disableSortByLabel = false,
    disabled,
    emptyText = 'No options found',
    getIcon,
    getLabel,
    getOptionForValue,
    getOptions,
    getValue,
    renderOption,
    groupHeading,
    id,
    isLoading: isLoadingProp,
    minSearchLength = 3,
    onOpenChange,
    onSelect,
    open,
    placeholder = 'Select an option...',
    required,
    searchPlaceholder = 'Search for an option...',
    value,
  } = props;

  const [filter, setFilter] = useState('');
  const [options, setOptions] = useState<readonly T[]>(props.options ?? []);
  const [selectedOption, setSelectedOption] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(isLoadingProp ?? false);
  const [deferredFilter, setDeferredFilter] = useState('');
  const [debouncedSetFilter] = useDebounce(setDeferredFilter);

  useEffect(() => {
    if (isLoadingProp != null) {
      setIsLoading(isLoadingProp);
    }
  }, [isLoadingProp]);

  useEffect(() => {
    debouncedSetFilter(600, filter);
  }, [filter, debouncedSetFilter]);

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
    if (disableSortByLabel) {
      setOptions(props.options ?? []);
    } else {
      setOptions([...(props.options ?? [])].sort((a, b) => getLabel(a).localeCompare(getLabel(b))));
    }
  }, [getLabel, props.options, disableSortByLabel]);

  useEffect(() => {
    if (!value) {
      setSelectedOption(undefined);
      return;
    }
    const selectedOption = options.find((o) => getValue(o) === value);
    if (selectedOption) {
      setSelectedOption(selectedOption);
    } else if (options.length === 0) {
      getOptionForValue?.(value).then((option) => {
        if (option) {
          setSelectedOption(option);
        }
      });
    }
  }, [options, value, getValue, getOptionForValue]);

  const filteredOptions = useMemo(() => {
    if (!filter) return options;
    return options.filter((o) => getLabel(o).toLowerCase().includes(filter.toLowerCase()));
  }, [filter, options, getLabel]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', className)}
          data-testid={dataTestId ? `${dataTestId}-trigger` : undefined}
          disabled={disabled}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 truncate whitespace-nowrap">
            {value && selectedOption && renderOption ? (
              <span className="min-w-0 flex-1 truncate">{renderOption(selectedOption)}</span>
            ) : value && selectedOption ? (
              <>
                {getIcon?.(selectedOption)}
                <span className="truncate">{getLabel(selectedOption)}</span>
              </>
            ) : (
              <span className={cn('truncate', !value && 'font-normal text-muted-foreground')}>
                {value ? value : placeholder}
              </span>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            {value && !required && (
              <div
                role="button"
                className="cursor-pointer p-2 opacity-50"
                data-testid={dataTestId ? `${dataTestId}-clear` : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(undefined, undefined);
                }}
              >
                <X className="size-3.5" />
              </div>
            )}
            <ChevronsUpDown className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        onWheel={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Command shouldFilter={false} className="min-w-[var(--radix-popper-anchor-width)]">
          <CommandInput
            value={filter}
            placeholder={searchPlaceholder}
            className="h-9"
            onValueChange={setFilter}
            data-testid={dataTestId ? `${dataTestId}-search` : undefined}
          />
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
                    data-testid={
                      dataTestId ? `${dataTestId}-item-${getValue(option)}` : `combobox-item-${getValue(option)}`
                    }
                    onSelect={() => {
                      onSelect(
                        value && getValue(option) === value ? (required ? value : undefined) : getValue(option),
                        value && getValue(option) === value ? (required ? option : undefined) : option,
                      );
                      onOpenChange?.(false);
                    }}
                    className="cursor-pointer"
                  >
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <>
                        {getIcon?.(option)}
                        {getLabel(option)}
                      </>
                    )}
                    <Check
                      className={cn('ml-auto', value && value === getValue(option) ? 'opacity-100' : 'opacity-0')}
                    />
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

export type ComboboxFieldProps<T> = Omit<
  ComboboxProps<T>,
  'getOptions' | 'onOpenChange' | 'open' | 'bottomGroup' | 'minSearchLength'
>;

export function ComboboxField<T>({
  className,
  dataTestId,
  disableSortByLabel,
  disabled,
  emptyText,
  getLabel,
  getValue,
  getIcon,
  renderOption,
  groupHeading,
  id,
  isLoading,
  onSelect,
  options,
  placeholder,
  required,
  searchPlaceholder,
  value,
}: ComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      className={className}
      dataTestId={dataTestId}
      disableSortByLabel={disableSortByLabel}
      disabled={disabled}
      emptyText={emptyText}
      getLabel={getLabel}
      getValue={getValue}
      getIcon={getIcon}
      renderOption={renderOption}
      groupHeading={groupHeading}
      id={id}
      isLoading={isLoading}
      onOpenChange={setOpen}
      onSelect={onSelect}
      open={open}
      options={options}
      placeholder={placeholder}
      required={required}
      searchPlaceholder={searchPlaceholder}
      value={value}
    />
  );
}

export type AsyncComboboxFieldProps<T extends object> = Omit<
  ComboboxProps<T>,
  'onOpenChange' | 'open' | 'bottomGroup' | 'options' | 'isLoading'
>;

export function AsyncComboboxField<T extends object>({
  className,
  dataTestId,
  disabled,
  emptyText,
  getIcon,
  getLabel,
  getOptions,
  getValue,
  renderOption,
  groupHeading,
  id,
  minSearchLength = 3,
  onSelect,
  placeholder,
  required,
  searchPlaceholder,
  value,
  getOptionForValue,
  disableSortByLabel,
}: AsyncComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      className={className}
      dataTestId={dataTestId}
      disabled={disabled}
      emptyText={emptyText}
      getIcon={getIcon}
      getLabel={getLabel}
      getOptions={getOptions}
      getValue={getValue}
      renderOption={renderOption}
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
      getOptionForValue={getOptionForValue}
      disableSortByLabel={disableSortByLabel}
    />
  );
}
