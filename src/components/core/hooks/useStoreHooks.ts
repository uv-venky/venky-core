import type { DBRow, Filters, Query, Row, SchemaMember, StringKeyof } from '@/lib/core/common/ds/types/filter';
import { areEqualShallow, EMPTY_ARRAY, emptyFunction, isEmptyObject } from '@/lib/core/common/isEmpty';
import type { ErrorSource, Store } from '@/lib/core/common/types/Store';
import { useCallback, useEffect, useMemo } from 'react';
import { proxy, type Snapshot, useSnapshot } from 'valtio';
import { useRowId } from '@/components/core/page/RowIdProvider';
import { useLatest } from '@/components/core/hooks/useLatest';
import { deepEqual } from '@/lib/core/common/deepUtils';

const EMPTY_RESULT: [Filters<any>, (filters: Filters<any>) => void] = [[], emptyFunction];

export function useStoreFilters<T extends object>(store: Store<T>): [Filters<T>, (filters: Filters<T>) => void] {
  const { smartSearchFilters } = useSnapshot(store.getState(), {
    sync: true,
  });

  if (store == null || smartSearchFilters == null) {
    return EMPTY_RESULT;
  }
  // const { smartSearchFilters } = state.data[store.alias]![store.datasourceId]![store.page]!;
  return [smartSearchFilters as Filters<T>, store.setSmartSearchFilters];
}

export function useRowIds<T extends object>(store: Store<T>): ReadonlyArray<string> {
  const { rowIds } = useSnapshot(store.getState());
  return rowIds ?? EMPTY_ARRAY;
}

export function useRows<T extends object>(store: Store<T>): ReadonlyArray<Readonly<Row<T>>> {
  const { rowIds, rows } = useSnapshot(store.getState());
  return useMemo(() => {
    if (rowIds == null || rows == null) {
      return EMPTY_ARRAY;
    }
    return rowIds.map((id) => rows[id] as Row<T>);
  }, [rowIds, rows]);
}

export function useDBRows<T extends object>(store: Store<T>): ReadonlyArray<DBRow<T>> {
  const { rowIds, rows } = useSnapshot(store.getState());
  return useMemo(() => {
    if (rowIds == null || rows == null) {
      return EMPTY_ARRAY;
    }
    return rowIds.map((id) => rows[id] as Row<T>);
  }, [rowIds, rows]);
}

export function useCurrentRowId<T extends object>(store: Store<T>): string | undefined {
  const { currentRowId } = useSnapshot(store.getState());
  return currentRowId;
}

export function useCurrentRow<T extends object>(store: Store<T>): Row<T> | undefined {
  const { currentRowId, rows } = useSnapshot(store.getState());
  const proxyRow = currentRowId != null ? rows?.[currentRowId] : undefined;

  // Spread the proxy row to force valtio to track all properties.
  // Without this, valtio only tracks properties accessed during render, causing
  // stale data when properties are accessed in useEffect or callbacks.
  // useMemo ensures we only create a new object when the row actually changes.
  return useMemo(() => {
    if (proxyRow == null) return undefined;
    return { ...proxyRow } as Row<T>;
  }, [proxyRow]);
}

export function useCurrentDBRow<T extends object>(store: Store<T>): DBRow<T> | undefined {
  return useCurrentRow(store) as DBRow<T> | undefined;
}

export function useCurrentRowIndex<T extends object>(store: Store<T>): number | undefined {
  const { currentRowId, rowIds } = useSnapshot(store.getState());
  if (currentRowId == null) {
    return undefined;
  }
  const currentRowIndex = rowIds.indexOf(currentRowId);
  return currentRowIndex != null ? currentRowIndex : undefined;
}

export function useNextRow<T extends object>(store: Store<T>): Row<T> | undefined {
  const { currentRowId, rowIds, rows } = useSnapshot(store.getState());
  if (currentRowId == null) {
    return undefined;
  }
  const currentRowIndex = rowIds.indexOf(currentRowId);
  const nextRowId = rowIds[currentRowIndex + 1];
  return nextRowId != null ? (rows?.[nextRowId] as Row<T>) : undefined;
}

export function usePreviousRow<T extends object>(store: Store<T>): Row<T> | undefined {
  const { currentRowId, rowIds, rows } = useSnapshot(store.getState());
  if (currentRowId == null) {
    return undefined;
  }
  const currentRowIndex = rowIds.indexOf(currentRowId);
  const previousRowId = rowIds[currentRowIndex - 1];
  return previousRowId != null ? (rows?.[previousRowId] as Row<T>) : undefined;
}

