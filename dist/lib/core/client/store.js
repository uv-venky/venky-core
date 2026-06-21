/* Copyright (c) 2024-present Venky Corp. */
'use client';
import { useEffect } from 'react';
import { showError, showSuccess, showWarning, confirmWithUser, touch } from '../../../lib/core/client/notifications';
import { deepEqual, deepUnwrap } from '../../../lib/core/common/deepUtils';
import { AbortError, getErrorMessage, isErrorResponse } from '../../../lib/core/common/error';
import { areEqualShallow, EMPTY_ARRAY, EMPTY_OBJECT, isEmpty, isEmptyObject, isNull, keys, } from '../../../lib/core/common/isEmpty';
import stringify from 'fast-json-stable-stringify';
import { globalPubSub, PubSubClass } from '../../../lib/core/client/pub-sub';
import { getTrackId, STORE_CACHE, storeState } from '../../../lib/core/client/state';
import { subscribe } from 'valtio';
import { sseManager } from '../../../lib/sse/client';
import clientLogger from '../../../lib/core/client/client-logger';
import { applyLocalFilters } from '../../../lib/core/client/local-filters';
import { applyHeaderModifiers } from '../../../lib/core/client/header-plugin';
import { decrementPending, incrementPending } from '../../../lib/core/client/loading-tracker';
import { registerStore, updateStore, unregisterStore, logActivity, updateActivity, } from '../../../lib/core/client/devtools/devtools-store';
import { invalidateQueries } from '../../../lib/core/client/valtioQueryStore';
import { pushLog } from '../../../lib/core/client/diagnostics';
const debug = process.env.NODE_ENV === 'development';
const EXCLUDE_ATTRIBUTES = [
    '_id',
    '_status',
    '_ca',
    '_changedAttributes',
    '_orig',
    '_newKeys',
    '_ov',
    '_cid',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
];
function getKey(props) {
    const { datasourceId, alias, page } = props;
    return `${alias}-${datasourceId}-${page}`;
}
const InitPromiseCache = new Map();
const storesWaitingForSavedSearches = new WeakMap();
export function deferAutoQueryForSavedSearches(store) {
    storesWaitingForSavedSearches.set(store, true);
}
export function clearAutoQueryDeferral(store) {
    storesWaitingForSavedSearches.delete(store);
}
export function clearAutoQueryDeferralAndExecute(store) {
    storesWaitingForSavedSearches.delete(store);
    // If autoQuery is enabled and hasn't fired, trigger it now
    if (store.autoQuery && !store.initialQueryFired() && store.status() === 'ok') {
        store.executeQuery();
    }
}
function isWaitingForSavedSearches(store) {
    return storesWaitingForSavedSearches.has(store);
}
export function isFromDB(row) {
    return !isNull(row) && row._status !== 'N' && row._status !== 'I';
}
export function removeSystemAttributes(row) {
    const { _status, _id, _orig, _ca, _changedAttributes, _cid, _newKeys, _ov, ...rest } = row;
    return rest;
}
export function toNewRow(row) {
    const { _status, _id, _orig, _ca, _cid, _newKeys, _ov, ...rest } = row;
    return rest;
}
export class StoreClass {
    page;
    datasourceId;
    ignorePKDuplicate = false;
    alias;
    limit;
    defaultLimit;
    reverse = false;
    key = '';
    previousQuery = '';
    previousQueryTime = 0;
    previousCountQuery = '';
    previousSmartFilters = '';
    previousPromise;
    displayName;
    usageCount = 0;
    pubsub = new PubSubClass();
    transient;
    localStore;
    type = 'DataStore';
    feedback = '';
    data = {};
    filterLocally;
    includeCount;
    preQueryCallbacks = [];
    select;
    destroyed = false;
    /** Unsubscribe functions for autoRefresh listeners */
    _autoRefreshUnsubscribes = [];
    /** Track last refresh time to debounce autoRefresh events */
    _lastAutoRefreshTime = 0;
    /** Whether to auto-query when mounted (stored for re-mount scenarios) */
    autoQuery = false;
    /** Query action names to invalidate when this store saves successfully */
    invalidateOnSave;
    /** Stores to invalidate/refresh when this store saves successfully */
    invalidateStoresOnSave;
    /** Default equality matching for queries */
    defaultMatch;
    /** Default filter conditions for queries */
    defaultFilters;
    /** Registered child stores with their configs and cleanup functions */
    _childStoreEntries = [];
    constructor({ page, displayName, datasourceId, alias, limit = 20, transient, localStore, type, filterLocally, includeCount, ignorePKDuplicate, select, autoQuery, invalidateOnSave, invalidateStoresOnSave, match, filters, }) {
        this.datasourceId = datasourceId;
        this.page = page;
        this.alias = alias;
        this.limit = limit;
        this.defaultLimit = limit;
        this.transient = transient;
        this.localStore = localStore;
        this.displayName = displayName || `${alias} (${datasourceId})`;
        this.type = type ?? 'DataStore';
        this.filterLocally = filterLocally ?? false;
        this.includeCount = includeCount ?? false;
        this.key = getKey({ alias, datasourceId, page });
        this.ignorePKDuplicate = ignorePKDuplicate ?? false;
        this.select = select;
        this.autoQuery = autoQuery ?? false;
        this.invalidateOnSave = invalidateOnSave;
        this.invalidateStoresOnSave = invalidateStoresOnSave;
        this.defaultMatch = match;
        this.defaultFilters = filters;
        // if (!ws()?.sendRequest) {
        //   throw new Error('ws.sendRequest is not defined');
        // }
    }
    async init() {
        incrementPending(`attr:${this.datasourceId}`);
        await this._initAttributes().finally(() => {
            decrementPending();
        });
    }
    static get(props) {
        const key = getKey(props);
        const s = STORE_CACHE.get(key);
        if (s && s.status() === 'ok') {
            return s;
        }
        else {
            return null;
        }
    }
    getState() {
        return storeState.data[this.key];
    }
    cleanup() {
        if (STORE_CACHE.has(this.key)) {
            this.destroyed = true;
            STORE_CACHE.delete(this.key);
            storeState.data[this.key] = undefined;
            storeState.attributes[this.datasourceId] = undefined;
            storeState.pkAttributes[this.datasourceId] = undefined;
            // Unregister from devtools
            unregisterStore(this.key);
            // Cleanup autoRefresh subscriptions
            if (this._autoRefreshUnsubscribes.length > 0) {
                for (const unsub of this._autoRefreshUnsubscribes) {
                    unsub();
                }
                this._autoRefreshUnsubscribes = [];
            }
        }
        // cleanupRegisteredAlias({
        //   workspaceId: this.workSpace,
        //   pageId: this.page,
        //   alias: this.alias,
        // });
    }
    addPreQueryCallback(callback) {
        this.preQueryCallbacks = [...this.preQueryCallbacks, callback];
        return () => {
            this.preQueryCallbacks = this.preQueryCallbacks.filter((c) => c !== callback);
        };
    }
    /**
     * Register a child store for parent-child lifecycle management.
     * - Auto-queries child when parent's active row changes (with dirty confirmation)
     * - Cascades save (populates FKs from parent row)
     * - Aggregates isDirty across parent + children
     * - Cascades resetStore
     */
    _registerChildStore = (config) => {
        // Prevent duplicate registration
        if (this._childStoreEntries.find((e) => e.config.store === config.store)) {
            return () => this._unregisterChildStore(config.store);
        }
        const cleanups = [];
        const childStore = config.store;
        // 1. Subscribe to parent's OnRecordActive for auto-query
        const unsubRecordActive = this.pubsub.sub('OnRecordActive', async (_, { id }) => {
            // If child is dirty, confirm before switching
            if (childStore.isStoreDirty()) {
                childStore.resetStore();
            }
            if (!id) {
                childStore.clearSync();
                return;
            }
            const parentRow = this.row(id);
            if (!parentRow) {
                childStore.clearSync();
                return;
            }
            // Only query if parent row is persisted (has a server ID)
            const isPersistedRow = (parentRow._status ?? 'Q') === 'Q' || parentRow._status === 'U';
            if (isPersistedRow && parentRow._id) {
                const match = {};
                const childFields = keys(config.fieldMapping);
                for (const childField of childFields) {
                    const parentField = config.fieldMapping[childField];
                    if (!parentField)
                        continue;
                    match[childField] = parentRow[parentField];
                }
                await childStore.executeQuery({
                    query: { match },
                });
            }
            else {
                childStore.clearSync();
            }
        });
        cleanups.push(unsubRecordActive);
        // 2. Subscribe to child store state for dirty tracking
        const entry = { config, cleanups, lastChildDirty: false };
        const childState = childStore.getState();
        const unsubChildDirty = subscribe(childState, () => {
            const nowDirty = childStore.isStoreDirty();
            if (nowDirty !== entry.lastChildDirty) {
                entry.lastChildDirty = nowDirty;
                // Update parent's _childDirtyCount for reactive useIsStoreDirty
                const state = this.getState();
                state._childDirtyCount = this._childStoreEntries.filter((e) => e.lastChildDirty).length;
            }
        });
        cleanups.push(unsubChildDirty);
        this._childStoreEntries.push(entry);
        return () => this._unregisterChildStore(config.store);
    };
    _unregisterChildStore = (childStore) => {
        const idx = this._childStoreEntries.findIndex((e) => e.config.store === childStore);
        if (idx === -1)
            return;
        const entry = this._childStoreEntries[idx];
        for (const cleanup of entry.cleanups) {
            cleanup();
        }
        this._childStoreEntries.splice(idx, 1);
        // Recalculate _childDirtyCount
        this.getState()._childDirtyCount = this._childStoreEntries.filter((e) => e.lastChildDirty).length;
    };
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // static PROMISE_MAP = new Map<string, Promise<Store<any>>>();
    // static create<T extends object>(props: StoreProps<T>): Promise<Store<T>> {
    //   const key = getKey(props);
    //   if (StoreClass.PROMISE_MAP.has(key)) {
    //     return StoreClass.PROMISE_MAP.get(key) as Promise<Store<T>>;
    //   }
    //   const promise = new Promise<Store<T>>(async (resolve, reject) => {
    //     StoreClass.createAsync(props).then(resolve).catch(reject);
    //   });
    //   StoreClass.PROMISE_MAP.set(key, promise);
    //   return promise;
    // }
    static createSync(props, instantiate) {
        const { onInitialized, datasourceId, hideHeaderFilters } = props;
        const key = getKey(props);
        const s = STORE_CACHE.get(key);
        if (s) {
            return s;
        }
        if (!storeState.attributes[datasourceId]) {
            storeState.attributes[datasourceId] = [];
            storeState.pkAttributes[datasourceId] = [];
        }
        // Only show loading before first query when autoQuery will run; otherwise isLoading
        // stays true forever (executeQuery is what clears it) and save() sees isBusy().
        const initialIsLoading = Boolean(props.autoQuery);
        const _storeState = {
            rows: { x: {} },
            rowIds: [],
            originalRows: {},
            initialQueryFired: false,
            isLoading: initialIsLoading,
            isPosting: false,
            insertable: false,
            updatable: false,
            deletable: false,
            queryable: true,
            autoQueryFired: false,
            hasMoreRows: true,
            selected: {},
            originalRowIds: [],
            status: 'pending',
            fieldErrors: {},
            storeFilters: [],
            smartSearchFilters: [],
            headerFilters: {},
            draftHeaderFilters: {},
            hideHeaderFilters: hideHeaderFilters ?? true,
            sort: props.sort,
            offset: 0,
            initialQueryFiredAt: -1,
            needsRefresh: false,
            _childDirtyCount: 0,
        };
        storeState.data[key] = _storeState;
        const store = instantiate ? instantiate() : new StoreClass(props);
        STORE_CACHE.set(key, store);
        // Register with devtools
        registerStore({
            key,
            datasourceId,
            alias: props.alias,
            page: props.page,
            rowCount: 0,
            isLoading: initialIsLoading,
            isPosting: false,
            isDirty: false,
            dirtyRowCount: 0,
        });
        // Set up store invalidation subscription for all stores (allows programmatic invalidation)
        if (typeof window !== 'undefined') {
            setupStoreInvalidation(store);
        }
        // Set up autoRefresh subscriptions if enabled
        if (props.autoRefresh && typeof window !== 'undefined') {
            setupAutoRefresh(store);
        }
        if (typeof window !== 'undefined') {
            setTimeout(async () => {
                if (store.destroyed)
                    return;
                await store.init();
                await onInitialized?.(store);
                if (props.autoQuery && !store.initialQueryFired() && !isWaitingForSavedSearches(store)) {
                    await store.executeQuery();
                }
            }, 0);
        }
        return store;
    }
    _getPrimaryKeySync = (pkAttributes, r) => {
        if (this.ignorePKDuplicate || (pkAttributes?.length ?? 0) === 0)
            return this.newRecordID();
        const pk = pkAttributes.reduce((key, attr) => `${key}${key === '' ? '' : '-'}${r[attr.code] ?? this.newRecordID()}`, '');
        if (!pk) {
            throw new Error(`${this.datasourceId}: Empty value not allowed for _id!`);
        }
        return pk;
    };
    afterAttributeInit() {
        // override in subclass
    }
    _initAttributes = async () => {
        if (this.localStore || this.transient)
            return;
        const { datasourceId, key } = this;
        const attrs = storeState.attributes[datasourceId];
        if (attrs.length > 0) {
            storeState.data[this.key].status = 'ok';
            this.afterAttributeInit();
            return;
        }
        let previousInitPromise = InitPromiseCache.get(datasourceId);
        const that = this;
        if (!previousInitPromise) {
            previousInitPromise = new Promise((resolve, reject) => {
                async function run() {
                    try {
                        const res = await fetch('/api/attributes', {
                            method: 'POST',
                            credentials: 'include',
                            body: JSON.stringify({ ds: datasourceId }),
                        });
                        if (!res) {
                            showError('Failed to fetch attributes: response is undefined');
                            throw new Error('Failed to fetch attributes: response is undefined');
                        }
                        if (!res.ok) {
                            showError(`Failed to fetch attributes: response is not ok: ${res.status} ${res.statusText}`);
                            throw new Error(`Failed to fetch attributes: response is not ok: ${res.status} ${res.statusText}`);
                        }
                        const { attributes, status, message } = (await res.json());
                        if (status === 'ERROR') {
                            pushLog('error', { message: 'attribute init error', error: message, dataSource: datasourceId });
                            throw new Error(message);
                        }
                        if (attributes.length === 0) {
                            throw new Error(`No attributes found for dataSource ${datasourceId}!`);
                        }
                        const pks = attributes.filter((a) => a.primary);
                        storeState.attributes[datasourceId] = attributes;
                        storeState.pkAttributes[datasourceId] = pks;
                        storeState.data[key].status = 'ok';
                        that.afterAttributeInit();
                    }
                    catch (e) {
                        clientLogger.error({ message: 'attribute init error', error: e });
                        storeState.data[key].status = 'error';
                        storeState.data[key].error = getErrorMessage(e);
                        throw e;
                    }
                }
                run()
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                    InitPromiseCache.delete(datasourceId);
                });
            });
            InitPromiseCache.set(datasourceId, previousInitPromise);
        }
        else {
            previousInitPromise = previousInitPromise
                .then(() => {
                storeState.data[key].status = 'ok';
                that.afterAttributeInit();
            })
                .catch((e) => {
                storeState.data[key].status = 'error';
                storeState.data[key].error = getErrorMessage(e);
            });
        }
        return previousInitPromise;
    };
    setAttributes = (attrs) => {
        const { datasourceId, key } = this;
        const pks = attrs.filter((a) => a.primary);
        storeState.attributes[datasourceId] = attrs;
        storeState.pkAttributes[datasourceId] = pks;
        storeState.data[key].status = 'ok';
    };
    attributes = () => {
        const { datasourceId } = this;
        return storeState.attributes[datasourceId] ?? [];
    };
    getAttribute = (attr) => {
        return (this.attributes() ?? []).find((a) => a.code === attr);
    };
    pkAttributes = () => {
        const { datasourceId } = this;
        return storeState.pkAttributes[datasourceId] ?? [];
    };
    setIsLoading = (isLoading) => {
        this.getState().isLoading = isLoading;
        updateStore(this.key, {
            datasourceId: this.datasourceId,
            alias: this.alias,
            page: this.page,
            isLoading,
        });
    };
    setIsPosting = (isPosting) => {
        this.getState().isPosting = isPosting;
        updateStore(this.key, {
            datasourceId: this.datasourceId,
            alias: this.alias,
            page: this.page,
            isPosting,
        });
    };
    setTotalRowCount = (count) => {
        this.getState().totalRowCount = count;
    };
    setStoreFilters = (filters) => {
        this.getState().storeFilters = filters;
    };
    setSmartSearchFilters = (filters) => {
        this.getState().smartSearchFilters = filters;
    };
    setHeaderFilter = (filter) => {
        const attr = keys(filter)[0];
        this.getState().draftHeaderFilters[attr] = filter[attr];
    };
    setHeaderFilters = (filters) => {
        const headerFilters = filters.reduce((acc, filter) => {
            const attr = keys(filter)[0];
            acc[attr] = filter[attr];
            return acc;
        }, {});
        this.getState().draftHeaderFilters = headerFilters;
    };
    clearHeaderFilter = (attr) => {
        delete this.getState().draftHeaderFilters[attr];
        // this.refresh();
    };
    getHeaderFilter = (attr) => {
        const val = this.getState().draftHeaderFilters[attr];
        if (val) {
            return { [attr]: val };
        }
        return undefined;
    };
    hasHeaderFilterApplied = (attr) => {
        return !!this.getState().headerFilters[attr];
    };
    isHeaderFilterDirty = (attr) => {
        const hf = this.getState().headerFilters[attr];
        const df = this.getState().draftHeaderFilters[attr];
        return !deepEqual(hf, df);
    };
    storeFilters = () => {
        return this.getState().storeFilters;
    };
    smartSearchFilters = () => {
        return this.getState().smartSearchFilters;
    };
    headerFilters = () => {
        const headerFilters = deepUnwrap(this.getState().headerFilters);
        const gridHeaderFilters = keys(headerFilters).map((attr) => {
            return { [attr]: headerFilters[attr] };
        });
        return gridHeaderFilters;
    };
    isBusy = () => {
        return this.getState().isLoading || this.getState().isPosting;
    };
    isLoading = () => {
        return this.getState().isLoading;
    };
    isPosting = () => {
        return this.getState().isPosting;
    };
    setInitialQueryFired = (bool) => {
        this.getState().initialQueryFired = bool;
        if (bool && this.getState().initialQueryFiredAt === -1) {
            this.getState().initialQueryFiredAt = Date.now();
        }
    };
    initialQueryFired = () => {
        return this.getState().initialQueryFired;
    };
    /**
     * Mark the store as needing a refresh on next mount (stale-while-revalidate pattern).
     * Unlike clearSync(), this keeps existing data visible while flagging it as stale.
     */
    setNeedsRefresh = (needsRefresh) => {
        this.getState().needsRefresh = needsRefresh;
    };
    /**
     * Check if the store needs a refresh (data is stale).
     */
    needsRefresh = () => {
        return this.getState().needsRefresh;
    };
    async executeQuery({ query = {}, noClear, force = false, handleResponse, refreshOrPagination = false, } = { query: {} }) {
        this.setInitialQueryFired(true);
        // touch();
        const { datasourceId } = this;
        if (!query.limit) {
            query.limit = this.limit;
        }
        if (!query.offset) {
            query.offset = 0;
        }
        let sort = query.sort;
        if (!sort) {
            query.sort = this.getSort();
        }
        if (this.select) {
            query.select = this.select;
        }
        // Merge default match and filters from store props
        // Normalize to new names only (server supports both)
        const queryMatch = query.match ?? query.data;
        const queryFilters = query.filters ?? query.filter;
        // Always delete deprecated properties to avoid duplicate payload
        delete query.data;
        delete query.filter;
        if (this.defaultMatch || queryMatch) {
            query.match = { ...this.defaultMatch, ...queryMatch };
        }
        // User-provided filters persisted in previousQuery; defaultFilters are re-merged on every executeQuery.
        let storeFilters = queryFilters ? [...queryFilters] : [];
        if ((this.defaultFilters && this.defaultFilters.length > 0) || storeFilters.length > 0) {
            query.filters = [...(this.defaultFilters ?? []), ...storeFilters];
        }
        if (this.preQueryCallbacks && !refreshOrPagination) {
            // apply pre query callbacks before backing up the filter to storeFilters
            // so that they are used to compare with the previous query
            this.preQueryCallbacks.forEach((callback) => {
                query = callback(query);
            });
            sort = query.sort;
            // Re-normalize after preQueryCallbacks in case they added deprecated properties
            if (query.data) {
                query.match = { ...query.match, ...query.data };
                delete query.data;
            }
            if (query.filter) {
                query.filters = [...(query.filters ?? []), ...query.filter];
                delete query.filter;
            }
            // Persist filters added by preQuery (defaultFilters are re-applied above, not stored)
            const defaultFilterCount = this.defaultFilters?.length ?? 0;
            const filtersAfterPreQuery = query.filters ?? [];
            if (filtersAfterPreQuery.length > defaultFilterCount) {
                storeFilters = filtersAfterPreQuery.slice(defaultFilterCount);
            }
        }
        const smartSearchFilters = this.getState().smartSearchFilters;
        let currentSmartFilters = '';
        if (smartSearchFilters.length) {
            const ssFilters = deepUnwrap(smartSearchFilters);
            currentSmartFilters = stringify(ssFilters) ?? '';
            // add smart search filters to the query
            query.filters = [...(query.filters ?? []), ...ssFilters];
        }
        const draftHeaderFilters = this.getState().draftHeaderFilters;
        const gridHeaderFilters = keys(draftHeaderFilters).map((attr) => {
            return { [attr]: draftHeaderFilters[attr] };
        });
        if (gridHeaderFilters.length) {
            // add grid header filters to the query
            query.filters = [...(query.filters ?? []), ...gridHeaderFilters];
        }
        const headerFilters = deepUnwrap(draftHeaderFilters);
        const headerFiltersChanged = !deepEqual(headerFilters, this.getState().headerFilters);
        this.getState().headerFilters = headerFilters;
        const pubSubProps = { query };
        await this.pubsub.pub('OnBeforeQuery', pubSubProps);
        if (pubSubProps.abortMessage) {
            showError(pubSubProps.abortMessage);
            return;
        }
        // do not include gridHeaderFilters or currentSmartFilters in previousQuery
        // as the previousQuery is reused when sorting/pagination
        // and we need to join the filters again with the latest gridHeaderFilters and currentSmartFilters
        const q = { ...query, filters: storeFilters };
        const currentQuery = stringify(q) ?? '';
        let currentCountQuery = '';
        let currentTotalRowCount;
        if (this.includeCount) {
            const { limit: _limit, offset: _offset, sort: _sort, orderBy: _orderBy, ...countQuery } = q;
            currentCountQuery = stringify(countQuery) ?? '';
            currentTotalRowCount = this.getState().totalRowCount;
        }
        if (!force &&
            currentQuery === this.previousQuery &&
            currentSmartFilters === this.previousSmartFilters &&
            !headerFiltersChanged) {
            if (clientLogger.isDebugEnabled) {
                clientLogger.debug({
                    message: 'Same query',
                    dataSource: this.datasourceId,
                    alias: this.alias,
                    currentQuery,
                    previousQuery: this.previousQuery,
                    currentSmartFilters,
                    previousSmartFilters: this.previousSmartFilters,
                });
            }
            return this.previousPromise;
        }
        if (clientLogger.isDebugEnabled) {
            clientLogger.debug({
                message: 'Query changed',
                dataSource: this.datasourceId,
                alias: this.alias,
                currentQuery,
                previousQuery: this.previousQuery,
                currentSmartFilters,
                previousSmartFilters: this.previousSmartFilters,
                headerFiltersChanged,
                force,
            });
        }
        let countQueryChanged = true;
        if (!force &&
            this.includeCount &&
            currentCountQuery === this.previousCountQuery &&
            currentSmartFilters === this.previousSmartFilters &&
            !headerFiltersChanged &&
            currentTotalRowCount !== undefined) {
            countQueryChanged = false;
        }
        else if (clientLogger.isDebugEnabled) {
            clientLogger.debug({
                message: 'Count query changed',
                dataSource: this.datasourceId,
                alias: this.alias,
                currentCountQuery,
                previousCountQuery: this.previousCountQuery,
                currentSmartFilters,
                previousSmartFilters: this.previousSmartFilters,
                headerFiltersChanged,
            });
        }
        if (clientLogger.isDebugEnabled &&
            handleResponse == null &&
            this.previousQueryTime > 0 &&
            Date.now() - this.previousQueryTime < 1000) {
            console.warn(`Query is being executed too frequently. Please reduce the number of queries. 
        This may cause performance issues. 
        DataSource: ${this.datasourceId} 
        Alias: ${this.alias}
        ${currentQuery === this.previousQuery ? `No change in query! Force: ${force}` : `Current Query: ${currentQuery} Previous Query: ${this.previousQuery}`}`);
            showWarning(`Query is being executed too frequently. Please reduce the number of queries. This may cause performance issues. DataSource: ${this.datasourceId} Alias: ${this.alias}`);
        }
        this.previousQuery = currentQuery;
        this.previousQueryTime = Date.now();
        this.previousSmartFilters = currentSmartFilters;
        if (handleResponse == null) {
            this.setIsLoading(true);
        }
        this.setStoreFilters(storeFilters); // persist the user filter so that it can be applied to smart search
        if (this.filterLocally) {
            try {
                if (this.initialQueryFired()) {
                    applyLocalFilters({ store: this, filter: query.filters, sort });
                    if (sort) {
                        this.setSort(sort);
                    }
                    this.setOffset(query.offset ?? 0);
                }
            }
            finally {
                this.setIsLoading(false);
            }
            return;
        }
        // Track this query in the loading tracker for Playwright tests
        incrementPending(`store:${this.alias}`);
        // Log to devtools (use ISO strings for human-readable export)
        const queryStartedAt = new Date().toISOString();
        const activityId = logActivity({
            type: 'store-query',
            name: `${this.datasourceId} (${this.alias})`,
            status: 'pending',
            startedAt: queryStartedAt,
        });
        this.previousPromise = new Promise((resolve, reject) => {
            const run = async () => {
                await this.init();
                const allPromises = [];
                const rowsPromise = fetchData({
                    datasourceId,
                    query,
                })
                    .then(async (res) => {
                    const cb = () => {
                        if (handleResponse) {
                            handleResponse(res);
                        }
                        else {
                            this.processServerResponse(res);
                        }
                        this.setIsLoading(false);
                    };
                    if (!noClear) {
                        await this.clearBeforeRefresh(cb);
                    }
                    else {
                        cb();
                    }
                    return res;
                })
                    .catch(async (e) => {
                    if (!this.destroyed) {
                        showError(getErrorMessage(e));
                        if (!noClear) {
                            await this.clearBeforeRefresh();
                        }
                    }
                    return [];
                })
                    .finally(() => {
                    if (!this.destroyed) {
                        this.setIsLoading(false);
                    }
                });
                allPromises.push(rowsPromise);
                if (this.includeCount) {
                    if (countQueryChanged) {
                        // Track this query in the loading tracker for Playwright tests
                        incrementPending(`store:${this.alias}:count`);
                        const countPromise = fetchData({
                            datasourceId,
                            query: { ...query, countOnly: true },
                        })
                            .catch(() => {
                            return 0;
                        })
                            .finally(() => {
                            decrementPending();
                        });
                        allPromises.push(countPromise);
                    }
                    else {
                        if (clientLogger.isDebugEnabled) {
                            clientLogger.debug({
                                message: 'Reusing count',
                                dataSource: this.datasourceId,
                                alias: this.alias,
                                currentTotalRowCount,
                            });
                        }
                        allPromises.push(Promise.resolve(currentTotalRowCount));
                    }
                }
                const [_res, count] = await Promise.all(allPromises);
                if (typeof count === 'number') {
                    this.setTotalRowCount(count);
                    if (countQueryChanged) {
                        this.previousCountQuery = currentCountQuery;
                    }
                }
            };
            run()
                .then(async () => {
                if (!this.destroyed) {
                    if (sort) {
                        this.setSort(sort);
                    }
                    this.setOffset(query.offset ?? 0);
                    // Update devtools with results
                    updateActivity(activityId, {
                        status: 'success',
                        completedAt: new Date().toISOString(),
                    });
                    updateStore(this.key, {
                        datasourceId: this.datasourceId,
                        alias: this.alias,
                        page: this.page,
                        rowCount: this.getSize(),
                        isDirty: this.isStoreDirty(),
                        dirtyRowCount: this.dirtyRows().length,
                        lastQueryAt: new Date().toISOString(),
                        rows: Object.values(this.rows()),
                        query: query,
                    });
                }
                resolve();
            })
                .catch((e) => {
                clientLogger.error({ message: 'query catch', error: e });
                updateActivity(activityId, {
                    status: 'error',
                    error: getErrorMessage(e),
                    completedAt: new Date().toISOString(),
                });
                reject(e);
            })
                .finally(() => {
                decrementPending();
            });
        });
        return this.previousPromise;
    }
    isDeletable = () => {
        return this.getState().deletable;
    };
    isUpdatable = () => {
        return this.getState().updatable;
    };
    isInsertable = () => {
        return this.getState().insertable;
    };
    isQueryable = () => {
        return this.getState().queryable;
    };
    setQueryable = (queryable) => {
        this.getState().queryable = queryable;
    };
    setInsertable = (insertable) => {
        this.getState().insertable = insertable;
    };
    setUpdatable = (updatable) => {
        this.getState().updatable = updatable;
    };
    setDeletable = (deletable) => {
        this.getState().deletable = deletable;
    };
    isReadonly = () => !this.isUpdatable() && !this.isInsertable() && !this.isDeletable();
    confirm = async () => {
        const confirmed = await confirmWithUser({
            title: 'Discard Changes?',
            content: `Are you sure you want to discard the changes made to ${this.displayName}?`,
        });
        return confirmed;
    };
    sort = async (sort) => {
        if (this.isStoreDirty() && !this.isReadonly()) {
            const confirmed = await this.confirm();
            if (!confirmed) {
                return;
            }
            this.resetStore();
        }
        if (isWaitingForSavedSearches(this)) {
            this.setSort(sort);
            return;
        }
        const query = JSON.parse(this.previousQuery || '{}');
        query.sort = sort;
        query.offset = 0;
        await this.executeQuery({ query, refreshOrPagination: true });
    };
    next = async () => {
        if (this.isStoreDirty() && !this.isReadonly()) {
            const confirmed = await this.confirm();
            if (!confirmed) {
                return;
            }
            this.resetStore();
        }
        const query = JSON.parse(this.previousQuery || '{}');
        // if (this.filterLocally && !this.ds.startsWith('__ds__')) {
        //   this.platform.showWarning(
        //     `Calling next() is not allowed on a locally filtered store! Consider increasing query limit [Store: ${this.ds}.${this.alias}]`,
        //     { appUid: this.appUid, pageId: this.pageId, itemId: this.itemId ?? '' },
        //   );
        //   return;
        // }
        const nextOffset = (query.offset || 0) + this.limit;
        query.offset = nextOffset;
        return this.executeQuery({
            query,
            noClear: true,
            refreshOrPagination: true,
        });
    };
    goToPage = async (page) => {
        const limit = this.limit;
        const totalRowCount = this.getState().totalRowCount;
        if (!totalRowCount || totalRowCount <= limit * page) {
            return Promise.resolve();
        }
        if (this.isStoreDirty() && !this.isReadonly()) {
            const confirmed = await this.confirm();
            if (!confirmed) {
                return;
            }
            this.resetStore();
        }
        const query = JSON.parse(this.previousQuery || '{}');
        // if (this.filterLocally && !this.ds.startsWith('__ds__')) {
        //   this.platform.showWarning(
        //     `Calling next() is not allowed on a locally filtered store! Consider increasing query limit [Store: ${this.ds}.${this.alias}]`,
        //     { appUid: this.appUid, pageId: this.pageId, itemId: this.itemId ?? '' },
        //   );
        //   return;
        // }
        query.offset = limit * page;
        return this.executeQuery({
            query,
            refreshOrPagination: true,
        });
    };
    getPreviousQuery = () => {
        return this.previousQuery ? JSON.parse(this.previousQuery) : undefined;
    };
    getNextOffset = () => {
        const query = this.getPreviousQuery();
        return query ? (query.offset || 0) + this.limit : 0;
    };
    setLimit = (limit) => {
        this.limit = limit;
        return this.refresh(false, limit);
    };
    refresh = async (force = true, limit) => {
        if (this.isStoreDirty() && !this.isReadonly()) {
            const confirmed = await this.confirm();
            if (!confirmed) {
                return;
            }
            this.resetStore();
        }
        const query = JSON.parse(this.previousQuery || '{}');
        query.offset = 0;
        if (limit) {
            query.limit = limit;
        }
        return this.executeQuery({ query, force, refreshOrPagination: true });
    };
    refreshRow = async (id) => {
        const pkAttributes = this.pkAttributes();
        if (pkAttributes.length === 0) {
            showError(`Store: ${this.datasourceId} (${this.alias}) has no pk attributes!`);
            return null;
        }
        const row = this.row(id);
        if (!row) {
            showError(`Row with id ${id} not found in dataSource: ${this.datasourceId} (${this.alias})!`);
            return null;
        }
        const match = {};
        for (const attr of pkAttributes) {
            const val = row[attr.code];
            if (val == null) {
                showError(`Row with id ${id} has no value for pk attribute: ${attr.code}!`);
                return null;
            }
            match[attr.code] = val;
        }
        const query = {
            match,
        };
        if (this.select && this.select.length > 0) {
            query.select = this.select;
        }
        const rows = await fetchData({
            datasourceId: this.datasourceId,
            query,
        });
        if (rows.length === 0) {
            showError(`Row with id ${id} not found in dataSource: ${this.datasourceId} (${this.alias})!`);
            return null;
        }
        if (rows.length > 1) {
            showError(`Multiple rows found for id ${id} in dataSource: ${this.datasourceId} (${this.alias})! ${JSON.stringify(query.match)}`);
            return null;
        }
        this.populateId(rows);
        const dbRow = rows[0];
        this.setRow(id, dbRow);
        return dbRow;
    };
    applyHeaderFiltersIfChanged = async () => {
        const query = JSON.parse(this.previousQuery || '{}');
        query.offset = 0;
        return this.executeQuery({ query });
    };
    clearSync = (keepCurrentRowId = false) => {
        if (clientLogger.isDebugEnabled) {
            clientLogger.debug({
                message: 'Clearing store sync',
                dataSource: this.datasourceId,
                alias: this.alias,
            });
        }
        this.deSelectAll();
        this.setRowIds([]);
        this.setOriginalRowIds([]);
        this.setRows({});
        this.setTotalRowCount(0);
        if (!keepCurrentRowId) {
            this.setCurrentRowIdSync('');
        }
        this.previousQuery = '';
        this.previousPromise = undefined;
    };
    clearBeforeRefresh = async (cb) => {
        if (clientLogger.isDebugEnabled) {
            clientLogger.debug({
                message: 'Clearing store',
                dataSource: this.datasourceId,
                alias: this.alias,
            });
        }
        this.deSelectAll();
        this.setRowIds([]);
        this.setOriginalRowIds([]);
        this.setRows({});
        this.setTotalRowCount(0);
        // do not clear currentRowId on refresh, to avoid losing the current record
        // this.setCurrentRowId('');
        cb?.();
        await this.pubsub.pub('OnStoreClear', undefined);
    };
    clear = async () => {
        await this.clearBeforeRefresh(() => {
            this.previousQuery = '';
            this.previousPromise = undefined;
            this.setCurrentRowIdSync('');
        });
    };
    clearCache = async () => {
        await this.clear();
    };
    setSort = (sort) => {
        this.getState().sort = sort;
    };
    setOffset = (offset) => {
        this.getState().offset = offset;
    };
    getOffset = () => {
        return this.getState().offset;
    };
    getSort = () => {
        return this.getState().sort;
    };
    rowIds = () => {
        return this.getState().rowIds;
    };
    forEach = (fn) => {
        this.rowIds().forEach((rowId, index) => {
            fn(this.row(rowId), rowId, index);
        });
    };
    find = (fn) => {
        const rowIds = this.rowIds();
        for (let index = 0; index < rowIds.length; index++) {
            const rowId = rowIds[index];
            const row = this.row(rowId);
            if (fn(row, rowId, index)) {
                return row;
            }
        }
        return undefined;
    };
    rowIdAtIndex = (index) => {
        return this.getState().rowIds[index];
    };
    setRowIds = (rowIds) => {
        this.getState().rowIds = rowIds;
    };
    originalRowsIds = () => {
        return this.getState().originalRowIds;
    };
    setOriginalRowIds = (originalRowIds) => {
        this.getState().originalRowIds = originalRowIds;
    };
    setRows = (rows) => {
        this.getState().rows = rows;
    };
    setRow = (id, row) => {
        this.getState().rows[id] = row;
    };
    setOriginalRows = (rows) => {
        this.getState().originalRows = rows;
    };
    row = (id) => {
        const row = this.getState().rows[id];
        if (!row) {
            clientLogger.error({
                message: 'Row not found',
                rowIds: deepUnwrap(this.rowIds()),
                rows: deepUnwrap(this.rows()),
                row,
                rowId: id,
            });
            throw new Error(`Row with id ${id} not found in dataSource: ${this.datasourceId} (${this.alias})!`);
        }
        return row;
    };
    dbRow = (id) => {
        return this.row(id);
    };
    status = () => {
        return this.getState().status;
    };
    error = () => {
        return this.getState().error;
    };
    rows = () => {
        return this.getState().rows;
    };
    list = () => {
        if (this.status() === 'ok') {
            return this.rowIds().map(this.row);
        }
        return EMPTY_ARRAY;
    };
    dbList = () => {
        if (this.status() === 'ok') {
            return this.rowIds().map(this.row);
        }
        return EMPTY_ARRAY;
    };
    currentRowId = () => {
        return this.getState().currentRowId;
    };
    currentRow = () => {
        const id = this.currentRowId();
        if (!id)
            return undefined;
        return this.row(id);
    };
    currentRowErrorIfNull = () => {
        const id = this.currentRowId();
        if (!id)
            throw new Error(`currentRowId is null!`);
        const row = this.row(id);
        if (!row)
            throw new Error(`currentRow is null!`);
        return row;
    };
    currentDBRowErrorIfNull = () => {
        const id = this.currentRowId();
        if (!id)
            throw new Error(`currentRowId is null!`);
        const row = this.row(id);
        if (!row)
            throw new Error(`currentRow is null!`);
        return row;
    };
    isRowFromDB = (id) => {
        if (!id)
            return false;
        return isFromDB(this.row(id));
    };
    isCurrentRowFromDB = () => {
        const id = this.currentRowId();
        return this.isRowFromDB(id);
    };
    /**
     * Internal sync version — sets currentRowId and fires OnRecordActive.
     * No dirty check, no OnBeforeRecordActive veto. Child stores react via OnRecordActive subscriber.
     * Use for programmatic state changes (clear, reset, delete, query refresh, bulk ops).
     */
    setCurrentRowIdSync = (currentRowId, replaced = false) => {
        if (currentRowId === this.getState().currentRowId)
            return;
        const previousId = this.getState().currentRowId;
        this.getState().currentRowId = currentRowId;
        if (!replaced) {
            this.pubsub.pub('OnRecordActive', { id: currentRowId, previousId });
        }
    };
    /**
     * Public async version — for user-initiated navigation (row clicks, edit, createNew).
     * Checks child store dirty state, fires OnBeforeRecordActive for external veto,
     * then commits the change. Returns false if prevented.
     */
    setCurrentRowId = async (currentRowId) => {
        if (currentRowId === this.getState().currentRowId) {
            return true;
        }
        for (const entry of this._childStoreEntries) {
            if (entry.config.store.isStoreDirty()) {
                const confirmed = await confirmWithUser({
                    title: 'Unsaved Changes',
                    content: `You have unsaved changes in ${entry.config.store.displayName}. Discard them?`,
                });
                if (!confirmed) {
                    return false;
                }
            }
        }
        const previousId = this.getState().currentRowId;
        const props = { id: currentRowId, previousId, prevented: false };
        await this.pubsub.pub('OnBeforeRecordActive', props);
        if (props.prevented) {
            return false;
        }
        this.getState().currentRowId = currentRowId;
        this.pubsub.pub('OnRecordActive', { id: currentRowId, previousId });
        return true;
    };
    sub = (event, listener) => {
        if (event === 'OnRecordActive') {
            const currentRowId = this.currentRowId();
            if (currentRowId) {
                const immediateListener = () => listener(event, {
                    id: currentRowId,
                    previousId: undefined,
                });
                setTimeout(immediateListener, 1);
            }
        }
        return this.pubsub.sub(event, listener);
    };
    setCurrentRow = async (row) => {
        return this.setCurrentRowId(this.rowId(row));
    };
    rowId = (row) => {
        return row._id ?? row._cid ?? 'MISSING_ROW_ID';
    };
    setRowStatus = (id, status) => {
        this.getState().rows[id]._status = status;
    };
    rowStatus = (id) => {
        return this.getState().rows[id]._status ?? 'Q';
    };
    setOriginalRow = (id, row) => {
        this.getState().originalRows[id] = row;
    };
    removeOriginalRow = (id) => {
        delete this.getState().originalRows[id];
    };
    originalRow = (id) => {
        return this.getState().originalRows[id];
    };
    originalRows = () => {
        return this.getState().originalRows;
    };
    resetRow = (id) => {
        let originalRow = this.originalRow(id);
        if (originalRow) {
            originalRow = { ...deepUnwrap(originalRow) };
            this.getState().rows[id] = originalRow;
            delete this.getState().originalRows[id];
        }
        else if (!isFromDB(this.row(id))) {
            // if the row is not in the original rows, it means it's a new row
            // we need to delete it from the rows
            this.getState().rowIds = this.getState().rowIds.filter((_id) => _id !== id);
            delete this.getState().rows[id];
            if (this.currentRowId() === id) {
                this.setCurrentRowIdSync(this.getState().rowIds[0]);
            }
        }
    };
    resetStore() {
        // Reset child stores first
        for (const entry of this._childStoreEntries) {
            entry.config.store.resetStore();
        }
        if (this.isStoreDirty() || this.hasNewRows()) {
            const id = this.currentRowId();
            const records = { ...this.rows() };
            const _originalRecords = this.originalRows();
            keys(_originalRecords).forEach((_id) => {
                records[_id] = _originalRecords[_id];
            });
            keys(records).forEach((_id) => {
                if ((records[_id]._status ?? 'Q') !== 'Q') {
                    delete records[_id];
                }
            });
            this.setRows(records);
            const currentOrder = this.rowIds().filter((_id) => !!records[_id]);
            const extraRecordIds = keys(records).filter((_id) => currentOrder.indexOf(_id) === -1);
            const recordsOrder = [...currentOrder, ...extraRecordIds];
            if (recordsOrder.length) {
                this.setRowIds(recordsOrder);
                if (!(id && records[id])) {
                    this.setCurrentRowIdSync(recordsOrder[0]);
                }
            }
            else {
                this.setRowIds([]);
                this.setCurrentRowIdSync('');
            }
            this.setOriginalRows({});
        }
    }
    deleteRow = async (id) => {
        const targetRow = this.row(id);
        if (isFromDB(targetRow) && !this.localStore) {
            let originalRow = this.originalRow(id);
            if (!originalRow) {
                // it's the first time this row is being updated...
                originalRow = deepUnwrap(targetRow);
                this.setOriginalRow(id, originalRow);
            }
            this.setRowStatus(id, 'D');
        }
        else {
            this.deleteFromStore(id);
        }
        delete this.getState().fieldErrors[id];
    };
    deleteFromStore = (id) => {
        const rowIds = [...this.rowIds()];
        const index = rowIds.indexOf(id);
        if (index === -1) {
            throw new Error(`Cannot delete row with id ${id} because it does not exist`);
        }
        rowIds.splice(index, 1);
        this.setRowIds(rowIds);
        delete this.getState().rows[id];
        delete this.getState().originalRows[id];
        this.deSelectRow(id);
        const idVal = rowIds[index] ?? rowIds[rowIds.length];
        if (!isEmpty(idVal)) {
            this.setCurrentRowIdSync(idVal);
        }
        else {
            this.setCurrentRowIdSync(undefined);
        }
    };
    populateId(rows) {
        const pkAttributes = this.pkAttributes();
        rows.forEach((r) => {
            if (!r._id) {
                r._id = this._getPrimaryKeySync(pkAttributes, r);
            }
        });
    }
    processServerResponse(rows) {
        const _rowIds = [];
        const _rows = {};
        const pkAttributes = this.pkAttributes();
        const existingRowIds = this.rowIds();
        for (let i = 0; i < rows.length; i++) {
            const cr = rows[i];
            cr._id = this._getPrimaryKeySync(pkAttributes, cr);
            if (_rows[cr._id] || existingRowIds.includes(cr._id)) {
                showError(`Duplicate primary key value '${cr._id}' found in dataSource '${this.datasourceId}' with alias '${this.alias}'! Make sure to choose the right combination of primary keys that are unique!.`);
            }
            _rows[cr._id] = cr;
            _rowIds.push(cr._id);
        }
        if (this.reverse) {
            _rowIds.reverse();
        }
        this.setRows({
            ...this.getState().rows,
            ..._rows,
        });
        // this.setOriginalRecords({ ...this.originalRecords(), ...records });
        this.addNewRowIds(_rowIds, rows);
        this.getState().hasMoreRows = _rowIds.length >= this.limit;
        let currentRowId = this.currentRowId();
        if (currentRowId && this.rowIds().indexOf(currentRowId) === -1) {
            currentRowId = '';
        }
        currentRowId = currentRowId || this.rowIds()[0];
        this.setCurrentRowIdSync(currentRowId);
    }
    addNewRowIds = (rowIds, _rows) => {
        if (this.reverse) {
            this.setRowIds([...rowIds, ...this.rowIds()]);
            this.setOriginalRowIds([...rowIds, ...this.originalRowsIds()]);
        }
        else {
            this.setRowIds([...this.rowIds(), ...rowIds]);
            this.setOriginalRowIds([...this.originalRowsIds(), ...rowIds]);
        }
    };
    hasMoreRows = () => {
        return this.getState().hasMoreRows;
    };
    counter = 0;
    newRecordID = () => {
        return `r${++this.counter}`;
    };
    async createNew({ partialRecord = {}, addOnTop = true, addAfter, cid, status = 'I', } = {}) {
        await this.init();
        const defaultValues = {
            ...partialRecord,
        };
        let dbRow = false;
        if (status === 'Q' || status === 'U') {
            dbRow = true;
        }
        const _cid = cid ||
            (status === 'Q' || status === 'U'
                ? this._getPrimaryKeySync(this.pkAttributes(), defaultValues)
                : this._getPrimaryKeySync(this.pkAttributes(), defaultValues));
        const _status = status || 'I';
        const newRec = {
            ...defaultValues,
            [dbRow ? '_id' : '_cid']: _cid,
            _status,
        };
        await this.pubsub.pub('OnCreateNewRecord', {
            id: _cid,
            record: newRec,
        });
        this.setRow(_cid, newRec);
        let rowIds = this.rowIds();
        // do not insert if the _cid already exists
        // this happens sometime during comment creation
        if (!rowIds.includes(_cid)) {
            if (addAfter) {
                const index = rowIds.indexOf(addAfter);
                if (index === -1) {
                    throw new Error(`Cannot add record after ${addAfter} because it does not exist`);
                }
                rowIds = [...rowIds.slice(0, index + 1), _cid, ...rowIds.slice(index + 1)];
            }
            else {
                rowIds = addOnTop ? [_cid, ...rowIds] : [...rowIds, _cid];
            }
            this.setRowIds(rowIds);
        }
        const accepted = await this.setCurrentRowId(_cid);
        if (!accepted)
            return undefined;
        return _cid;
    }
    getRowsToPost = (dirtyRows) => {
        const rows = dirtyRows.map((record) => {
            const rec = deepUnwrap(record);
            if (rec?._status === 'U' && rec._orig) {
                rec._changedAttributes = { ...rec._orig };
            }
            rec._orig = undefined;
            rec._newKeys = undefined;
            return rec;
        });
        // Add _$select metadata to first row if select is defined (for partial updates)
        if (this.select && rows.length > 0) {
            rows[0]._$select = this.select;
        }
        return rows;
    };
    dirtyRows = () => {
        const dirtyRows = this.list().filter((record) => (record._status ?? 'Q') !== 'Q' && record._status !== 'N');
        return dirtyRows;
    };
    hasDirtyRows = () => {
        const dirtyRow = this.find((row) => (row._status ?? 'Q') !== 'Q' && row._status !== 'N');
        return !!dirtyRow;
    };
    hasNewRows = () => {
        const newRow = this.list().find((r) => r._status === 'N');
        return !!newRow;
    };
    isStoreDirty = () => {
        if (!isEmptyObject(this.originalRows())) {
            return true;
        }
        if (this.hasDirtyRows()) {
            return true;
        }
        // Check registered child stores
        for (const entry of this._childStoreEntries) {
            if (entry.config.store.isStoreDirty()) {
                return true;
            }
        }
        return false;
    };
    isRowDirty = (id) => {
        return !!this.originalRow(id);
    };
    isRowAttributeDirty = (id, attr) => {
        const _orig = this.originalRow(id);
        if (!_orig)
            return false;
        const originalVal = _orig[attr];
        const currentVal = this.row(id)?.[attr];
        if (isEmpty(originalVal) && isEmpty(currentVal))
            return false;
        return originalVal !== currentVal;
    };
    // row update related methods
    processUpdateRow = (id, partialRecord, skipDirty = false) => {
        let _currentRecord = this.row(id);
        if (isFromDB(_currentRecord)) {
            let originalRecord = this.originalRow(id);
            if (!originalRecord) {
                // no originalRecord means... it's the first time this record is being updated...
                originalRecord = deepUnwrap(_currentRecord);
                this.setOriginalRow(id, originalRecord);
            }
            const currentRecord = { ...deepUnwrap(_currentRecord) };
            let _orig = currentRecord._orig ? currentRecord._orig : {};
            const _newKeys = currentRecord._newKeys ? [...currentRecord._newKeys] : [];
            keys(partialRecord).forEach((key) => {
                const newVal = partialRecord[key];
                const oldVal = currentRecord[key];
                if (!areEqualShallow(oldVal, newVal)) {
                    if (!skipDirty) {
                        if (!Object.hasOwn(_orig, key)) {
                            _orig = { ..._orig, [key]: oldVal ?? null };
                            if (oldVal === undefined) {
                                _newKeys.push(key);
                            }
                        }
                        else if (originalRecord &&
                            (areEqualShallow(originalRecord[key], newVal) || (originalRecord[key] === undefined && isEmpty(newVal)))) {
                            _orig = { ..._orig, [key]: undefined };
                            const index = _newKeys.indexOf(key);
                            if (index !== -1) {
                                _newKeys.splice(index, 1);
                            }
                        }
                    }
                    // @ts-expect-error newVal
                    currentRecord[key] = newVal;
                }
            });
            if (keys(_orig).filter((key) => _orig[key] !== undefined).length === 0) {
                currentRecord._orig = undefined;
                currentRecord._status = originalRecord._status;
                delete this.getState().originalRows[id];
            }
            else {
                currentRecord._orig = _orig;
                currentRecord._status = 'U';
            }
            if (_newKeys.length) {
                currentRecord._newKeys = _newKeys;
            }
            else {
                currentRecord._newKeys = undefined;
            }
            _currentRecord = currentRecord;
        }
        else {
            _currentRecord = {
                ..._currentRecord,
                ...partialRecord,
                _status: 'I',
            };
        }
        return _currentRecord;
    };
    updateRow = (id, partialRecord, skipDirty = false) => {
        this.setRow(id, this.processUpdateRow(id, partialRecord, skipDirty));
    };
    setValue = (key, value, rowId) => {
        const id = rowId ?? this.currentRowId();
        if (!id) {
            showError(`Cannot set value for '${key}'! Missing current row in store ${this.displayName}!`);
            throw new Error(`currentRowId is null!`);
        }
        this.updateRow(id, { [key]: value });
    };
    getValue = (key, rowIndex = -1) => {
        let id;
        if (rowIndex > -1) {
            id = this.rowIdAtIndex(rowIndex);
        }
        else {
            id = this.currentRowId();
        }
        return this.getRowValue(id, key);
    };
    getRowValue = (id, key) => {
        if (this.status() !== 'ok')
            return undefined;
        if (!id)
            return undefined;
        return this.row(id)[key];
    };
    // row selection related methods
    selectedRowIds = () => {
        return keys(this.getState().selected ?? EMPTY_OBJECT);
    };
    selectedRowsSize = () => {
        return this.selectedRowIds().length;
    };
    selectedRows = () => {
        if (this.status() === 'ok') {
            return this.selectedRowIds().map(this.row);
        }
        return EMPTY_ARRAY;
    };
    selectRow = (id) => {
        this.getState().selected[id] = true;
    };
    selectRows = (ids) => {
        const selection = {
            ...this.getState().selected,
        };
        ids.forEach((id) => {
            selection[id] = true;
        });
        this.getState().selected = selection;
    };
    isSelected = (id) => {
        return !!this.getState().selected[id];
    };
    hasRow = (id) => {
        return this.rowIds().includes(id);
    };
    deSelectRow = (id) => {
        delete this.getState().selected[id];
    };
    deSelectAll = () => {
        this.getState().selected = {};
    };
    selectAll = () => {
        const ids = this.rowIds();
        const selection = ids.reduce((map, id) => {
            map[id] = true;
            return map;
        }, {});
        this.getState().selected = selection;
    };
    // errors related methods
    setError = ({ attribute, rowId, errorMessage, source = 'Controller', }) => {
        if (attribute && rowId) {
            if (isEmpty(errorMessage)) {
                this.clearError({ attribute, rowId, source });
            }
            else {
                if (!this.getState().fieldErrors[rowId]) {
                    this.getState().fieldErrors[rowId] = {};
                }
                const err = this.getError(attribute, rowId);
                if (err) {
                    this.getState().fieldErrors[rowId][attribute] = {
                        ...err,
                        [source]: errorMessage,
                    };
                }
                else {
                    this.getState().fieldErrors[rowId][attribute] = {
                        [source]: errorMessage,
                    };
                }
            }
        }
    };
    clearError = ({ attribute, rowId, source = 'Controller', }) => {
        if (rowId && attribute && source) {
            const err = this.getError(attribute, rowId);
            if (err?.[source]) {
                delete this.getState().fieldErrors[rowId][attribute];
            }
        }
    };
    clearAllErrors = () => {
        this.getState().fieldErrors = {};
    };
    getError = (attribute, id) => {
        return this.getState().fieldErrors[id]?.[attribute];
    };
    getAllErrors = () => {
        const errors = this.getState().fieldErrors;
        const recordIds = this.rowIds();
        const messages = [];
        keys(errors).forEach((rId) => {
            const index = recordIds.indexOf(rId);
            if (index !== -1) {
                const msg = [];
                keys(errors[rId]).forEach((attr) => {
                    Object.values(errors[rId]?.[attr] ?? {}).forEach((m) => {
                        msg.push(m ?? '');
                    });
                });
                if (msg.length) {
                    messages.push(`Row ${index + 1}: ${msg.join(', ')}`);
                }
            }
        });
        return messages.join('\n');
    };
    hasError = (attribute, id) => {
        return !!this.getError(attribute, id);
    };
    hasErrors = () => {
        const errorMap = this.getState().fieldErrors;
        const errors = errorMap &&
            keys(errorMap).filter((key) => {
                return keys(errorMap[key]).length > 0;
            });
        return errors && errors.length > 0;
    };
    getSize = () => {
        return this.rowIds().length;
    };
    replaceClientId = (clientId, newId, postedServerRecord, originalRecord) => {
        const recordsOrder = updateValue(this.rowIds(), clientId, newId);
        this.setRowIds(recordsOrder);
        if (this.isSelected(clientId)) {
            this.deSelectRow(clientId);
            this.selectRow(newId);
        }
        const newRecords = replaceKeyAndValue(clientId, newId, postedServerRecord, this.rows());
        this.setRows(newRecords);
        if (this.currentRowId() === clientId) {
            this.setCurrentRowIdSync(newId, true);
        }
        // to handle insert case when server delay and user has changed value before receiving res
        if (postedServerRecord._status === 'U' && originalRecord) {
            const newOriginalRecords = replaceKeyAndValue(clientId, newId, originalRecord, this.originalRows());
            this.setOriginalRows(newOriginalRecords);
        }
    };
    save = async ({ silent = false, feedback = this.feedback, batchCallback, cancelBatch, } = { silent: false }) => {
        touch();
        if (this.transient) {
            showError(`Transient Store [${this.alias}] cannot be saved!`);
            cancelBatch?.();
            return false;
        }
        if (this.isBusy()) {
            showError(`[${this.datasourceId}][${this.alias}] Store is busy... try again later!`);
            cancelBatch?.();
            return false;
        }
        const dirtyRecords = this.dirtyRows().filter((r) => r._status !== 'N');
        const hasChildDirty = this._childStoreEntries.some((e) => e.config.store.isStoreDirty());
        if (dirtyRecords.length === 0 && !hasChildDirty) {
            if (!silent)
                showWarning('No changes to post!');
            batchCallback?.();
            return false;
        }
        // If only child stores are dirty (parent has no changes), skip parent POST
        // but still cascade to children
        if (dirtyRecords.length === 0 && hasChildDirty) {
            const parentId = this.currentRowId();
            const parentRow = parentId ? this.row(parentId) : undefined;
            if (parentRow && parentId) {
                for (const entry of this._childStoreEntries) {
                    const childStore = entry.config.store;
                    const childRows = childStore.list();
                    for (const childRow of childRows) {
                        const childRowId = childRow._id ?? childRow._cid;
                        if (!childRowId)
                            continue;
                        for (const [childField, parentField] of Object.entries(entry.config.fieldMapping)) {
                            if (!parentField)
                                continue;
                            const parentValue = parentRow[parentField];
                            const childValue = childRow[childField];
                            if (childValue !== parentValue) {
                                childStore.setValue(childField, parentValue, childRowId);
                            }
                        }
                    }
                    if (childStore.isStoreDirty()) {
                        const childResult = await childStore.save({ feedback: feedback === 'NONE' ? 'NONE' : undefined });
                        if (!childResult) {
                            clientLogger.error({ message: `Child store [${childStore.alias}] save failed` });
                            return false;
                        }
                    }
                }
            }
            batchCallback?.();
            return true;
        }
        if (this.hasErrors()) {
            showError(`You must resolve all the validation errors before submitting it.

${this.getAllErrors()}
`);
            cancelBatch?.();
            return false;
        }
        // if (Logger.isLogEnabled()) {
        //   Logger.log({
        //     itemType: this.ds,
        //     itemId: this.itemId,
        //     status: 'info',
        //     msg: `Posting dirty rows: ${stringify(this.getDirtyRecordsForLog())}`,
        //   });
        // }
        this.setIsPosting(true);
        // Log to devtools (use ISO strings for human-readable export)
        const saveStartedAt = new Date().toISOString();
        const activityId = logActivity({
            type: 'store-save',
            name: `${this.datasourceId} (${this.alias})`,
            params: [{ rowCount: dirtyRecords.length }],
            status: 'pending',
            startedAt: saveStartedAt,
        });
        try {
            await this.init();
            const { datasourceId } = this;
            const rows = this.getRowsToPost(dirtyRecords);
            const request = {
                datasourceId,
                rows,
            };
            await this.pubsub.pub('OnBeforePost', { request });
            const responseData = await postData({
                rows,
                datasourceId,
            });
            if (dirtyRecords.length > 20 &&
                !dirtyRecords.find((r) => r._status !== 'I') &&
                dirtyRecords.length === this.getSize() &&
                dirtyRecords.length === responseData.length) {
                // all records are new and we have the same number of records in the response as we sent
                // so we can assume that the response is in the same order as the request
                // and we can replace the records in the store with the response
                // this is a performance optimization - bulk upload case
                await this.clearBeforeRefresh(() => this.processServerResponse(responseData));
            }
            else {
                this.populateId(responseData);
                dirtyRecords.forEach((dirtyRecord) => {
                    const id = dirtyRecord._cid || dirtyRecord._id;
                    if (id) {
                        const currentRecord = this.row(id);
                        if (dirtyRecord._status === 'D') {
                            this.deleteFromStore(id);
                        }
                        else {
                            const postedServerRecord = responseData.find((record) => {
                                return (record._cid && record._cid === id) || (record._id && record._id === id);
                            });
                            const clientId = postedServerRecord._cid;
                            const newId = postedServerRecord._id;
                            postedServerRecord._cid = undefined;
                            if (dirtyRecord === currentRecord) {
                                if (dirtyRecord._cid && newId && clientId) {
                                    this.replaceClientId(clientId, newId, postedServerRecord);
                                }
                                else {
                                    this.setRow(id, postedServerRecord);
                                    this.removeOriginalRow(id);
                                }
                            }
                            else {
                                // user has changed data after hitting save btn before receiving server response
                                const newRecord = { ...postedServerRecord };
                                const _orig = currentRecord._orig;
                                if (_orig) {
                                    newRecord._orig = { ..._orig };
                                    keys(_orig).forEach((key) => {
                                        if (newRecord[key] !== currentRecord[key]) {
                                            newRecord._status = 'U';
                                            // @ts-expect-error key is of type keyof T
                                            newRecord[key] = currentRecord[key];
                                            if (newRecord._orig) {
                                                newRecord._orig[key] = postedServerRecord[key];
                                            }
                                        }
                                    });
                                    this.setRow(id, newRecord);
                                    this.setOriginalRow(id, postedServerRecord);
                                }
                                if (dirtyRecord._status === 'I') {
                                    newRecord._orig = {};
                                    keys(dirtyRecord).forEach((key) => {
                                        if (dirtyRecord[key] !== currentRecord[key]) {
                                            newRecord._status = 'U';
                                            // @ts-expect-error key is of type keyof T
                                            newRecord[key] = currentRecord[key];
                                            if (newRecord._orig) {
                                                newRecord._orig[key] = postedServerRecord[key];
                                            }
                                        }
                                    });
                                    if (clientId && newId && newRecord) {
                                        this.replaceClientId(clientId, newId, newRecord, postedServerRecord);
                                    }
                                }
                            }
                        }
                    }
                });
            }
            if (this.includeCount) {
                const currentTotal = this.getState().totalRowCount;
                if (currentTotal !== undefined) {
                    const deleteCount = dirtyRecords.filter((record) => record._status === 'D').length;
                    const insertCount = dirtyRecords.filter((record) => record._status === 'I').length;
                    const delta = insertCount - deleteCount;
                    if (delta !== 0) {
                        this.setTotalRowCount(Math.max(0, currentTotal + delta));
                    }
                }
            }
            if (feedback !== 'NONE') {
                const msg = feedback
                    ? feedback.replace('#{count}', `${responseData.length}`)
                    : `${responseData.length} row${responseData.length === 1 ? '' : 's'} posted`;
                showSuccess(msg);
            }
            // Update devtools
            updateActivity(activityId, {
                status: 'success',
                completedAt: new Date().toISOString(),
            });
            updateStore(this.key, {
                datasourceId: this.datasourceId,
                alias: this.alias,
                page: this.page,
                rowCount: this.getSize(),
                isDirty: this.isStoreDirty(),
                dirtyRowCount: this.dirtyRows().length,
                lastSaveAt: new Date().toISOString(),
            });
            // Publish change event for same-tab autoRefresh stores
            // (cross-tab/cross-user SSE is published by postDataSource on the server)
            const hasInserts = dirtyRecords.some((r) => r._status === 'I');
            const hasUpdates = dirtyRecords.some((r) => r._status === 'U');
            const hasDeletes = dirtyRecords.some((r) => r._status === 'D');
            const action = (hasInserts && hasUpdates) || (hasInserts && hasDeletes) || (hasUpdates && hasDeletes)
                ? 'mixed'
                : hasInserts
                    ? 'insert'
                    : hasUpdates
                        ? 'update'
                        : 'delete';
            globalPubSub.pub('OnDataSourceChange', {
                datasourceId: this.datasourceId,
                sourceStoreKey: this.key,
                action,
            });
            // Invalidate queries if configured
            if (this.invalidateOnSave && this.invalidateOnSave.length > 0) {
                invalidateQueries(this.invalidateOnSave);
            }
            // Invalidate other stores if configured
            if (this.invalidateStoresOnSave && this.invalidateStoresOnSave.length > 0) {
                globalPubSub.pub('OnStoreInvalidate', {
                    identifiers: this.invalidateStoresOnSave,
                    sourceStoreKey: this.key,
                });
            }
            // Cascade save to registered child stores
            if (this._childStoreEntries.length > 0) {
                const parentId = this.currentRowId();
                const parentRow = parentId ? this.row(parentId) : undefined;
                if (parentRow && parentId) {
                    for (const entry of this._childStoreEntries) {
                        const childStore = entry.config.store;
                        const childRows = childStore.list();
                        // Populate FK fields from parent row on ALL child rows
                        for (const childRow of childRows) {
                            const childRowId = childRow._id ?? childRow._cid;
                            if (!childRowId)
                                continue;
                            for (const [childField, parentField] of Object.entries(entry.config.fieldMapping)) {
                                if (!parentField)
                                    continue;
                                const parentValue = parentRow[parentField];
                                const childValue = childRow[childField];
                                if (childValue !== parentValue) {
                                    childStore.setValue(childField, parentValue, childRowId);
                                }
                            }
                        }
                        // Save child if it has dirty rows
                        if (childStore.isStoreDirty()) {
                            const childResult = await childStore.save({ feedback: 'NONE' });
                            if (!childResult) {
                                clientLogger.error({
                                    message: `Child store [${childStore.alias}] save failed after parent save`,
                                });
                            }
                        }
                    }
                }
            }
            return true;
        }
        catch (e) {
            if (!(e instanceof AbortError)) {
                clientLogger.error({ message: 'post error', error: e });
                showError(`Unexpected error while posting data: ${getErrorMessage(e)}`);
            }
            // Update devtools
            updateActivity(activityId, {
                status: 'error',
                error: getErrorMessage(e),
                completedAt: new Date().toISOString(),
            });
            return false;
        }
        finally {
            this.setIsPosting(false);
        }
    };
    deleteSelectedRecords = async () => {
        const records = this.selectedRowIds();
        const all = [];
        for (let i = 0; i < records.length; i++) {
            all.push(this.deleteRow(records[i]));
        }
        if (all.length) {
            await Promise.all(all);
        }
    };
    copyRecord = async (targetStore, createAsNew, addAfter) => {
        const sourceRecord = this.currentRow();
        const targetRecord = targetStore.currentRow();
        if (!sourceRecord)
            return;
        if (!targetStore)
            return;
        if (!(targetRecord || createAsNew))
            return;
        const row = {};
        await targetStore.init();
        const primaryKeyAttributes = targetStore.pkAttributes();
        const primaryAttributesCodes = primaryKeyAttributes.map((attribute) => attribute.code);
        const targetAttributes = targetStore.attributes();
        const targetAttributeCodes = targetAttributes.map((attribute) => attribute.code);
        keys(sourceRecord).forEach(async (key) => {
            if (targetAttributeCodes.includes(key)) {
                if (!(EXCLUDE_ATTRIBUTES.includes(key) || primaryAttributesCodes.includes(key))) {
                    // @ts-expect-error key is of type keyof T
                    row[key] = sourceRecord[key];
                }
            }
        });
        if (createAsNew) {
            await targetStore.createNew({
                partialRecord: row,
                status: 'I',
                addAfter,
            });
        }
        else {
            const targetRecordId = targetStore.currentRowId();
            if (targetRecordId)
                targetStore.updateRow(targetRecordId, row);
        }
    };
    insertBulk = async (rows, insertOnTop = false) => {
        const newOrder = [];
        const newRows = rows.reduce((m, r) => {
            let id = this.rowId(r);
            if (id === 'MISSING_ROW_ID') {
                id = this.newRecordID();
            }
            newOrder.push(id);
            const row = { ...r, _cid: id, _status: r._status ?? 'I' };
            m[id] = row;
            return m;
        }, {});
        const order = this.rowIds();
        this.setRows({ ...this.rows(), ...newRows });
        this.setRowIds(insertOnTop ? [...newOrder, ...order] : [...order, ...newOrder]);
        this.setCurrentRowIdSync(newOrder[0]);
    };
    createNewBulk = async (rows, insertOnTopOrAfter = false) => {
        const newOrder = [];
        const newRows = rows.reduce((m, r) => {
            const _cid = this.newRecordID();
            newOrder.push(_cid);
            const row = {
                ...r,
                _status: 'I',
                _cid,
                _id: undefined,
                _orig: undefined,
                _newKeys: undefined,
                _ca: undefined,
                _ov: undefined,
            };
            m[_cid] = row;
            return m;
        }, {});
        const order = this.rowIds();
        this.setRows({ ...this.rows(), ...newRows });
        if (typeof insertOnTopOrAfter === 'string') {
            const index = order.indexOf(insertOnTopOrAfter);
            if (index !== -1) {
                this.setRowIds([...order.slice(0, index + 1), ...newOrder, ...order.slice(index + 1)]);
            }
            else {
                this.setRowIds([...order, ...newOrder]);
            }
        }
        else {
            this.setRowIds(insertOnTopOrAfter ? [...newOrder, ...order] : [...order, ...newOrder]);
        }
        this.setCurrentRowIdSync(newOrder[0]);
    };
}
const replaceKeyAndValue = (oldKey, newKey, newValue, o) => {
    const _obj = { ...o };
    delete _obj[oldKey];
    _obj[newKey] = newValue;
    return _obj;
};
const updateValue = (a, oldValue, newValue) => {
    const _a = [...a];
    const index = _a.indexOf(oldValue);
    if (index !== -1) {
        _a[index] = newValue;
    }
    return _a;
};
async function fetchData({ datasourceId, query, }) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        headers['X-Track-Id'] = getTrackId();
        applyHeaderModifiers(headers);
        const response = await fetch(`/api/ds`, {
            credentials: 'include',
            method: 'POST',
            headers,
            body: stringify({
                ds: datasourceId,
                query,
                debug,
            }),
        });
        if (!response) {
            pushLog('error', { message: 'fetch data error', error: 'missing response', dataSource: datasourceId, query });
            showError('Failed to fetch data: response is undefined');
            return [];
        }
        if (!response.ok) {
            pushLog('error', { message: 'fetch data error', error: response.statusText, dataSource: datasourceId, query });
            showError(`Failed to fetch data: response is not ok: ${response.status} ${response.statusText}`);
            return [];
        }
        const resp = await response.json();
        if (isErrorResponse(resp)) {
            pushLog('error', { message: 'fetch data error', error: resp.message, dataSource: datasourceId, query });
            showError(resp.message ?? 'Unknown error');
            return [];
        }
        const { rows, count } = resp;
        return query.countOnly ? count : rows;
    }
    catch (e) {
        if (e instanceof AbortError) {
            return [];
        }
        throw e;
    }
}
async function postData({ rows, datasourceId, }) {
    const headers = {
        'Content-Type': 'application/json',
    };
    headers['X-Track-Id'] = getTrackId();
    applyHeaderModifiers(headers);
    const response = await fetch(`/api/ds`, {
        credentials: 'include',
        method: 'POST',
        headers,
        body: stringify({
            ds: datasourceId,
            rows,
            debug,
        }),
    });
    if (!response) {
        pushLog('error', { message: 'post data error', error: 'missing response', dataSource: datasourceId, rows });
        showError('Failed to post data: response is undefined');
        throw new AbortError();
    }
    if (!response.ok) {
        pushLog('error', { message: 'post data error', error: response.statusText, dataSource: datasourceId, rows });
        showError(`Failed to post data: response is not ok: ${response.status} ${response.statusText}`);
        return [];
    }
    const { status, message, rows: updatedRows, } = (await response.json());
    if (status === 'ERROR') {
        pushLog('error', { message: 'post data error', error: message, dataSource: datasourceId, rows });
        showError(message ?? 'Unknown error');
        throw new AbortError();
    }
    return updatedRows;
}
/** Debounce time in ms to prevent double-refresh from globalPubSub + SSE */
const AUTO_REFRESH_DEBOUNCE_MS = 1000;
/**
 * Handle store refresh with standard checks.
 * Shared between autoRefresh and store invalidation.
 */
