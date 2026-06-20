/* Copyright (c) 2024-present VENKY Corp. */

import { List } from 'immutable';
import type * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLatest } from '@/components/core/hooks/useLatest';
import { PivotColumnCollapseTreeContextProvider } from '@/components/core/pivot/PivotColumnCollapseTreeContext';
import type { PivotData } from '@/components/core/pivot/PivotData';
import { PivotRowCollapseTreeContextProvider } from '@/components/core/pivot/PivotRowCollapseTreeContext';
import { INITIAL_STATE } from '@/components/core/pivot/PivotStateUtils';
import type { DispatchFn, Filter, PivotColumn, PivotSetting, PivotState } from '@/components/core/pivot/PivotTypes';
import usePivotReducer from '@/components/core/pivot/usePivotReducer';
import { emptyFunction } from '@/lib/core/common/isEmpty';
import stableStringify from 'fast-json-stable-stringify';
import ErrorBoundary from '../common/ErrorBoundary';

const PivotSettingsContext = createContext<PivotSetting<string>>({
  aggregatorName: 'Sum',
  cols: [],
  rows: [],
  values: [],
  density: 'default',
  flattenLayout: false,
  showRowTotals: true,
  showColumnTotals: true,
  showGrandTotal: true,
});

const PivotSettingsSetterContext = createContext<any>(emptyFunction);

export function usePivotSettingsContext<TColumnKey extends string>(): PivotSetting<TColumnKey> {
  return useContext(PivotSettingsContext) as PivotSetting<TColumnKey>;
}

export function usePivotSettingsSetterContext<TColumnKey extends string>(): React.Dispatch<
  React.SetStateAction<PivotSetting<TColumnKey>>
> {
  return useContext(PivotSettingsSetterContext) as React.Dispatch<React.SetStateAction<PivotSetting<TColumnKey>>>;
}

const PivotColumnsContext = createContext<ReadonlyArray<PivotColumn<string>>>([]);

export function usePivotColumnsContext<TColumnKey extends string>(): ReadonlyArray<PivotColumn<TColumnKey>> {
  return useContext(PivotColumnsContext) as ReadonlyArray<PivotColumn<TColumnKey>>;
}

const PivotUpdateColumnWidthContext = createContext<any>(emptyFunction);

export function usePivotUpdateColumnWidthContext<TColumnKey extends string>(): (
  columnKey: TColumnKey,
  newWidth: number,
) => void {
  return useContext(PivotUpdateColumnWidthContext) as (columnKey: TColumnKey, newWidth: number) => void;
}

const PivotUpdateCalculatedColumnWidthContext = createContext<any>(emptyFunction);

export function usePivotUpdateCalculatedColumnWidthContext<_TColumnKey extends string = string>(): (
  calculatedColumnId: string,
  newWidth: number,
) => void {
  return useContext(PivotUpdateCalculatedColumnWidthContext) as (calculatedColumnId: string, newWidth: number) => void;
}

const PivotDataContext = createContext<any>(null);

const PivotStateContext = createContext<any>(INITIAL_STATE());

export function usePivotState<TColumnKey extends string, TItem>(): PivotState<TColumnKey, TItem> {
  return useContext(PivotStateContext) as PivotState<TColumnKey, TItem>;
}

const PivotHeaderContext = createContext<any>([]);

export function usePivotHeader(): ReadonlyArray<ReadonlyArray<string>> {
  return useContext<ReadonlyArray<ReadonlyArray<string>>>(PivotHeaderContext);
}

const PivotRowsContext = createContext<ReadonlyArray<ReadonlyArray<string | Array<string>>>>([]);

export function usePivotRows(): ReadonlyArray<ReadonlyArray<string | Array<string>>> {
  return useContext<ReadonlyArray<ReadonlyArray<string | Array<string>>>>(PivotRowsContext);
}

const PivotDraftPowerSearchFiltersContext = createContext<List<Filter>>(List());

export function usePivotDraftPowerSearchFilters(): List<Filter> {
  return useContext(PivotDraftPowerSearchFiltersContext);
}

const PivotStateGetterContext = createContext<any>(() => INITIAL_STATE());

