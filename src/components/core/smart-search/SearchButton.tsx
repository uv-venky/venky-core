/* Copyright (c) 2023-present Venky Corp. */

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { WaveDots } from '@/components/core/common/WaveDots/WaveDots';
import { useSmartSearchDispatcher } from '@/components/core/smart-search/context';

export function SearchButton(props: { isBusy?: boolean }) {
  const dispatch = useSmartSearchDispatcher();

  return (
    <Button
      className="flex-grow-0"
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'doSearch', reason: 'search-click' });
      }}
      data-tip="Search"
      variant="ghost"
      size="icon"
      aria-label="Search"
      data-testid="search-button"
    >
      {props.isBusy ? <WaveDots active /> : <Search />}
    </Button>
  );
}
