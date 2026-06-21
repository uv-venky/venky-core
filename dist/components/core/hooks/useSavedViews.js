import { useStore, clearAutoQueryDeferral, clearAutoQueryDeferralAndExecute } from '../../../lib/core/client/store';
import { useCallback, useEffect } from 'react';
import { useClientSession } from '../../../components/core/session-context';
import { useIsStoreLoading, useRows } from '../../../components/core/hooks/useStoreHooks';
import { useSmartSearchDispatcher } from '../../../components/core/smart-search/context';
import { AbortError } from '../../../lib/core/common/error';
/** Prevents duplicate default-view activation (React Strict Mode, remounts). */
const defaultSavedSearchAppliedByStore = new WeakMap();
export default function useSavedViews(pageId, itemId, onDefaultView, dataStore) {
    const dispatch = useSmartSearchDispatcher();
    const store = useStore({
        datasourceId: 'SavedSearch',
        page: 'default',
        alias: pageId + itemId,
        limit: 2000,
    });
    const { userName } = useClientSession();
    const rows = useRows(store);
    const isLoading = useIsStoreLoading(store);
    useEffect(() => {
        if (!store) {
            return;
        }
        async function fetchSavedSearches() {
            // Always fetch saved searches (so list is available in UI)
            await store.executeQuery({
                query: {
                    data: {
                        pageId,
                        itemId,
                    },
                },
            });
            // Check if data store already has filters (from URL) AFTER fetching
            const existingFilters = dataStore.smartSearchFilters() ?? [];
            const hasExistingFilters = existingFilters.length > 0;
            // If URL filters exist, skip applying default saved search
            // Clear deferral but don't trigger autoQuery (URL query already executed)
            if (hasExistingFilters) {
                clearAutoQueryDeferral(dataStore);
                return;
            }
            // Only apply default saved search if no URL filters are present
            const row = store.dbList().find((row) => row.isDefault && row.owner === userName);
            const alreadyAppliedDefault = defaultSavedSearchAppliedByStore.get(dataStore);
            if (row) {
                if (!alreadyAppliedDefault) {
                    defaultSavedSearchAppliedByStore.set(dataStore, true);
                    // Layout-only consumers (e.g. Personalization) apply via callback.
                    // Table/Pivot filters rely on SmartSearch pendingSearch → onSearch (single query path).
                    if (onDefaultView) {
                        onDefaultView(row);
                    }
                    else {
                        dispatch({ type: 'setActiveView', activeView: row });
                    }
                }
                // Clear deferral but don't trigger autoQuery (default saved search will trigger query)
                clearAutoQueryDeferral(dataStore);
            }
            else if (!alreadyAppliedDefault) {
                defaultSavedSearchAppliedByStore.set(dataStore, true);
                // No default saved search - clear deferral and trigger autoQuery
                clearAutoQueryDeferralAndExecute(dataStore);
            }
            else {
                clearAutoQueryDeferral(dataStore);
            }
        }
        fetchSavedSearches();
    }, [itemId, pageId, store, onDefaultView, userName, dispatch, dataStore]);
    const createSavedSearch = useCallback(async (item) => {
        item.itemId = itemId;
        item.pageId = pageId;
        if (item.isDefault) {
            const rows = store.dbList();
            for (const row of rows) {
                if (row.id !== item.id && row.isDefault && row.owner === userName) {
                    store.updateRow(row.id, { isDefault: false });
                }
            }
        }
        await store.createNew({
            partialRecord: item,
            status: 'I',
            addOnTop: true,
        });
        if (!(await store.save())) {
            const id = store.currentRowId();
            if (id) {
                store.resetRow(id);
            }
            throw new AbortError();
        }
        return store.currentRow();
    }, [itemId, pageId, store, userName]);
    const updateSavedSearch = useCallback(async (item) => {
        store.updateRow(item.id, item);
        if (item.isDefault) {
            const rows = store.dbList();
            for (const row of rows) {
                if (row.id !== item.id && row.isDefault && row.owner === userName) {
                    store.updateRow(row.id, { isDefault: false });
                }
            }
        }
        if (!(await store.save())) {
            throw new AbortError();
        }
        return store.row(item.id);
    }, [store, userName]);
    const deleteSavedSearch = useCallback(async (id) => {
        store.deleteRow(id);
        await store.save();
        return store.currentRow();
    }, [store]);
    return {
        savedSearches: rows,
        createSavedSearch,
        updateSavedSearch,
        deleteSavedSearch,
        isLoading,
    };
}
//# sourceMappingURL=useSavedViews.js.map