function handleStoreRefresh(store, sourceStoreKey, sourceTrackId) {
    const myTrackId = getTrackId();
    // Self-refresh prevention
    if (sourceStoreKey === store.key)
        return; // Same store
    if (sourceTrackId === myTrackId)
        return; // Same browser tab (for SSE)
    // Check if store is mounted
    if (store.usageCount === 0) {
        // Not mounted - mark data as stale so it refreshes on next mount (stale-while-revalidate)
        // This avoids the flicker of clearing data and showing "no data" before fresh data loads
        store.setNeedsRefresh(true);
        return;
    }
    // Mounted - check if we can refresh
    if (!store.initialQueryFired())
        return;
    if (store.isStoreDirty())
        return;
    if (store.isBusy())
        return;
    // Debounce to prevent double-refresh from globalPubSub + SSE
    const now = Date.now();
    if (now - store._lastAutoRefreshTime < AUTO_REFRESH_DEBOUNCE_MS)
        return;
    store._lastAutoRefreshTime = now;
    // Refresh the store
    store.refresh().catch((e) => {
        clientLogger.error({ message: 'autoRefresh error', error: e });
    });
}
/**
 * Set up store invalidation subscription.
 * This is called for ALL stores, allowing them to be invalidated programmatically.
 */
function setupStoreInvalidation(store) {
    const unsub = globalPubSub.sub('OnStoreInvalidate', async (_, payload) => {
        // Check if this store matches any of the identifiers
        const matches = payload.identifiers.some((id) => storeMatchesIdentifier(store, id));
        if (!matches)
            return;
        handleStoreRefresh(store, payload.sourceStoreKey, undefined);
    });
    store._autoRefreshUnsubscribes.push(unsub);
}
/**
 * Set up autoRefresh subscriptions for a store.
 * Subscribes to both globalPubSub (same-tab) and SSE (cross-tab/cross-user) events.
 */
