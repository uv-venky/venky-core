import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';
import { useSmartSearchDispatcher, useSmartSearchState } from '../../../components/core/smart-search/context';
import { isStickyFilter } from '../../../components/core/smart-search/utils';
export function ClearButton({ stickyFilters }) {
  const state = useSmartSearchState();
  const dispatch = useSmartSearchDispatcher();
  return (
    state.filters.length > 0 &&
    state.filters.some((f) => !isStickyFilter(f, stickyFilters)) &&
    _jsx(Button, {
      variant: 'ghost',
      size: 'icon',
      'data-testid': 'clear-button',
      onClick: (e) => {
        e.stopPropagation();
        dispatch({ type: 'clearSearch' });
      },
      'data-tip': 'Clear Filters',
      children: _jsx(X, {}),
    })
  );
}
//# sourceMappingURL=ClearButton.js.map
