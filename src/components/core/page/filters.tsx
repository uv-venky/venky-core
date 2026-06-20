/* Copyright (c) 2024-present Venky Corp. */

'use client';

import useSavedViews from '@/components/core/hooks/useSavedViews';
import { useIsStoreBusy, useStoreFilters } from '@/components/core/hooks/useStoreHooks';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import { mergeSavedColumnOrder, resetTableColumnLayout } from '@/components/core/page/useTable';
import {
  applySavedTablePreferences,
  getTablePreferencesCustomPayload,
  resolveSavedViewPageSize,
  syncTablePageSize,
} from '@/components/core/page/table-column-preferences';
import SavedSearchComponent from '@/components/core/smart-search/SavedSearch';
import { SmartSearch, type OnSearchCallback } from '@/components/core/smart-search';
import type { Filters, StringKeyof } from '@/lib/core/common/ds/types/filter';
import type { Store } from '@/lib/core/common/types/Store';
import type { AccessorKeyColumnDef, Table } from '@tanstack/react-table';
import { useCallback, useMemo, useRef } from 'react';
import type { PivotSetting } from '@/components/core/pivot/PivotTypes';
import type { Column, SavedSearchAction } from '@/components/core/smart-search/types';
import logger from '@/lib/core/client/client-logger';
import { deferAutoQueryForSavedSearches } from '@/lib/core/client/store';

export function shouldExecuteSmartSearchQuery(
  filters: Filters<object> | undefined,
  action: SavedSearchAction,
): boolean {
  const hasSavedFilters = (filters?.length ?? 0) > 0;
  return (
    hasSavedFilters ||
    action === 'search-click' ||
    action === 'search-blur' ||
    action === 'clear-filters' ||
    action === 'natural-language-search'
  );
}

function PivotSavedSearchComponent<T extends object>({
  settings,
  pageId,
  itemId,
  store,
  disableSavedSearches,
}: {
  settings: PivotSetting<StringKeyof<T>>;
  pageId: string;
  itemId: string;
  store: Store<T>;
  disableSavedSearches?: boolean;
}) {
  // Mark store as waiting for saved searches synchronously (before useEffect)
  // This ensures autoQuery checks the flag even if store mounted first
  if (!disableSavedSearches && !store.initialQueryFired()) {
    deferAutoQueryForSavedSearches(store);
  }

  const { isLoading, savedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch } = useSavedViews<T>(
    pageId,
    itemId,
    undefined,
    store,
  );

  return (
    <SavedSearchComponent
      isLoading={isLoading}
      savedSearches={savedSearches}
      onDeleteView={async (id) => {
        return await deleteSavedSearch(id);
      }}
      onUpdateView={async (view) => {
        const newView = {
          ...view,
          payload: { ...view.payload, custom: { settings } },
        };
        return await updateSavedSearch(newView);
      }}
      onCreateView={async (view) => {
        const newView = {
          ...view,
          payload: { ...view.payload, custom: { settings } },
        };
        return await createSavedSearch(newView);
      }}
    />
  );
}

export function PivotFilters<T extends object>({
  store,
  settings,
  columns,
  pageId,
  itemId,
  border,
  roundedCorners,
  disableSavedSearches,
  onSearch,
  updateFilters,
}: {
  store: Store<T>;
  settings: PivotSetting<StringKeyof<T>>;
  columns: Column<T>[];
  pageId: string;
  itemId: string;
  border?: 'full' | 'bottom' | 'none';
  roundedCorners?: boolean;
  disableSavedSearches?: boolean;
  updateFilters?: (filters: Filters<T>) => Filters<T>;
  onSearch: (props: {
    action: SavedSearchAction;
    filters?: Filters<T>;
    settings?: PivotSetting<StringKeyof<T>>;
  }) => Promise<void>;
}) {
  const [filters, setFilters] = useStoreFilters(store);
  useWhyDidYouUpdate('Filters', { store, filters, setFilters });

  const onSearchCallback: OnSearchCallback<T> = useCallback(
    ({ custom, filters }, action) => {
      // if filters are not saved as part of the view, no need to re-query the store
      if (filters) {
        setFilters(updateFilters ? updateFilters(filters) : filters);
      }
      onSearch({ filters, settings: custom?.settings as PivotSetting<StringKeyof<T>> | undefined, action });
    },
    [onSearch, setFilters, updateFilters],
  );

  const savedSearch = useMemo(() => {
    return disableSavedSearches ? undefined : (
      <PivotSavedSearchComponent
        settings={settings}
        pageId={pageId}
        itemId={itemId}
        store={store}
        disableSavedSearches={disableSavedSearches}
      />
    );
  }, [disableSavedSearches, itemId, pageId, settings, store]);

  return (
    <SmartSearch
      border={border}
      roundedCorners={roundedCorners}
      columns={columns}
      filters={filters}
      onSearch={onSearchCallback}
      searchOnBlur={false}
      savedSearch={savedSearch}
    />
  );
}