function setupAutoRefresh(store) {
    // 1. Client-side: globalPubSub for same-tab (immediate feedback)
    const unsub1 = globalPubSub.sub('OnDataSourceChange', async (_, payload) => {
        if (payload.datasourceId !== store.datasourceId)
            return;
        handleStoreRefresh(store, payload.sourceStoreKey, undefined);
    });
    store._autoRefreshUnsubscribes.push(unsub1);
    // 2. Server-side: SSE for cross-tab/cross-user
    const unsub2 = sseManager.subscribe([`data:${store.datasourceId}`], (_channel, data) => {
        handleStoreRefresh(store, undefined, data.sourceTrackId);
    });
    store._autoRefreshUnsubscribes.push(unsub2);
}
/**
 * Check if a store matches a given identifier.
 * - String: matches if store.datasourceId === identifier
 * - Object: matches if all specified fields match
 */
export function storeMatchesIdentifier(store, identifier) {
    if (typeof identifier === 'string') {
        return store.datasourceId === identifier;
    }
    // Object identifier - match all specified fields
    if (store.datasourceId !== identifier.datasourceId)
        return false;
    if (identifier.alias != null && store.alias !== identifier.alias)
        return false;
    if (identifier.page != null && store.page !== identifier.page)
        return false;
    return true;
}
/**
 * Invalidate a single store by identifier.
 * Triggers refresh on all mounted stores matching the identifier.
 *
 * @example
 * // Invalidate all stores for a datasource
 * invalidateStore('OrderItems');
 *
 * @example
 * // Invalidate a specific store
 * invalidateStore({ datasourceId: 'OrderItems', alias: 'items-list', page: 'order-detail' });
 */
