/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';

export interface ChipsInputProps {
  /** Field label rendered above the input. Pass empty string to omit. */
  label?: string;
  /** Current values. Order is preserved. */
  values: string[];
  /** Placeholder shown only while the value list is empty. */
  placeholder?: string;
  /** Callback fired with the new array on add/remove. */
  onChange: (next: string[]) => void;
  /** Disable input + remove buttons. */
  disabled?: boolean;
  /** Optional className applied to the outer wrapper. */
  className?: string;
  /** When false (default), duplicate values are silently dropped. */
  allowDuplicates?: boolean;
  /** Minimum width of the inline input in rem. Default 8. */
  inputMinWidthRem?: number;
}

/**
 * Free-form string[] editor: a list of removable chips plus an inline input.
 * Add via Enter or Tab, remove via the X button or Backspace on empty input,
 * commit pending text on blur. Use this in place of a comma-split string when
 * values themselves can contain commas (e.g. "Amazon (FC, excl. FLSD)").
 *
 * The outer wrapper mirrors the shadcn `Input` field shell (border, focus
 * ring) and the remove-chip button uses shadcn `Button` (ghost / icon-xs),
 * so this component looks and behaves like the rest of the form primitives.
 */
export function ChipsInput({
  label,
  values,
  placeholder,
  onChange,
  disabled = false,
  className,
  allowDuplicates = false,
  inputMinWidthRem = 8,
}: ChipsInputProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!allowDuplicates && values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  };

  const remove = (target: string) => {
    if (disabled) return;
    onChange(values.filter((v) => v !== target));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (!draft.trim()) return;
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      e.preventDefault();
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {label ? <Label>{label}</Label> : null}
      <div
        data-slot="input"
        aria-disabled={disabled || undefined}
        className={cn(
          // Mirror @/components/ui/input.tsx: same border, radius, shadow, transitions.
          'flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm',
          'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        )}
      >
        {values.map((value) => (
          <Badge key={value} variant="secondary" className="gap-1 pr-0.5">
            <span className="whitespace-pre">{value}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove ${value}`}
              disabled={disabled}
              onClick={() => remove(value)}
              className="hover:bg-muted-foreground/20"
            >
              <X />
            </Button>
          </Badge>
        ))}
        <input
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : undefined}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          style={{ minWidth: `${inputMinWidthRem}rem` }}
        />
      </div>
    </div>
  );
}
