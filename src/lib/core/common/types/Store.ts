import type { PubSub } from '@/lib/core/client/pub-sub';
import type { StoreEventMap } from '@/lib/core/client/store';
import type { Attribute } from '@/lib/core/common/ds/types/Attribute';
import type {
  DBRow,
  Filters,
  NewRow,
  Query,
  Row,
  SchemaMember,
  SchemaMemberValue,
  SingleFilter,
  StringKeyof,
} from '@/lib/core/common/ds/types/filter';
import type { RecordStatus } from '@/lib/core/common/ds/types/RecordStatus';

export type ErrorSource = 'Controller' | 'Action' | 'System';

export type PreQueryCallback<T extends object> = (query: Query<T>) => Query<T>;

/**
 * Configuration for a child store that is managed by a parent store.
 * The parent auto-queries the child when the active row changes,
 * cascades save (populating FKs), aggregates dirty state, and cascades reset.
 *
 * @example
 * ```ts
 * const stepsStore = useStore<DZSequenceSteps>({
 *   datasourceId: 'DZSequenceSteps',
 *   alias: 'dz-sequence-steps',
 *   page: 'dz-sequence-steps-edit',
 *   autoQuery: false,
 *   sort: { stepOrder: 1 },
 *   limit: 100,
 * });
 *
 * const store = useStore<DZSequences>({
 *   datasourceId: 'DZSequences',
 *   alias: 'dz-sequences-admin-all',
 *   page: 'dz-sequences-admin-page',
 *   childStores: [{ store: stepsStore, fieldMapping: { sequenceId: 'id' } }],
 * });
 * ```
 */
export interface ChildStoreConfig<TChild extends object, TParent extends object> {
  /** The child store instance (created via useStore with autoQuery: false) */
  store: Store<TChild>;
  /**
   * Maps child FK fields to parent fields.
   * Used for both query filtering and FK population on save.
   * @example { sequenceId: 'id', orgId: 'orgId' }
   */
  fieldMapping: Partial<Record<StringKeyof<TChild>, StringKeyof<TParent>>>;
}

/**
 * Identifies a store for invalidation.
 * - String: invalidates ALL stores for that datasourceId
 * - Object: precise targeting with optional alias/page filters
 */
export type StoreIdentifier =
  | string // datasourceId only - invalidates ALL stores for that datasource
  | {
      datasourceId: string;
      alias?: string; // Optional: target specific alias
      page?: string; // Optional: target specific page
    };

export interface StoreState<T extends object> {
  rows: Record<string, Row<T>>;
  selected: Record<string, boolean>;
  rowIds: string[];
  originalRowIds: string[];
  originalRows: Record<string, DBRow<T>>;
  currentRowId?: string;
  initialQueryFired: boolean;
  sort?: SchemaMember<T, number>;
  offset: number;
  totalRowCount?: number;
  isLoading: boolean;
  isPosting: boolean;
  insertable: boolean;
  updatable: boolean;
  deletable: boolean;
  queryable: boolean;
  autoQueryFired: boolean;
  hasMoreRows: boolean;
  status: 'ok' | 'pending' | 'error';
  fieldErrors: Record<string, SchemaMember<T, Partial<Record<ErrorSource, string>>>>;
  error?: string;
  storeFilters: Filters<T>;
  smartSearchFilters: Filters<T>;
  headerFilters: SingleFilter<T>;
  draftHeaderFilters: SingleFilter<T>;
  hideHeaderFilters?: boolean;
  initialQueryFiredAt: number;
  /** When true, store data is stale and needs refresh on next mount (stale-while-revalidate pattern) */
  needsRefresh: boolean;
  /** Tracks number of dirty child stores — used by useIsStoreDirty for reactivity */
  _childDirtyCount: number;
}

export type DSType =
  | 'CloudDataStore'
  | 'DataStore'
  | 'LocalDataStore'
  | 'ReadOnlyDataStore'
  | 'TransientDataStore'
  | 'KPIDataStore';

