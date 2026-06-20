/* Copyright (c) 2024-present VENKY Corp. */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, FunnelPlus, FunnelX, Loader2, X } from 'lucide-react';
import { memo, useState } from 'react';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import type { SortDirection } from '@/components/core/pivot/PivotTypes';
import type { Store } from '@/lib/core/common/types/Store';
import { useIsHeaderFiltersHidden } from '@/components/core/hooks/useStoreHooks';

function SortMenu(props: {
  onSort: (direction?: SortDirection) => Promise<void>;
  sortDirection?: SortDirection;
  sortPosition?: number;
  className?: string;
  iconClassName?: string;
  sortIcon?: React.ReactNode;
  store?: Store<any>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disableHeaderFilters?: boolean;
  columnId?: string;
}) {
  // store will be undefined when used inside pivot table header
  // assertExists(props.store, 'Store not found');
  useWhyDidYouUpdate('SortMenu', props);
  const {
    onSort,
    sortDirection,
    className,
    iconClassName,
    sortIcon,
    store,
    open,
    onOpenChange,
    disableHeaderFilters,
    sortPosition,
    columnId,
  } = props;
  const [isSorting, setIsSorting] = useState(false);
  const headerFiltersHidden = useIsHeaderFiltersHidden(store);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {isSorting ? (
          <Loader2 className="mx-2 size-4 animate-spin" />
        ) : (
          <SortIcon
            sortDirection={sortDirection}
            sortPosition={sortPosition}
            className={className}
            iconClassName={iconClassName}
            sortIcon={sortIcon}
            columnId={columnId}
          />
        )}
      </DropdownMenuTrigger>
      {open && (
        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={sortDirection === 'ascending'}
            onClick={() => {
              setIsSorting(true);
              onSort('ascending').finally(() => setIsSorting(false));
            }}
            data-testid={columnId ? `sort-ascending-${columnId}` : 'sort-ascending'}
          >
            <ArrowUpIcon className={iconClassName} /> Order Ascending
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={sortDirection === 'descending'}
            onClick={() => {
              setIsSorting(true);
              onSort('descending').finally(() => setIsSorting(false));
            }}
            data-testid={columnId ? `sort-descending-${columnId}` : 'sort-descending'}
          >
            <ArrowDownIcon className={iconClassName} /> Order Descending
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={sortDirection == null}
            onClick={() => {
              setIsSorting(true);
              onSort().finally(() => setIsSorting(false));
            }}
            data-testid={columnId ? `sort-remove-${columnId}` : 'sort-remove'}
          >
            <X /> Remove Order
          </DropdownMenuItem>
          {!disableHeaderFilters && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                if (store) {
                  store.getState().hideHeaderFilters = !(store.getState().hideHeaderFilters ?? false);
                }
              }}
              data-testid={columnId ? `sort-toggle-header-filters-${columnId}` : 'sort-toggle-header-filters'}
            >
              {headerFiltersHidden ? <FunnelPlus /> : <FunnelX />} {headerFiltersHidden ? 'Show' : 'Hide'} Filters
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

function SortIcon({
  sortDirection,
  className,
  iconClassName,
  sortIcon,
  sortPosition,
  columnId,
  ...props
}: {
  sortDirection?: SortDirection;
  className?: string;
  iconClassName?: string;
  sortIcon?: React.ReactNode;
  sortPosition?: number;
  columnId?: string;
} & React.ComponentProps<typeof Button>) {
  let description = 'Unsorted';
  let icon = <ArrowUpDownIcon className={iconClassName} />;
  if (sortDirection != null) {
    description = `sorted ${sortDirection === 'ascending' ? 'ascending' : 'descending'} ${sortPosition ? `at position ${sortPosition}` : ''}`;
    icon =
      sortDirection === 'ascending' ? (
        <ArrowUpIcon className={iconClassName} />
      ) : (
        <ArrowDownIcon className={iconClassName} />
      );
  }

  const testId = columnId ? `sort-trigger-${columnId}` : 'sort-trigger';

  return (
    <Button
      data-testid={testId}
      className={cn('cursor-pointer', className)}
      variant="ghost"
      size="icon"
      data-tip={description}
      {...props}
    >
      {sortIcon ?? icon}
    </Button>
  );
}

export default memo(SortMenu);