export function usePivotStateGetter<TColumnKey extends string, TItem>(): () => PivotState<TColumnKey, TItem> {
  return useContext(PivotStateGetterContext) as () => PivotState<TColumnKey, TItem>;
}

export function usePivotDataContext<TColumnKey extends string, TItem>(): PivotData<TColumnKey, TItem> {
  return useContext(PivotDataContext) as PivotData<TColumnKey, TItem>;
}

const PivotDataDispatcherContext = createContext<any>(emptyFunction);

export function usePivotDispatcher<TColumnKey extends string, TItem>(): DispatchFn<TColumnKey, TItem> {
  return useContext(PivotDataDispatcherContext) as DispatchFn<TColumnKey, TItem>;
}

export function PivotContextProvider<TColumnKey extends string, TItem>({
  children,
  columns,
  initialSettings,
  onSettingsChange,
}: {
  children: React.ReactNode;
  columns: ReadonlyArray<PivotColumn<TColumnKey>>;
  initialSettings: PivotSetting<TColumnKey>;
  onSettingsChange?: (settings: PivotSetting<TColumnKey>) => void;
}) {
  const [state, dispatch] = usePivotReducer<TColumnKey, TItem>();
  const [settings, setSettings] = useState<PivotSetting<TColumnKey>>(initialSettings);

  const stateRef = useLatest<PivotState<TColumnKey, TItem>>(state);
  const onSettingChangeRef = useLatest<((settings: PivotSetting<TColumnKey>) => void) | undefined>(onSettingsChange);

  const latestSettings = useLatest(initialSettings);
  useEffect(() => {
    if (stableStringify(settings) !== stableStringify(latestSettings.current)) {
      onSettingChangeRef.current?.(settings);
    }
  }, [onSettingChangeRef, settings, latestSettings]);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const [_columns, setColumns] = useState<ReadonlyArray<PivotColumn<TColumnKey>>>(columns);

  useEffect(() => {
    setColumns(columns);
  }, [columns]);

  const updateColumnWidth = useCallback((key: TColumnKey, newWidth: number) => {
    setSettings((prev) => ({
      ...prev,
      columnWidths: { ...prev.columnWidths, [key]: newWidth },
    }));
  }, []);

  const updateCalculatedColumnWidth = useCallback((calculatedColumnId: string, newWidth: number) => {
    setSettings((prev) => ({
      ...prev,
      calculatedColumns:
        prev.calculatedColumns?.map((c) => (c.id === calculatedColumnId ? { ...c, width: newWidth } : c)) ?? [],
    }));
  }, []);

  const getState = useCallback(() => {
    return stateRef.current;
  }, [stateRef]);

  return (
    <PivotSettingsSetterContext value={setSettings}>
      <PivotDataDispatcherContext value={dispatch}>
        <PivotColumnsContext value={_columns}>
          <PivotUpdateColumnWidthContext value={updateColumnWidth}>
            <PivotUpdateCalculatedColumnWidthContext value={updateCalculatedColumnWidth}>
              <PivotSettingsContext value={settings}>
                <PivotDataContext value={state.pivot}>
                  <PivotRowCollapseTreeContextProvider totalRows={state.totalRows} tree={state.rowTree}>
                    <PivotColumnCollapseTreeContextProvider totalColumns={state.totalColumns} tree={state.columnTree}>
                      <PivotStateGetterContext value={getState}>
                        <PivotStateContext value={state}>
                          <PivotHeaderContext value={state.header}>
                            <PivotRowsContext value={state.rows}>
                              <PivotDraftPowerSearchFiltersContext value={state.draftPowerSearchFilters}>
                                <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
                                  {children}
                                </ErrorBoundary>
                              </PivotDraftPowerSearchFiltersContext>
                            </PivotRowsContext>
                          </PivotHeaderContext>
                        </PivotStateContext>
                      </PivotStateGetterContext>
                    </PivotColumnCollapseTreeContextProvider>
                  </PivotRowCollapseTreeContextProvider>
                </PivotDataContext>
              </PivotSettingsContext>
            </PivotUpdateCalculatedColumnWidthContext>
          </PivotUpdateColumnWidthContext>
        </PivotColumnsContext>
      </PivotDataDispatcherContext>
    </PivotSettingsSetterContext>
  );
}
