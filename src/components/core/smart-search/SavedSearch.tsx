/* Copyright (c) 2024-present Venky Corp. */

'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useSmartSearchDispatcher, useSmartSearchState } from '@/components/core/smart-search/context';
import SavedViewContent from '@/components/core/smart-search/SavedSearchContent';

type Props<T extends object> = {
  readOnly?: boolean;
  savedSearches: ReadonlyArray<SavedSearch<T>>;
  isLoading: boolean;
  onDeleteView: (id: string) => Promise<SavedSearch<T> | undefined>;
  onUpdateView: (view: SavedSearch<T>) => Promise<SavedSearch<T>>;
  onCreateView: (view: Exclude<SavedSearch<T>, 'id'>) => Promise<SavedSearch<T>>;
  stickyFilters?: (keyof T)[];
};

export default function SavedSearchComponent<T extends object>(props: Props<T>) {
  const { savedSearches, isLoading, onDeleteView, onCreateView, onUpdateView, stickyFilters } = props;
  const state = useSmartSearchState();
  const dispatch = useSmartSearchDispatcher();
  const [open, setOpen] = useState(false);
  const activeView = savedSearches?.find((o) => o.id === state.activeView?.id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          data-testid="saved-search-button"
          aria-expanded={open}
          className="justify-between border-none shadow-none"
          aria-label={activeView?.name ?? 'Saved Searches'}
        >
          {activeView?.name ?? 'Saved Searches'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex max-h-[calc(var(--radix-popper-available-height)-1em)] flex-col overflow-hidden p-0">
        <SavedViewContent
          stickyFilters={stickyFilters}
          activeView={activeView}
          forSmartSearch
          savedSearches={savedSearches}
          isLoading={isLoading}
          onDeleteView={async (id) => {
            const activeView = await onDeleteView(id);
            dispatch({ type: 'setActiveView', activeView });
            setOpen(false);
          }}
          onCreateView={async (view) => {
            const activeView = await onCreateView(view);
            dispatch({ type: 'setActiveView', activeView });
            setOpen(false);
          }}
          onUpdateView={async (view) => {
            await onUpdateView(view);
            setOpen(false);
          }}
          onSelectView={(view) => {
            dispatch({ type: 'setActiveView', activeView: view });
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