export interface StoreProps<T extends object> {
  page: string;
  datasourceId: string;
  alias: string;
  limit?: number;
  displayName?: string;
  transient?: boolean;
  localStore?: boolean;
  type?: DSType;
  filterLocally?: boolean;
  onInitialized?: (store: Store<T>) => Promise<void>;
  includeCount?: boolean;
  ignorePKDuplicate?: boolean;
  autoQuery?: boolean;
  /** Auto-refresh when datasource changes (from other stores, tabs, or users) */
  autoRefresh?: boolean;
  select?: StringKeyof<T>[];
  hideHeaderFilters?: boolean;
  sort?: SchemaMember<T, number>;
  /** Query action names to invalidate when this store saves successfully */
  invalidateOnSave?: string[];
  /** Stores to invalidate/refresh when this store saves successfully */
  invalidateStoresOnSave?: StoreIdentifier[];
  /**
   * Default equality matching for queries.
   * Merged with any match/data passed to executeQuery({ query: { match: {...} } }).
   * Applied automatically when autoQuery is true.
   * @example { isArchived: false, status: 'Active' }
   */
  match?: SchemaMemberValue<T>;
  /**
   * Default filter conditions for queries.
   * Merged with any filters passed to executeQuery({ query: { filters: [...] } }).
   * Applied automatically when autoQuery is true.
   * @example [{ status: { in: ['Active', 'Draft'] } }]
   */
  filters?: Filters<T>;
  /**
   * Child stores managed by this parent store.
   * When the parent's active row changes, child stores are auto-queried.
   * When the parent saves, child stores are saved with FKs populated.
   * isDirty aggregates child store dirty state.
   * resetStore cascades to children.
   */
  childStores?: ChildStoreConfig<any, T>[];
}

