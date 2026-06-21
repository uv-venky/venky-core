import type { Attribute } from '../../../lib/core/common/ds/types/Attribute';
import type { DSPost } from '../../../lib/core/common/ds/types/DSPost';
import type { RecordStatus } from '../../../lib/core/common/ds/types/RecordStatus';
import type { DBRow, Filters, NewRow, Query, Row, SchemaMember, SchemaMemberValue, SingleFilter, StringKeyof } from '../../../lib/core/common/ds/types/filter';
import type { ChildStoreConfig, DSType, ErrorSource, PreQueryCallback, Store, StoreIdentifier, StoreProps, StoreState } from '../../../lib/core/common/types/Store';
import { PubSubClass } from '../../../lib/core/client/pub-sub';
export interface StoreEventMap<T extends object> {
    OnBeforeRecordActive: {
        id: string | null | undefined;
        previousId: string | null | undefined;
        prevented: boolean;
    };
    OnRecordActive: {
        id: string | null | undefined;
        previousId: string | null | undefined;
    };
    OnCreateNewRecord: {
        id: string;
        record: NewRow<T>;
    };
    OnBeforePost: {
        request: DSPost<T>;
    };
    OnStoreClear: undefined;
    OnAfterQuery: undefined;
    OnBeforeQuery: {
        query: Query<T>;
        abortMessage?: string;
    };
}
type KeyProps = Pick<StoreProps<any>, 'datasourceId' | 'alias' | 'page'>;
export declare function deferAutoQueryForSavedSearches<T extends object>(store: Store<T>): void;
export declare function clearAutoQueryDeferral<T extends object>(store: Store<T>): void;
export declare function clearAutoQueryDeferralAndExecute<T extends object>(store: Store<T>): void;
export declare function isFromDB<T extends object>(row?: Row<T> | null): row is DBRow<T>;
export declare function removeSystemAttributes<T extends object>(row: DBRow<T>): T;
export declare function toNewRow<T extends object>(row: Row<T>): NewRow<T>;
export declare class StoreClass<T extends object> implements Store<T> {
    page: string;
    datasourceId: string;
    ignorePKDuplicate: boolean;
    alias: string;
    limit: number;
    defaultLimit: number;
    reverse: boolean;
    key: string;
    previousQuery: string;
    previousQueryTime: number;
    previousCountQuery: string;
    previousSmartFilters: string;
    previousPromise: Promise<void> | undefined;
    displayName: string;
    usageCount: number;
    pubsub: PubSubClass<StoreEventMap<T>>;
    transient?: boolean;
    localStore?: boolean;
    type: DSType;
    feedback: string;
    data: Record<string, unknown>;
    filterLocally: boolean;
    includeCount?: boolean;
    preQueryCallbacks: PreQueryCallback<T>[];
    select?: StringKeyof<T>[];
    destroyed: boolean;
    /** Unsubscribe functions for autoRefresh listeners */
    _autoRefreshUnsubscribes: (() => void)[];
    /** Track last refresh time to debounce autoRefresh events */
    _lastAutoRefreshTime: number;
    /** Whether to auto-query when mounted (stored for re-mount scenarios) */
    autoQuery: boolean;
    /** Query action names to invalidate when this store saves successfully */
    invalidateOnSave?: string[];
    /** Stores to invalidate/refresh when this store saves successfully */
    invalidateStoresOnSave?: StoreIdentifier[];
    /** Default equality matching for queries */
    defaultMatch?: SchemaMemberValue<T>;
    /** Default filter conditions for queries */
    defaultFilters?: Filters<T>;
    /** Registered child stores with their configs and cleanup functions */
    _childStoreEntries: Array<{
        config: ChildStoreConfig<any, T>;
        cleanups: (() => void)[];
        lastChildDirty: boolean;
    }>;
    constructor({ page, displayName, datasourceId, alias, limit, transient, localStore, type, filterLocally, includeCount, ignorePKDuplicate, select, autoQuery, invalidateOnSave, invalidateStoresOnSave, match, filters, }: StoreProps<T>);
    init(): Promise<void>;
    static get<T extends object>(props: KeyProps): Store<T> | null;
    getState(): StoreState<T>;
    cleanup(): void;
    addPreQueryCallback(callback: PreQueryCallback<T>): () => void;
    /**
     * Register a child store for parent-child lifecycle management.
     * - Auto-queries child when parent's active row changes (with dirty confirmation)
     * - Cascades save (populates FKs from parent row)
     * - Aggregates isDirty across parent + children
     * - Cascades resetStore
     */
    _registerChildStore: <TChild extends object>(config: ChildStoreConfig<TChild, T>) => (() => void);
    _unregisterChildStore: (childStore: Store<any>) => void;
    static createSync<T extends object>(props: StoreProps<T>, instantiate?: () => Store<T>): Store<T>;
    _getPrimaryKeySync: (pkAttributes: Attribute<T>[], r: DBRow<T>) => string;
    afterAttributeInit(): void;
    _initAttributes: () => Promise<void>;
    setAttributes: (attrs: Attribute<T>[]) => void;
    attributes: () => Attribute<T>[];
    getAttribute: (attr: string) => Attribute<T> | undefined;
    pkAttributes: () => Attribute<T>[];
    setIsLoading: (isLoading: boolean) => void;
    setIsPosting: (isPosting: boolean) => void;
    setTotalRowCount: (count: number) => void;
    setStoreFilters: (filters: Filters<T>) => void;
    setSmartSearchFilters: (filters: Filters<T>) => void;
    setHeaderFilter: (filter: SingleFilter<T>) => void;
    setHeaderFilters: (filters: SingleFilter<T>[]) => void;
    clearHeaderFilter: (attr: StringKeyof<T>) => void;
    getHeaderFilter: (attr: StringKeyof<T>) => SingleFilter<T> | undefined;
    hasHeaderFilterApplied: (attr: StringKeyof<T>) => boolean;
    isHeaderFilterDirty: (attr: StringKeyof<T>) => boolean;
    storeFilters: () => Filters<T>;
    smartSearchFilters: () => Filters<T>;
    headerFilters: () => SingleFilter<T>[];
    isBusy: () => boolean;
    isLoading: () => boolean;
    isPosting: () => boolean;
    setInitialQueryFired: (bool: boolean) => void;
    initialQueryFired: () => boolean;
    /**
     * Mark the store as needing a refresh on next mount (stale-while-revalidate pattern).
     * Unlike clearSync(), this keeps existing data visible while flagging it as stale.
     */
    setNeedsRefresh: (needsRefresh: boolean) => void;
    /**
     * Check if the store needs a refresh (data is stale).
     */
    needsRefresh: () => boolean;
    executeQuery({ query, noClear, force, handleResponse, refreshOrPagination, }?: {
        query?: Query<T>;
        noClear?: true;
        force?: boolean;
        handleResponse?: (rows: DBRow<T>[]) => void;
        refreshOrPagination?: boolean;
    }): Promise<void>;
    isDeletable: () => boolean;
    isUpdatable: () => boolean;
    isInsertable: () => boolean;
    isQueryable: () => boolean;
    setQueryable: (queryable: boolean) => void;
    setInsertable: (insertable: boolean) => void;
    setUpdatable: (updatable: boolean) => void;
    setDeletable: (deletable: boolean) => void;
    isReadonly: () => boolean;
    confirm: () => Promise<boolean>;
    sort: (sort?: SchemaMember<T, number>) => Promise<void>;
    next: () => Promise<void>;
    goToPage: (page: number) => Promise<void>;
    getPreviousQuery: () => Query<T> | undefined;
    getNextOffset: () => number;
    setLimit: (limit: number) => Promise<void>;
    refresh: (force?: boolean, limit?: number) => Promise<void>;
    refreshRow: (id: string) => Promise<DBRow<T> | null>;
    applyHeaderFiltersIfChanged: () => Promise<void>;
    clearSync: (keepCurrentRowId?: boolean) => void;
    private clearBeforeRefresh;
    clear: () => Promise<void>;
    clearCache: () => Promise<void>;
    setSort: (sort?: SchemaMember<T, number>) => void;
    setOffset: (offset: number) => void;
    getOffset: () => number;
    getSort: () => SchemaMember<T, number> | undefined;
    rowIds: () => string[];
    forEach: (fn: (row: Row<T>, rowId: string, index: number) => void) => void;
    find: (fn: (row: Row<T>, rowId: string, index: number) => boolean) => Row<T> | undefined;
    rowIdAtIndex: (index: number) => string;
    setRowIds: (rowIds: string[]) => void;
    originalRowsIds: () => string[];
    setOriginalRowIds: (originalRowIds: string[]) => void;
    setRows: (rows: Record<string, Row<T>>) => void;
    setRow: (id: string, row: Row<T>) => void;
    setOriginalRows: (rows: Record<string, DBRow<T>>) => void;
    row: (id: string) => Row<T>;
    dbRow: (id: string) => DBRow<T>;
    status: () => "error" | "pending" | "ok";
    error: () => string | undefined;
    rows: () => Record<string, Row<T>>;
    list: () => ReadonlyArray<Row<T>>;
    dbList: () => ReadonlyArray<DBRow<T>>;
    currentRowId: () => string | undefined;
    currentRow: () => Row<T> | undefined;
    currentRowErrorIfNull: () => Row<T>;
    currentDBRowErrorIfNull: () => DBRow<T>;
    isRowFromDB: (id?: string) => boolean;
    isCurrentRowFromDB: () => boolean;
    /**
     * Internal sync version — sets currentRowId and fires OnRecordActive.
     * No dirty check, no OnBeforeRecordActive veto. Child stores react via OnRecordActive subscriber.
     * Use for programmatic state changes (clear, reset, delete, query refresh, bulk ops).
     */
    private setCurrentRowIdSync;
    /**
     * Public async version — for user-initiated navigation (row clicks, edit, createNew).
     * Checks child store dirty state, fires OnBeforeRecordActive for external veto,
     * then commits the change. Returns false if prevented.
     */
    setCurrentRowId: (currentRowId?: string) => Promise<boolean>;
    sub: <K extends keyof StoreEventMap<T>>(event: K, listener: <E extends K>(_event: E, props: StoreEventMap<T>[E]) => Promise<void>) => (() => void);
    setCurrentRow: (row: Row<T>) => Promise<boolean>;
    rowId: (row: Row<T>) => string;
    setRowStatus: (id: string, status: RecordStatus) => void;
    rowStatus: (id: string) => RecordStatus;
    setOriginalRow: (id: string, row: DBRow<T>) => void;
    removeOriginalRow: (id: string) => void;
    originalRow: (id: string) => DBRow<T>;
    originalRows: () => Record<string, DBRow<T>>;
    resetRow: (id: string) => void;
    resetStore(): void;
    deleteRow: (id: string) => Promise<void>;
    deleteFromStore: (id: string) => void;
    private populateId;
    processServerResponse(rows: DBRow<T>[]): void;
    addNewRowIds: (rowIds: string[], _rows: DBRow<T>[]) => void;
    hasMoreRows: () => boolean;
    counter: number;
    newRecordID: () => string;
    createNew({ partialRecord, addOnTop, addAfter, cid, status, }?: {
        partialRecord?: NewRow<T>;
        addOnTop?: boolean;
        addAfter?: string;
        cid?: string;
        status?: RecordStatus;
    }): Promise<string | undefined>;
    getRowsToPost: (dirtyRows: Row<T>[]) => Row<T>[];
    dirtyRows: () => Row<T>[];
    hasDirtyRows: () => boolean;
    hasNewRows: () => boolean;
    isStoreDirty: () => boolean;
    isRowDirty: (id: string) => boolean;
    isRowAttributeDirty: (id: string, attr: keyof T) => boolean;
    private processUpdateRow;
    updateRow: (id: string, partialRecord: Partial<T>, skipDirty?: boolean) => void;
    setValue: <K extends keyof T>(key: K, value: T[K] | undefined, rowId?: string) => void;
    getValue: <K extends keyof T>(key: K, rowIndex?: number) => T[K] | undefined;
    getRowValue: <K extends keyof T>(id: string | undefined, key: K) => T[K] | undefined;
    selectedRowIds: () => string[];
    selectedRowsSize: () => number;
    selectedRows: () => ReadonlyArray<Row<T>>;
    selectRow: (id: string) => void;
    selectRows: (ids: string[]) => void;
    isSelected: (id: string) => boolean;
    hasRow: (id: string) => boolean;
    deSelectRow: (id: string) => void;
    deSelectAll: () => void;
    selectAll: () => void;
    setError: ({ attribute, rowId, errorMessage, source, }: {
        attribute: StringKeyof<T>;
        rowId: string;
        errorMessage?: string;
        source: ErrorSource;
    }) => void;
    clearError: ({ attribute, rowId, source, }: {
        attribute: StringKeyof<T>;
        rowId: string;
        source: ErrorSource;
    }) => void;
    clearAllErrors: () => void;
    getError: (attribute: StringKeyof<T>, id: string) => Partial<Record<ErrorSource, string>> | undefined;
    getAllErrors: () => string | undefined;
    hasError: (attribute: StringKeyof<T>, id: string) => boolean;
    hasErrors: () => boolean;
    getSize: () => number;
    replaceClientId: (clientId: string, newId: string, postedServerRecord: DBRow<T>, originalRecord?: DBRow<T>) => void;
    save: ({ silent, feedback, batchCallback, cancelBatch, }?: {
        silent?: boolean;
        feedback?: "NONE" | string;
        batchCallback?: () => void;
        cancelBatch?: () => void;
    }) => Promise<boolean>;
    deleteSelectedRecords: () => Promise<void>;
    copyRecord: (targetStore: Store<T>, createAsNew?: boolean, addAfter?: string) => Promise<void>;
    insertBulk: (rows: Row<T>[], insertOnTop?: boolean) => Promise<void>;
    createNewBulk: (rows: T[], insertOnTopOrAfter?: boolean | string) => Promise<void>;
}
/**
 * Check if a store matches a given identifier.
 * - String: matches if store.datasourceId === identifier
 * - Object: matches if all specified fields match
 */
export declare function storeMatchesIdentifier<T extends object>(store: Store<T>, identifier: StoreIdentifier): boolean;
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
export declare function invalidateStore(identifier: StoreIdentifier, sourceStoreKey?: string): void;
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
export declare function invalidateStores(identifiers: StoreIdentifier[], sourceStoreKey?: string): void;
export declare function useStore<T extends object>(props: StoreProps<T>): Store<T>;
export {};
//# sourceMappingURL=store.d.ts.map