export function useCurrentRowSync<T extends object>(store: Store<T>): Row<T> | undefined {
  const { currentRowId, rows } = useSnapshot(store.getState(), {
    sync: true,
  });
  const proxyRow = currentRowId != null ? rows?.[currentRowId] : undefined;

  // Spread the proxy row to force valtio to track all properties.
  // Without this, valtio only tracks properties accessed during render, causing
  // stale data when properties are accessed in useEffect or callbacks.
  // useMemo ensures we only create a new object when the row actually changes.
  return useMemo(() => {
    if (proxyRow == null) return undefined;
    return { ...proxyRow } as Row<T>;
  }, [proxyRow]);
}

export function useRowValue<T extends object, K extends StringKeyof<T>>(
  store: Store<T>,
  rowId: string,
  key: K,
): Row<T>[K] | undefined {
  const { rows } = useSnapshot(store.getState(), {
    sync: true,
  });
  return rowId && rows ? (rows[rowId] as Row<T>)?.[key] : undefined;
}

export function useValue<T extends object, K extends StringKeyof<T>>(store: Store<T>, key: K): Row<T>[K] | undefined {
  const { currentRowId } = useSnapshot(store.getState(), {
    sync: true,
  });
  const rowId = useRowId() ?? currentRowId;
  return useRowValue(store, rowId ?? '', key);
}

export function useRowAtId<T extends object>(store: Store<T>, rowId?: string): Row<T> | undefined {
  const { rows } = useSnapshot(store.getState(), { sync: true });
  return rowId != null ? (rows?.[rowId] as Row<T>) : undefined;
}

export function useRow<T extends object>(store: Store<T>): Row<T> | undefined {
  const rowId = useRowId();
  return useRowAtId(store, rowId);
}

export function useValueSetter<T extends object, K extends StringKeyof<T>>(
  store: Store<T>,
  key: K,
): (value: T[K] | undefined) => void {
  return useCallback(
    (value: T[K] | undefined) => {
      if (store) {
        store.setValue(key, value);
      }
    },
    [store, key],
  );
}

export function useIsStoreDirty<T extends object>(store: Store<T>): boolean {
  const { originalRows, rows, _childDirtyCount } = useSnapshot(store.getState());
  if (_childDirtyCount > 0) {
    return true;
  }
  if (!isEmptyObject(originalRows)) {
    return true;
  }
  return (Object.values(rows) as Row<T>[]).some((row) => row._status && row._status !== 'N' && row._status !== 'Q');
}

export function useIsRowDirty<T extends object>(store: Store<T>, id: string): boolean {
  const { originalRows } = useSnapshot(store.getState());
  return originalRows?.[id] != null;
}

export function useIsRowAttributeDirty<T extends object>(
  store: Store<T>,
  id: string,
  attribute: StringKeyof<T>,
): boolean {
  const { originalRows, rows } = useSnapshot(store.getState());
  const _orig = originalRows?.[id] as Row<T> | undefined;
  if (_orig == null) {
    return false;
  }
  const row = rows?.[id] as Row<T> | undefined;
  const dirty = !areEqualShallow(_orig[attribute as keyof Row<T>], row?.[attribute]);
  return dirty;
}

export function useRowAttributeOriginalValue<T extends object, K extends StringKeyof<T>>(
  store: Store<T>,
  id: string,
  attribute: K,
): T[K] | undefined {
  const { originalRows } = useSnapshot(store.getState());
  const _orig = originalRows?.[id] as Row<T> | undefined;
  if (_orig == null) {
    return undefined;
  }
  return _orig[attribute as keyof Row<T>] as T[K];
}

export function useStoreSize<T extends object>(store: Store<T>): number | undefined {
  const { rowIds } = useSnapshot(store.getState());
  return rowIds.length;
}

export function useStoreRowCount<T extends object>(store: Store<T>): number | undefined {
  const { totalRowCount } = useSnapshot(store.getState());
  return totalRowCount;
}

export function useSortState<T extends object>(
  store: Store<T>,
  key: StringKeyof<T>,
): [number, number] | [undefined, undefined] {
  const { sort } = useSnapshot(store.getState());
  const sortState = useMemo((): [number, number] | [undefined, undefined] => {
    const val = sort
      ? Object.entries<number>(sort)
          .sort((a, b) => a[1] - b[1])
          .map<[string, number, number]>(([k, v], index) => [k, v, index + 1])
          .find(([k]) => k === key)
      : undefined;
    return val ? [val[1], val[2]] : [undefined, undefined];
  }, [sort, key]);
  return sortState;
}

