import { areEqualShallow, EMPTY_ARRAY, emptyFunction, isEmptyObject } from '../../../lib/core/common/isEmpty';
import { useCallback, useEffect, useMemo } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { useRowId } from '../../../components/core/page/RowIdProvider';
import { useLatest } from '../../../components/core/hooks/useLatest';
import { deepEqual } from '../../../lib/core/common/deepUtils';
const EMPTY_RESULT = [[], emptyFunction];
export function useStoreFilters(store) {
    const { smartSearchFilters } = useSnapshot(store.getState(), {
        sync: true,
    });
    if (store == null || smartSearchFilters == null) {
        return EMPTY_RESULT;
    }
    // const { smartSearchFilters } = state.data[store.alias]![store.datasourceId]![store.page]!;
    return [smartSearchFilters, store.setSmartSearchFilters];
}
export function useRowIds(store) {
    const { rowIds } = useSnapshot(store.getState());
    return rowIds ?? EMPTY_ARRAY;
}
export function useRows(store) {
    const { rowIds, rows } = useSnapshot(store.getState());
    return useMemo(() => {
        if (rowIds == null || rows == null) {
            return EMPTY_ARRAY;
        }
        return rowIds.map((id) => rows[id]);
    }, [rowIds, rows]);
}
export function useDBRows(store) {
    const { rowIds, rows } = useSnapshot(store.getState());
    return useMemo(() => {
        if (rowIds == null || rows == null) {
            return EMPTY_ARRAY;
        }
        return rowIds.map((id) => rows[id]);
    }, [rowIds, rows]);
}
export function useCurrentRowId(store) {
    const { currentRowId } = useSnapshot(store.getState());
    return currentRowId;
}
export function useCurrentRow(store) {
    const { currentRowId, rows } = useSnapshot(store.getState());
    const proxyRow = currentRowId != null ? rows?.[currentRowId] : undefined;
    // Spread the proxy row to force valtio to track all properties.
    // Without this, valtio only tracks properties accessed during render, causing
    // stale data when properties are accessed in useEffect or callbacks.
    // useMemo ensures we only create a new object when the row actually changes.
    return useMemo(() => {
        if (proxyRow == null)
            return undefined;
        return { ...proxyRow };
    }, [proxyRow]);
}
export function useCurrentDBRow(store) {
    return useCurrentRow(store);
}
export function useCurrentRowIndex(store) {
    const { currentRowId, rowIds } = useSnapshot(store.getState());
    if (currentRowId == null) {
        return undefined;
    }
    const currentRowIndex = rowIds.indexOf(currentRowId);
    return currentRowIndex != null ? currentRowIndex : undefined;
}
export function useNextRow(store) {
    const { currentRowId, rowIds, rows } = useSnapshot(store.getState());
    if (currentRowId == null) {
        return undefined;
    }
    const currentRowIndex = rowIds.indexOf(currentRowId);
    const nextRowId = rowIds[currentRowIndex + 1];
    return nextRowId != null ? rows?.[nextRowId] : undefined;
}
export function usePreviousRow(store) {
    const { currentRowId, rowIds, rows } = useSnapshot(store.getState());
    if (currentRowId == null) {
        return undefined;
    }
    const currentRowIndex = rowIds.indexOf(currentRowId);
    const previousRowId = rowIds[currentRowIndex - 1];
    return previousRowId != null ? rows?.[previousRowId] : undefined;
}
export function useCurrentRowSync(store) {
    const { currentRowId, rows } = useSnapshot(store.getState(), {
        sync: true,
    });
    const proxyRow = currentRowId != null ? rows?.[currentRowId] : undefined;
    // Spread the proxy row to force valtio to track all properties.
    // Without this, valtio only tracks properties accessed during render, causing
    // stale data when properties are accessed in useEffect or callbacks.
    // useMemo ensures we only create a new object when the row actually changes.
    return useMemo(() => {
        if (proxyRow == null)
            return undefined;
        return { ...proxyRow };
    }, [proxyRow]);
}
export function useRowValue(store, rowId, key) {
    const { rows } = useSnapshot(store.getState(), {
        sync: true,
    });
    return rowId && rows ? rows[rowId]?.[key] : undefined;
}
export function useValue(store, key) {
    const { currentRowId } = useSnapshot(store.getState(), {
        sync: true,
    });
    const rowId = useRowId() ?? currentRowId;
    return useRowValue(store, rowId ?? '', key);
}
export function useRowAtId(store, rowId) {
    const { rows } = useSnapshot(store.getState(), { sync: true });
    return rowId != null ? rows?.[rowId] : undefined;
}
export function useRow(store) {
    const rowId = useRowId();
    return useRowAtId(store, rowId);
}
export function useValueSetter(store, key) {
    return useCallback((value) => {
        if (store) {
            store.setValue(key, value);
        }
    }, [store, key]);
}
export function useIsStoreDirty(store) {
    const { originalRows, rows, _childDirtyCount } = useSnapshot(store.getState());
    if (_childDirtyCount > 0) {
        return true;
    }
    if (!isEmptyObject(originalRows)) {
        return true;
    }
    return Object.values(rows).some((row) => row._status && row._status !== 'N' && row._status !== 'Q');
}
export function useIsRowDirty(store, id) {
    const { originalRows } = useSnapshot(store.getState());
    return originalRows?.[id] != null;
}
export function useIsRowAttributeDirty(store, id, attribute) {
    const { originalRows, rows } = useSnapshot(store.getState());
    const _orig = originalRows?.[id];
    if (_orig == null) {
        return false;
    }
    const row = rows?.[id];
    const dirty = !areEqualShallow(_orig[attribute], row?.[attribute]);
    return dirty;
}
export function useRowAttributeOriginalValue(store, id, attribute) {
    const { originalRows } = useSnapshot(store.getState());
    const _orig = originalRows?.[id];
    if (_orig == null) {
        return undefined;
    }
    return _orig[attribute];
}
export function useStoreSize(store) {
    const { rowIds } = useSnapshot(store.getState());
    return rowIds.length;
}
export function useStoreRowCount(store) {
    const { totalRowCount } = useSnapshot(store.getState());
    return totalRowCount;
}
export function useSortState(store, key) {
    const { sort } = useSnapshot(store.getState());
    const sortState = useMemo(() => {
        const val = sort
            ? Object.entries(sort)
                .sort((a, b) => a[1] - b[1])
                .map(([k, v], index) => [k, v, index + 1])
                .find(([k]) => k === key)
            : undefined;
        return val ? [val[1], val[2]] : [undefined, undefined];
    }, [sort, key]);
    return sortState;
}
export function useFullSortState(store) {
    const { sort } = useSnapshot(store.getState());
    return sort;
}
export function useIsStoreBusy(store) {
    const { isLoading, isPosting } = useSnapshot(store.getState());
    return isLoading || isPosting;
}
export function useIsStoreLoading(store) {
    const { isLoading } = useSnapshot(store.getState());
    return isLoading;
}
export function useIsStorePosting(store) {
    const { isPosting } = useSnapshot(store.getState());
    return isPosting;
}
export function useStoreError(store) {
    const { error, status } = useSnapshot(store.getState());
    return status === 'error' ? (error ?? 'Unknown error') : undefined;
}
export function usePreQuery(store, preQueryCallback) {
    const callback = useLatest(preQueryCallback);
    useEffect(() => {
        const listener = (query) => {
            return callback.current(query);
        };
        return store.addPreQueryCallback(listener);
    }, [callback, store]);
}
export function useHasMoreRows(store) {
    const { hasMoreRows } = useSnapshot(store.getState());
    return hasMoreRows;
}
export function useIsRowSelected(store, id) {
    const { selected } = useSnapshot(store.getState());
    return selected?.[id] ?? false;
}
export function useSelectedRowIds(store) {
    const { selected } = useSnapshot(store.getState());
    return Object.keys(selected ?? {});
}
export function useIsAllSelected(store) {
    const { selected, rowIds } = useSnapshot(store.getState());
    return selected != null && rowIds != null && Object.keys(selected).length === rowIds.length;
}
export function useSelectedRows(store) {
    const { selected } = useSnapshot(store.getState());
    return Object.keys(selected ?? {}).map(store.row);
}
export function useIsHeaderFilterDirty(store, attribute) {
    const { headerFilters, draftHeaderFilters } = useSnapshot(store.getState());
    const hf = headerFilters?.[attribute];
    const dhf = draftHeaderFilters?.[attribute];
    return !deepEqual(hf, dhf);
}
export function useIsHeaderFilterApplied(store, attribute) {
    const { headerFilters } = useSnapshot(store.getState());
    return headerFilters?.[attribute] != null;
}
const EMPTY_PROXY = proxy({ hideHeaderFilters: true });
export function useIsHeaderFiltersHidden(store) {
    const { hideHeaderFilters } = useSnapshot(store?.getState() ?? EMPTY_PROXY);
    return hideHeaderFilters ?? false;
}
export function useStoreFieldErrors(store) {
    const { fieldErrors } = useSnapshot(store.getState());
    const currentRowId = useCurrentRowId(store);
    return fieldErrors != null && currentRowId != null ? fieldErrors[currentRowId] : undefined;
}
export function useCellErrors(store, rowId, attribute) {
    const { fieldErrors } = useSnapshot(store.getState());
    // @ts-expect-error
    const errorMap = fieldErrors?.[rowId]?.[attribute];
    if (errorMap != null) {
        return Object.values(errorMap).join(', ');
    }
}
export function useStoreOffset(store) {
    const { offset } = useSnapshot(store.getState());
    return offset;
}
//# sourceMappingURL=useStoreHooks.js.map