export function invalidateStore(identifier, sourceStoreKey) {
    globalPubSub.pub('OnStoreInvalidate', { identifiers: [identifier], sourceStoreKey });
}
/**
 * Invalidate multiple stores by identifiers.
 * Triggers refresh on all mounted stores matching any of the identifiers.
 *
 * @example
 * invalidateStores(['OrderItems', 'OrderHistory']);
 *
 * @example
 * invalidateStores([
 *   'OrderHistory',
 *   { datasourceId: 'OrderItems', page: 'order-detail' },
 * ]);
 */
export function invalidateStores(identifiers, sourceStoreKey) {
    if (identifiers.length === 0)
        return;
    globalPubSub.pub('OnStoreInvalidate', { identifiers, sourceStoreKey });
}
export function useStore(props) {
    let store = StoreClass.get(props);
    if (!store) {
        store = StoreClass.createSync(props);
    }
    // Track mount state via usageCount
    // This is used by autoRefresh to determine whether to refresh or clear
    useEffect(() => {
        store.usageCount++;
        // If the store was cleared while unmounted and has autoQuery, re-fetch on remount
        if (store.autoQuery &&
            !store.initialQueryFired() &&
            store.status() === 'ok' &&
            !isWaitingForSavedSearches(store)) {
            store.executeQuery();
        }
        // If data was marked stale while unmounted, refresh it now (stale-while-revalidate)
        // This keeps existing data visible while fetching fresh data in the background
        if (store.needsRefresh() && store.initialQueryFired() && !store.isStoreDirty() && !store.isBusy()) {
            store.setNeedsRefresh(false);
            store.refresh().catch((e) => {
                clientLogger.error({ message: 'stale refresh error', error: e });
            });
        }
        return () => {
            store.usageCount--;
        };
    }, [store]);
    // Register child stores if configured
    const childStores = props.childStores;
    useEffect(() => {
        if (!childStores || childStores.length === 0)
            return;
        const cleanups = childStores.map((config) => store._registerChildStore(config));
        return () => {
            for (const cleanup of cleanups) {
                cleanup();
            }
        };
    }, [store, childStores]);
    return store;
}
//# sourceMappingURL=store.js.map