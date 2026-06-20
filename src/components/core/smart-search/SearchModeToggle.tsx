/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { ListFilter, Sparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type SearchInputMode = 'chips' | 'nl';

interface SearchModeToggleProps {
  mode: SearchInputMode;
  onModeChange: (mode: SearchInputMode) => void;
  disabled?: boolean;
}

/**
 * Toggles SmartSearch between the chip filter builder and natural-language mode.
 * Only mounted when deployment config and per-page opt-in both enable NL search (see SmartSearch).
 */
export function SearchModeToggle({ mode, onModeChange, disabled }: SearchModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      value={mode}
      disabled={disabled}
      onValueChange={(value) => {
        // Radix emits '' when the active item is re-clicked; ignore to keep a mode selected.
        if (value === 'chips' || value === 'nl') onModeChange(value);
      }}
      aria-label="Search input mode"
    >
      <ToggleGroupItem
        value="chips"
        aria-label="Filter builder"
        data-tip="Filter builder"
        data-testid="search-mode-chips"
      >
        <ListFilter size={14} />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="nl"
        aria-label="Natural language"
        data-tip="Natural language"
        data-testid="search-mode-nl"
      >
        <Sparkles size={14} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
