/* Copyright (c) 2023-present Venky Corp. */

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSmartSearchDispatcher, useSmartSearchState } from '@/components/core/smart-search/context';
import { isStickyFilter } from '@/components/core/smart-search/utils';

export function ClearButton<T extends object>({ stickyFilters }: { stickyFilters?: (keyof T)[] }) {
  const state = useSmartSearchState<T>();
  const dispatch = useSmartSearchDispatcher<T>();

  return (
    state.filters.length > 0 &&
    state.filters.some((f) => !isStickyFilter(f, stickyFilters)) && (
      <Button
        variant="ghost"
        size="icon"
        data-testid="clear-button"
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'clearSearch' });
        }}
        data-tip="Clear Filters"
      >
        <X />
      </Button>
    )
  );
}