export function useFullSortState<T extends object>(store: Store<T>): Snapshot<SchemaMember<T, number>> | undefined {
  const { sort } = useSnapshot(store.getState());
  return sort;
}

export function useIsStoreBusy<T extends object>(store: Store<T>): boolean {
  const { isLoading, isPosting } = useSnapshot(store.getState());
  return isLoading || isPosting;
}

export function useIsStoreLoading<T extends object>(store: Store<T>): boolean {
  const { isLoading } = useSnapshot(store.getState());
  return isLoading;
}

export function useIsStorePosting<T extends object>(store: Store<T>): boolean {
  const { isPosting } = useSnapshot(store.getState());
  return isPosting;
}

export function useStoreError<T extends object>(store: Store<T>): string | undefined {
  const { error, status } = useSnapshot(store.getState());
  return status === 'error' ? (error ?? 'Unknown error') : undefined;
}

export function usePreQuery<T extends object>(store: Store<T>, preQueryCallback: (query: Query<T>) => Query<T>): void {
  const callback = useLatest(preQueryCallback);
  useEffect(() => {
    const listener = (query: Query<T>) => {
      return callback.current(query);
    };
    return store.addPreQueryCallback(listener);
  }, [callback, store]);
}

export function useHasMoreRows<T extends object>(store: Store<T>): boolean {
  const { hasMoreRows } = useSnapshot(store.getState());
  return hasMoreRows;
}

export function useIsRowSelected<T extends object>(store: Store<T>, id: string): boolean {
  const { selected } = useSnapshot(store.getState());
  return selected?.[id] ?? false;
}

export function useSelectedRowIds<T extends object>(store: Store<T>): ReadonlyArray<string> {
  const { selected } = useSnapshot(store.getState());
  return Object.keys(selected ?? {});
}

export function useIsAllSelected<T extends object>(store: Store<T>): boolean {
  const { selected, rowIds } = useSnapshot(store.getState());
  return selected != null && rowIds != null && Object.keys(selected).length === rowIds.length;
}

export function useSelectedRows<T extends object>(store: Store<T>): ReadonlyArray<Row<T>> {
  const { selected } = useSnapshot(store.getState());
  return Object.keys(selected ?? {}).map(store.row);
}

export function useIsHeaderFilterDirty<T extends object>(store: Store<T>, attribute: StringKeyof<T>): boolean {
  const { headerFilters, draftHeaderFilters } = useSnapshot(store.getState());
  const hf = headerFilters?.[attribute as keyof typeof headerFilters];
  const dhf = draftHeaderFilters?.[attribute as keyof typeof draftHeaderFilters];
  return !deepEqual(hf, dhf);
}

export function useIsHeaderFilterApplied<T extends object>(store: Store<T>, attribute: StringKeyof<T>): boolean {
  const { headerFilters } = useSnapshot(store.getState());
  return headerFilters?.[attribute as keyof typeof headerFilters] != null;
}

const EMPTY_PROXY = proxy({ hideHeaderFilters: true });

export function useIsHeaderFiltersHidden<T extends object>(store?: Store<T>): boolean {
  const { hideHeaderFilters } = useSnapshot(store?.getState() ?? EMPTY_PROXY);
  return hideHeaderFilters ?? false;
}

export function useStoreFieldErrors<T extends object>(
  store: Store<T>,
): Snapshot<SchemaMember<T, Partial<Record<ErrorSource, string>>>> | undefined {
  const { fieldErrors } = useSnapshot(store.getState());

  const currentRowId = useCurrentRowId(store);
  return fieldErrors != null && currentRowId != null ? fieldErrors[currentRowId] : undefined;
}

export function useCellErrors<T extends object>(
  store: Store<T>,
  rowId: string,
  attribute: StringKeyof<T>,
): string | undefined {
  const { fieldErrors } = useSnapshot(store.getState());

  // @ts-expect-error
  const errorMap = fieldErrors?.[rowId]?.[attribute];
  if (errorMap != null) {
    return Object.values(errorMap).join(', ');
  }
}

export function useStoreOffset<T extends object>(store: Store<T>): number {
  const { offset } = useSnapshot(store.getState());
  return offset;
}
