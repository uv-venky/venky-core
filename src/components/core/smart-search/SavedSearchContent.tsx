/* Copyright (c) 2024-present Venky Corp. */

'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from '@/components/ui/command';
import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { EMPTY_ARRAY } from '@/lib/core/common/isEmpty';
import { Eye, EyeOff, Loader2, Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSmartSearchDispatcher, useSmartSearchState } from '@/components/core/smart-search/context';
import SavedSearchPopup from '@/components/core/smart-search/SavedSearchPopup';
import SavedViewItem from '@/components/core/smart-search/SavedViewItem';

type Props<T extends object> = {
  readOnly?: boolean;
  savedSearches: ReadonlyArray<SavedSearch<T>>;
  isLoading?: boolean;
  onDeleteView: (id: string) => Promise<void>;
  onUpdateView: (view: SavedSearch<T>) => Promise<void>;
  onSelectView: (view?: SavedSearch<T>) => void;
  onCreateView: (view: Exclude<SavedSearch<T>, 'id'>) => Promise<void>;
  forSmartSearch?: boolean;
  activeView?: SavedSearch<T>;
  stickyFilters?: (keyof T)[];
};

export default function SavedViewContent<T extends object>(props: Props<T>) {
  const {
    activeView,
    savedSearches,
    isLoading,
    onDeleteView,
    onCreateView,
    onUpdateView,
    onSelectView,
    forSmartSearch,
    stickyFilters,
  } = props;
  const state = useSmartSearchState();
  const [filter, setFilter] = useState('');
  const [editingView, setEditingView] = useState<Partial<SavedSearch<T>> | null>(null);
  const dispatch = useSmartSearchDispatcher();

  const filteredPublicViews = useMemo(() => {
    const options = (savedSearches ?? (EMPTY_ARRAY as ReadonlyArray<SavedSearch<T>>)).filter((o) => o.isPublic);
    if (!filter) return options;
    return options.filter((o) => o.name.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, savedSearches]);

  const filteredPrivateViews = useMemo(() => {
    const options = (savedSearches ?? (EMPTY_ARRAY as ReadonlyArray<SavedSearch<T>>)).filter((o) => !o.isPublic);
    if (!filter) return options;
    return options.filter((o) => o.name.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, savedSearches]);

  return (
    <>
      <Command shouldFilter={false} data-testid="saved-search-dropdown-menu">
        <CommandInput value={filter} placeholder="Filter saved views..." className="h-9" onValueChange={setFilter} />
        <CommandList>
          {isLoading && (
            <CommandLoading>
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> loading...
              </div>
            </CommandLoading>
          )}
          {!isLoading && <CommandEmpty>No private views found</CommandEmpty>}
          <CommandGroup heading="My Views">
            {filteredPrivateViews.length === 0 ? (
              <CommandItem disabled>No private views found</CommandItem>
            ) : (
              filteredPrivateViews.map((view, index) => (
                <SavedViewItem
                  activeView={activeView}
                  key={view.id ?? index}
                  onDeleteView={onDeleteView}
                  onSelectView={onSelectView}
                  view={view}
                />
              ))
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Public Views">
            {filteredPublicViews.length === 0 ? (
              <CommandItem disabled>No public views found</CommandItem>
            ) : (
              filteredPublicViews.map((view, index) => (
                <SavedViewItem
                  activeView={activeView}
                  key={view.id ?? index}
                  onDeleteView={onDeleteView}
                  onSelectView={onSelectView}
                  view={view}
                />
              ))
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="create-new-view"
              data-testid="create-new-view"
              onSelect={() => {
                setEditingView({
                  name: '',
                  isPublic: false,
                  owner: '',
                  isDefault: false,
                  description: '',
                  payload: {
                    filters: state.filters,
                  },
                });
              }}
              className="cursor-pointer"
            >
              Create New View
              <Plus className="ml-auto" />
            </CommandItem>
            <CommandItem
              value="update-view"
              data-testid="update-view"
              onSelect={() => {
                setEditingView({
                  ...activeView,
                  payload: {
                    ...activeView?.payload,
                    filters: state.filters,
                  },
                });
              }}
              className="cursor-pointer"
              disabled={!activeView?.owner}
            >
              Update View
              <Pencil className="ml-auto" />
            </CommandItem>
            {forSmartSearch && (
              <CommandItem
                data-testid="show-search"
                value="show-search"
                onSelect={() => {
                  dispatch({
                    type: 'setShowFilters',
                    showFilters: !state.showFilters,
                  });
                }}
                className="cursor-pointer"
              >
                {state.showFilters ? 'Hide Search' : 'Show Search'}
                {state.showFilters ? <EyeOff className="ml-auto" /> : <Eye className="ml-auto" />}
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
      {editingView && (
        <SavedSearchPopup
          stickyFilters={stickyFilters}
          onClose={() => setEditingView(null)}
          onCreate={onCreateView}
          onUpdate={onUpdateView}
          view={editingView as SavedSearch<T>}
          forSmartSearch={forSmartSearch}
        />
      )}
    </>
  );
}