export interface Store<T extends object> {
  alias: string;
  data: Record<string, unknown>;
  datasourceId: string;
  displayName: string;
  feedback: string;
  filterLocally: boolean;
  ignorePKDuplicate: boolean;
  key: string;
  limit: number;
  /** Initial `limit` from store config; unchanged when pagination changes at runtime. */
  defaultLimit: number;
  localStore?: boolean;
  page: string;
  previousPromise: Promise<void> | undefined;
  previousQuery: string;
  previousCountQuery: string;
  previousSmartFilters: string;
  pubsub: PubSub<StoreEventMap<T>>;
  reverse: boolean;
  transient?: boolean;
  type: DSType;
  usageCount: number;
  includeCount?: boolean;
  select?: StringKeyof<T>[];
  destroyed: boolean;
  /** Whether the store should auto-query when mounted */
  autoQuery: boolean;
  /** Query action names to invalidate when this store saves successfully */
  invalidateOnSave?: string[];
  /** Stores to invalidate/refresh when this store saves successfully */
  invalidateStoresOnSave?: StoreIdentifier[];
  applyHeaderFiltersIfChanged(): Promise<void>;
  attributes(): Attribute<T>[];
  cleanup(): void;
  clear(): Promise<void>;
  clearCache(): Promise<void>;
  clearError(params: { attribute: StringKeyof<T>; rowId: string; source: ErrorSource }): void;
  clearAllErrors(): void;
  clearHeaderFilter(attr: StringKeyof<T>): void;
  clearSync(keepCurrentRowId?: boolean): void;
  confirm(): Promise<boolean>;
  copyRecord(targetStore: Store<T>, createAsNew?: boolean, addAfter?: string): Promise<void>;
  createNewBulk(rows: T[], insertOnTopOrAfter?: boolean | string): Promise<void>;
  insertBulk(rows: NewRow<T>[], insertOnTop?: boolean): Promise<void>;
  currentDBRowErrorIfNull(): DBRow<T>;
  currentRow(): Row<T> | undefined;
  currentRowErrorIfNull(): Row<T>;
  currentRowId(): string | undefined;
  dbList(): ReadonlyArray<DBRow<T>>;
  deSelectAll(): void;
  deSelectRow(id: string): void;
  deleteFromStore(id: string): void;
  deleteRow(id: string): Promise<void>;
  deleteSelectedRecords(): Promise<void>;
  dirtyRows(): Row<T>[];
  error(): string | undefined;
  forEach(callback: (row: Row<T>, rowId: string, index: number) => void): void;
  getAllErrors(): string | undefined;
  getAttribute(attr: StringKeyof<T>): Attribute<T> | undefined;
  getError(attribute: StringKeyof<T>, id: string): Partial<Record<ErrorSource, string>> | undefined;
  getHeaderFilter(attr: StringKeyof<T>): SingleFilter<T> | undefined;
  getNextOffset(): number;
  getPreviousQuery(): Query<T> | undefined;
  getRowsToPost(dirtyRows: Row<T>[]): Row<T>[];
  getSize(): number;
  getSort(): SchemaMember<T, number> | undefined;
  getValue<K extends keyof T>(key: K, rowIndex?: number): T[K] | undefined;
  hasError(attribute: StringKeyof<T>, id: string): boolean;
  hasErrors(): boolean;
  hasHeaderFilterApplied(attr: StringKeyof<T>): boolean;
  hasMoreRows(): boolean;
  hasNewRows(): boolean;
  hasRow(id: string): boolean;
  headerFilters(): SingleFilter<T>[];
  init(): Promise<void>;
  initialQueryFired(): boolean;
  isLoading(): boolean;
  isPosting(): boolean;
  isCurrentRowFromDB(): boolean;
  isDeletable(): boolean;
  isHeaderFilterDirty(attr: StringKeyof<T>): boolean;
  isInsertable(): boolean;
  isQueryable(): boolean;
  setInsertable(bool: boolean): void;
  setUpdatable(bool: boolean): void;
  setDeletable(bool: boolean): void;
  setQueryable(bool: boolean): void;
  isReadonly(): boolean;
  isRowAttributeDirty(id: string, attr: StringKeyof<T>): boolean;
  isRowDirty(id: string): boolean;
  isRowFromDB(id?: string): boolean;
  isSelected(id: string): boolean;
  isStoreDirty(): boolean;
  isUpdatable(): boolean;
  list(): ReadonlyArray<Row<T>>;
  newRecordID(): string;
  next(): Promise<void>;
  originalRow(id: string): DBRow<T>;
  originalRows(): Record<string, DBRow<T>>;
  originalRowsIds(): string[];
  pkAttributes(): Attribute<T>[];
  processServerResponse(rows: DBRow<T>[]): void;
  refresh(force?: boolean): Promise<void>;
  refreshRow(id: string): Promise<DBRow<T> | null>;
  removeOriginalRow(id: string): void;
  resetRow(id: string): void;
  resetStore(): void;
  row(id: string): Row<T>;
  dbRow(id: string): DBRow<T>;
  rowId(row: Row<T>): string;
  rowIdAtIndex(index: number): string;
  rowIds(): string[];
  rowStatus(id: string): RecordStatus;
  rows(): Record<string, Row<T>>;
  selectAll(): void;
  selectRow(id: string): void;
  selectRows(ids: string[]): void;
  selectedRowIds(): string[];
  selectedRows(): ReadonlyArray<Row<T>>;
  selectedRowsSize(): number;
  setAttributes: (attrs: Attribute<T>[]) => void;
  setIsLoading(isLoading: boolean): void;
  setIsPosting(isPosting: boolean): void;
  setCurrentRow(row: Row<T>): Promise<boolean>;
  setCurrentRowId(currentRowId?: string): Promise<boolean>;
  setHeaderFilter(filter: SingleFilter<T>): void;
  setHeaderFilters(filters: SingleFilter<T>[]): void;
  setInitialQueryFired(bool: boolean): void;
  /** Mark the store as needing a refresh on next mount (stale-while-revalidate pattern) */
  setNeedsRefresh(needsRefresh: boolean): void;
  /** Check if the store needs a refresh (data is stale) */
  needsRefresh(): boolean;
  /** Check if the store is busy (loading or posting) */
  isBusy(): boolean;
  setOriginalRow(id: string, row: DBRow<T>): void;
  setOriginalRowIds(originalRowIds: string[]): void;
  setOriginalRows(rows: Record<string, DBRow<T>>): void;
  setRow(id: string, row: Row<T>): void;
  setRowIds(rowIds: string[]): void;
  setRowStatus(id: string, status: RecordStatus): void;
  setRows(rows: Record<string, Row<T>>): void;
  setSmartSearchFilters(filters: Filters<T>): void;
  setSort(sort?: SchemaMember<T, number>): void;
  setOffset(offset: number): void;
  getOffset(): number;
  setStoreFilters(filters: Filters<T>): void;
  setValue<K extends keyof T>(key: K, value: T[K] | undefined, rowId?: string): void;
  smartSearchFilters(): Filters<T>;
  sort(sort?: SchemaMember<T, number>): Promise<void>;
  status(): string;
  storeFilters(): Filters<T>;
  updateRow(id: string, partialRecord: Partial<T>, skipDirty?: boolean): void;
  executeQuery(params?: {
    query?: Query<T>;
    noClear?: true;
    force?: boolean;
    handleResponse?: (rows: DBRow<T>[]) => void;
  }): Promise<void>;
  getRowValue<K extends keyof T>(id: string | undefined, key: K): T[K] | undefined;
  setError(params: { attribute: string; rowId: string; errorMessage?: string; source: ErrorSource }): void;
  sub<K extends keyof StoreEventMap<T>>(
    event: K,
    listener: <E extends K>(_event: E, props: StoreEventMap<T>[E]) => Promise<void>,
  ): () => void;
  createNew(params?: {
    partialRecord?: NewRow<T>;
    addOnTop?: boolean;
    addAfter?: string;
    cid?: string;
    status?: RecordStatus;
  }): Promise<string | undefined>;
  replaceClientId(clientId: string, newId: string, postedServerRecord: DBRow<T>, originalRecord?: DBRow<T>): void;
  save(params?: {
    silent?: boolean;
    feedback?: 'NONE' | string;
    batchCallback?: () => void;
    cancelBatch?: () => void;
  }): Promise<boolean>;
  getState(): StoreState<T>;
  setLimit(limit: number): Promise<void>;
  goToPage(page: number): Promise<void>;
  addPreQueryCallback(callback: PreQueryCallback<T>): () => void;
  /**
   * Register a child store for parent-child lifecycle management.
   * Sets up auto-query on parent row change, save cascade, isDirty aggregation, and reset cascade.
   * @returns Cleanup function to unregister the child store.
   */
  _registerChildStore<TChild extends object>(config: ChildStoreConfig<TChild, T>): () => void;
  /** Unregister a previously registered child store. */
  _unregisterChildStore(childStore: Store<any>): void;
}

// biome-ignore lint/complexity/noBannedTypes: extended interface
export interface TreeData extends Object {
  level: number;
  path: string[];
  hasChildren: boolean;
}

export interface TreeStore<T extends TreeData> extends Store<T> {
  parentAttribute: StringKeyof<T>;
  childAttribute: StringKeyof<T>;
  lazyLoad?: boolean;

  getTreeState(): TreeStoreState;
  expandRow(id: string): void;
  collapseRow(id: string): void;
}
export interface TreeStoreState {
  expandedNodes: Record<string, boolean>;
  loadedNodes: Record<string, boolean>;
  loadingNodes: Record<string, boolean>;
  children: Record<string, string[]>;
  rootNodes: string[];
}
