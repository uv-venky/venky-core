'use client';

import type * as React from 'react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { isValid, parse } from 'date-fns';
import { useEffect, useState, type RefObject } from 'react';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { maskDate } from '@/components/core/utils/demoMask';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('w-[240px] justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
        >
          <CalendarIcon />
          {value ? maskDate(format(value, 'PPP')) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus required />
      </PopoverContent>
    </Popover>
  );
}

function convertISOToDateTimeLocal(value: string | Date, showTime?: boolean) {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd');
}

export function DateInput({
  className,
  value,
  onChange,
  ref,
  style,
  dataTestId,
  disabled,
  placeholder,
  id,
  onFocus,
  onBlur,
  min,
  max,
  autoFocus,
  showTime = false,
  onKeyDown,
  onPaste,
}: {
  className?: string;
  value: string;
  onChange?: (value?: string, usingPicker?: boolean) => void;
  ref?: RefObject<HTMLInputElement | null>;
  style?: React.CSSProperties;
  dataTestId?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  min?: string | Date;
  max?: string | Date;
  autoFocus?: boolean;
  showTime?: boolean;
  onPaste?: (value: string, dataType: 'Text' | 'Number' | 'Date') => void;
}) {
  const [localValue, setLocalValue] = useState(() => (value ? convertISOToDateTimeLocal(value, showTime) : ''));
  const [keyDown, setKeyDown] = useState(false);

  useEffect(() => {
    setLocalValue(value ? convertISOToDateTimeLocal(value, showTime) : '');
  }, [value, showTime]);

  return (
    <Input
      autoFocus={autoFocus}
      onFocus={onFocus}
      onBlur={onBlur}
      id={id}
      placeholder={placeholder}
      data-testid={dataTestId}
      ref={ref}
      className={cn(className)}
      type={showTime ? 'datetime-local' : 'date'}
      style={style}
      onKeyDown={(e) => {
        setKeyDown(true);
        onKeyDown?.(e);
      }}
      onChange={
        onChange
          ? (e) => {
              const usingPicker = !keyDown;
              setKeyDown(false);
              const val = e.currentTarget.value;
              //console.log('val', val);
              if (val) {
                const date = parse(val, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd', new Date());
                //console.log('val', val, date);
                if (isValid(date)) {
                  const minDate = min ? (typeof min === 'string' ? parseISO(min) : min) : undefined;
                  const maxDate = max ? (typeof max === 'string' ? parseISO(max) : max) : undefined;
                  if ((minDate && isBefore(date, minDate)) || (maxDate && isAfter(date, maxDate))) {
                    setLocalValue(val);
                    return;
                  }
                  onChange(showTime ? date.toISOString() : val, usingPicker);
                }
              } else if (isEmpty(val)) {
                onChange(undefined, usingPicker);
              }
              setLocalValue(val);
            }
          : undefined
      }
      value={localValue}
      disabled={disabled}
      min={min ? convertISOToDateTimeLocal(min, showTime) : undefined}
      max={max ? convertISOToDateTimeLocal(max, showTime) : undefined}
      onPaste={
        onPaste
          ? (value) => {
              value.preventDefault();
              onPaste(value.clipboardData.getData('text/plain'), 'Date');
            }
          : undefined
      }
    />
  );
}

export function TimeInput({
  className,
  value,
  onChange,
  ref,
  style,
  dataTestId,
  disabled,
  placeholder,
  id,
  onFocus,
  onBlur,
  step,
}: {
  className?: string;
  value: string;
  onChange?: (value: string) => void;
  ref?: RefObject<HTMLInputElement | null>;
  style?: React.CSSProperties;
  dataTestId?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  step?: number;
}) {
  const [localValue, setLocalValue] = useState(() => value ?? '');

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  return (
    <Input
      onFocus={onFocus}
      onBlur={onBlur}
      id={id}
      placeholder={placeholder}
      data-testid={dataTestId}
      ref={ref}
      className={cn(className)}
      type="time"
      style={style}
      onChange={
        onChange
          ? (e) => {
              let val = e.currentTarget.value;
              if (val.length === 5) {
                val = `${val}:00`;
              }
              onChange(val);
              setLocalValue(val);
            }
          : undefined
      }
      defaultValue={localValue}
      disabled={disabled}
      step={step}
    />
  );
}
