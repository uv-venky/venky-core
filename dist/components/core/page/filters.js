/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import useSavedViews from '../../../components/core/hooks/useSavedViews';
import { useIsStoreBusy, useStoreFilters } from '../../../components/core/hooks/useStoreHooks';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import { mergeSavedColumnOrder, resetTableColumnLayout } from '../../../components/core/page/useTable';
import { applySavedTablePreferences, getTablePreferencesCustomPayload, resolveSavedViewPageSize, syncTablePageSize, } from '../../../components/core/page/table-column-preferences';
import SavedSearchComponent from '../../../components/core/smart-search/SavedSearch';
import { SmartSearch } from '../../../components/core/smart-search';
import { useCallback, useMemo, useRef } from 'react';
import logger from '../../../lib/core/client/client-logger';
import { deferAutoQueryForSavedSearches } from '../../../lib/core/client/store';
export function shouldExecuteSmartSearchQuery(filters, action) {
    const hasSavedFilters = (filters?.length ?? 0) > 0;
    return (hasSavedFilters ||
        action === 'search-click' ||
        action === 'search-blur' ||
        action === 'clear-filters' ||
        action === 'natural-language-search');
}
function PivotSavedSearchComponent({ settings, pageId, itemId, store, disableSavedSearches, }) {
    // Mark store as waiting for saved searches synchronously (before useEffect)
    // This ensures autoQuery checks the flag even if store mounted first
    if (!disableSavedSearches && !store.initialQueryFired()) {
        deferAutoQueryForSavedSearches(store);
    }
    const { isLoading, savedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch } = useSavedViews(pageId, itemId, undefined, store);
    return (_jsx(SavedSearchComponent, { isLoading: isLoading, savedSearches: savedSearches, onDeleteView: async (id) => {
            return await deleteSavedSearch(id);
        }, onUpdateView: async (view) => {
            const newView = {
                ...view,
                payload: { ...view.payload, custom: { settings } },
            };
            return await updateSavedSearch(newView);
        }, onCreateView: async (view) => {
            const newView = {
                ...view,
                payload: { ...view.payload, custom: { settings } },
            };
            return await createSavedSearch(newView);
        } }));
}
export function PivotFilters({ store, settings, columns, pageId, itemId, border, roundedCorners, disableSavedSearches, onSearch, updateFilters, }) {
    const [filters, setFilters] = useStoreFilters(store);
    useWhyDidYouUpdate('Filters', { store, filters, setFilters });
    const onSearchCallback = useCallback(({ custom, filters }, action) => {
        // if filters are not saved as part of the view, no need to re-query the store
        if (filters) {
            setFilters(updateFilters ? updateFilters(filters) : filters);
        }
        onSearch({ filters, settings: custom?.settings, action });
    }, [onSearch, setFilters, updateFilters]);
    const savedSearch = useMemo(() => {
        return disableSavedSearches ? undefined : (_jsx(PivotSavedSearchComponent, { settings: settings, pageId: pageId, itemId: itemId, store: store, disableSavedSearches: disableSavedSearches }));
    }, [disableSavedSearches, itemId, pageId, settings, store]);
    return (_jsx(SmartSearch, { border: border, roundedCorners: roundedCorners, columns: columns, filters: filters, onSearch: onSearchCallback, searchOnBlur: false, savedSearch: savedSearch }));
}
function TableSavedSearchComponent({ pageId, itemId, table, stickyFilters, store, disableSavedSearches, }) {
    // Mark store as waiting for saved searches synchronously (before useEffect)
    // This ensures autoQuery checks the flag even if store mounted first
    if (!disableSavedSearches && !store.initialQueryFired()) {
        deferAutoQueryForSavedSearches(store);
    }
    const { savedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch, isLoading } = useSavedViews(pageId, itemId, undefined, store);
    return (_jsx(SavedSearchComponent, { stickyFilters: stickyFilters, isLoading: isLoading, savedSearches: savedSearches, onDeleteView: async (id) => {
            return await deleteSavedSearch(id);
        }, onUpdateView: async (view) => {
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
        }, onCreateView: async (view) => {
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
        } }));
}
export default function TableFilters({ store, table, columns, pageId, itemId, border, roundedCorners, disableSavedSearches, stickyFilters, searchOnBlur = true, updateFilters, enableNaturalLanguageSearch, nlPlaceholder, }) {
    const [filters, setFilters] = useStoreFilters(store);
    const isBusy = useIsStoreBusy(store);
    useWhyDidYouUpdate('Filters', { store, filters, setFilters });
    const lastSearchRef = useRef(0);
    const onSearch = useCallback(({ custom, filters }, action) => {
        const shouldExecuteQuery = shouldExecuteSmartSearchQuery(filters, action);
        const isSavedSearchActivation = action === 'saved-search-activated';
        const viewPageSize = isSavedSearchActivation && table ? resolveSavedViewPageSize(table, custom) : undefined;
        // if filters are not saved as part of the view, no need to re-query the store
        if (filters) {
            setFilters(updateFilters ? updateFilters(filters) : filters);
        }
        if (table && action === 'saved-search-deactivated') {
            void resetTableColumnLayout(table);
        }
        else if (custom?.columnOrder && table) {
            const tableColumns = table.options.meta?.tableColumns;
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
            }
            else {
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
    }, [setFilters, store, table, updateFilters]);
    const savedSearch = useMemo(() => {
        return disableSavedSearches ? undefined : (_jsx(TableSavedSearchComponent, { table: table, pageId: pageId, itemId: itemId, store: store, disableSavedSearches: disableSavedSearches, stickyFilters: stickyFilters }));
    }, [disableSavedSearches, itemId, pageId, stickyFilters, table, store]);
    return (_jsx(SmartSearch, { stickyFilters: stickyFilters, border: border, roundedCorners: roundedCorners, columns: columns, filters: filters, onSearch: onSearch, searchOnBlur: searchOnBlur, savedSearch: savedSearch, isBusy: isBusy, enableNaturalLanguageSearch: enableNaturalLanguageSearch, nlPlaceholder: nlPlaceholder }));
}
//# sourceMappingURL=filters.js.map