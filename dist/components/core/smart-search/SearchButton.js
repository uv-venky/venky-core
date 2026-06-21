import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2023-present Venky Corp. */
import { Button } from '../../../components/ui/button';
import { Search } from 'lucide-react';
import { WaveDots } from '../../../components/core/common/WaveDots/WaveDots';
import { useSmartSearchDispatcher } from '../../../components/core/smart-search/context';
export function SearchButton(props) {
  const dispatch = useSmartSearchDispatcher();
  return _jsx(Button, {
    className: 'flex-grow-0',
    onClick: (e) => {
      e.stopPropagation();
      dispatch({ type: 'doSearch', reason: 'search-click' });
    },
    'data-tip': 'Search',
    variant: 'ghost',
    size: 'icon',
    'aria-label': 'Search',
    'data-testid': 'search-button',
    children: props.isBusy ? _jsx(WaveDots, { active: true }) : _jsx(Search, {}),
  });
}
//# sourceMappingURL=SearchButton.js.map