function TableSavedSearchComponent<T extends object>({
  pageId,
  itemId,
  table,
  stickyFilters,
  store,
  disableSavedSearches,
}: {
  pageId: string;
  itemId: string;
  table?: Table<T>;
  stickyFilters?: (keyof T)[];
  store: Store<T>;
  disableSavedSearches?: boolean;
}) {
  // Mark store as waiting for saved searches synchronously (before useEffect)
  // This ensures autoQuery checks the flag even if store mounted first
  if (!disableSavedSearches && !store.initialQueryFired()) {
    deferAutoQueryForSavedSearches(store);
  }

  const { savedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch, isLoading } = useSavedViews<T>(
    pageId,
    itemId,
    undefined,
    store,
  );

  return (
    <SavedSearchComponent
      stickyFilters={stickyFilters}
      isLoading={isLoading}
      savedSearches={savedSearches}
      onDeleteView={async (id) => {
        return await deleteSavedSearch(id);
      }}
      onUpdateView={async (view) => {
        const newView = {
          ...view,
        };
        if (table) {
          newView.payload = {
            ...view.payload,
            custom: getTablePreferencesCustomPayload(table),
          };
        }
        return await updateSavedSearch(newView);
      }}
      onCreateView={async (view) => {
        const newView = {
          ...view,
        };
        if (table) {
          newView.payload = {
            ...view.payload,
            custom: getTablePreferencesCustomPayload(table),
          };
        }
        return await createSavedSearch(newView);
      }}
    />
  );
}

export default function TableFilters<T extends object>({
  store,
  table,
  columns,
  pageId,
  itemId,
  border,
  roundedCorners,
  disableSavedSearches,
  stickyFilters,
  searchOnBlur = true,
  updateFilters,
  enableNaturalLanguageSearch,
  nlPlaceholder,
}: {
  store: Store<T>;
  table?: Table<T>;
  columns: Column<T>[];
  pageId: string;
  itemId: string;
  border?: 'full' | 'bottom' | 'none';
  roundedCorners?: boolean;
  disableSavedSearches?: boolean;
  stickyFilters?: (keyof T)[];
  searchOnBlur?: boolean;
  updateFilters?: (filters: Filters<T>) => Filters<T>;
  /** Per-page opt-in; passed through to SmartSearch (blocked when config sets `features.naturalLanguageSearch: false`). */
  enableNaturalLanguageSearch?: boolean;
  /** Placeholder for natural-language search mode. */
  nlPlaceholder?: string;
}) {
  const [filters, setFilters] = useStoreFilters(store);
  const isBusy = useIsStoreBusy(store);
  useWhyDidYouUpdate('Filters', { store, filters, setFilters });
  const lastSearchRef = useRef<number>(0);

  const onSearch: OnSearchCallback<T> = useCallback(
    ({ custom, filters }, action) => {
      const shouldExecuteQuery = shouldExecuteSmartSearchQuery(filters, action);
      const isSavedSearchActivation = action === 'saved-search-activated';
      const viewPageSize = isSavedSearchActivation && table ? resolveSavedViewPageSize(table, custom) : undefined;

      // if filters are not saved as part of the view, no need to re-query the store
      if (filters) {
        setFilters(updateFilters ? updateFilters(filters) : filters);
      }
      if (table && action === 'saved-search-deactivated') {
        void resetTableColumnLayout(table);
      } else if (custom?.columnOrder && table) {
        const tableColumns = (table.options.meta as { tableColumns?: AccessorKeyColumnDef<T>[] })?.tableColumns;
        const order = tableColumns?.length
          ? mergeSavedColumnOrder(custom.columnOrder, tableColumns)
          : custom.columnOrder;
        table.setColumnOrder(order);
      }
      if (action !== 'saved-search-deactivated') {
        if (custom?.columnVisibility) {
          table?.setColumnVisibility(custom.columnVisibility);
        }
        if (custom?.columnSizing) {
          table?.setColumnSizing(custom.columnSizing);
        } else {
          table?.resetColumnSizing();
        }
        if (table) {
          applySavedTablePreferences(table, custom);
          if (viewPageSize != null) {
            syncTablePageSize(table, viewPageSize);
            if (!shouldExecuteQuery) {
              void store.executeQuery({ query: { limit: viewPageSize }, force: true });
            }
          }
        }
      }
      // if filters are not saved as part of the view, no need to re-query the store
      if (shouldExecuteQuery) {
        // Dedupe rapid-fire search calls (React Strict Mode can cause double invocation)
        const now = Date.now();
        if (now - lastSearchRef.current < 50) {
          return;
        }
        lastSearchRef.current = now;

        if (logger.isDebugEnabled) {
          logger.debug({
            message: 'Executing query for smart search',
            filters,
            action,
          });
        }
        store?.executeQuery({
          query: viewPageSize != null ? { limit: viewPageSize } : {},
          force: action === 'search-click',
        });
      }
    },
    [setFilters, store, table, updateFilters],
  );

  const savedSearch = useMemo(() => {
    return disableSavedSearches ? undefined : (
      <TableSavedSearchComponent<T>
        table={table}
        pageId={pageId}
        itemId={itemId}
        store={store}
        disableSavedSearches={disableSavedSearches}
        stickyFilters={stickyFilters}
      />
    );
  }, [disableSavedSearches, itemId, pageId, stickyFilters, table, store]);

  return (
    <SmartSearch
      stickyFilters={stickyFilters}
      border={border}
      roundedCorners={roundedCorners}
      columns={columns}
      filters={filters}
      onSearch={onSearch}
      searchOnBlur={searchOnBlur}
      savedSearch={savedSearch}
      isBusy={isBusy}
      enableNaturalLanguageSearch={enableNaturalLanguageSearch}
      nlPlaceholder={nlPlaceholder}
    />
  );
}
