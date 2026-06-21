import { jsx as _jsx } from 'react/jsx-runtime';
/* Copyright (c) 2024-present VENKY Corp. */
import { List } from 'immutable';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLatest } from '../../../components/core/hooks/useLatest';
import { PivotColumnCollapseTreeContextProvider } from '../../../components/core/pivot/PivotColumnCollapseTreeContext';
import { PivotRowCollapseTreeContextProvider } from '../../../components/core/pivot/PivotRowCollapseTreeContext';
import { INITIAL_STATE } from '../../../components/core/pivot/PivotStateUtils';
import usePivotReducer from '../../../components/core/pivot/usePivotReducer';
import { emptyFunction } from '../../../lib/core/common/isEmpty';
import stableStringify from 'fast-json-stable-stringify';
import ErrorBoundary from '../common/ErrorBoundary';
const PivotSettingsContext = createContext({
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
const PivotSettingsSetterContext = createContext(emptyFunction);
export function usePivotSettingsContext() {
  return useContext(PivotSettingsContext);
}
export function usePivotSettingsSetterContext() {
  return useContext(PivotSettingsSetterContext);
}
const PivotColumnsContext = createContext([]);
export function usePivotColumnsContext() {
  return useContext(PivotColumnsContext);
}
const PivotUpdateColumnWidthContext = createContext(emptyFunction);
export function usePivotUpdateColumnWidthContext() {
  return useContext(PivotUpdateColumnWidthContext);
}
const PivotUpdateCalculatedColumnWidthContext = createContext(emptyFunction);
export function usePivotUpdateCalculatedColumnWidthContext() {
  return useContext(PivotUpdateCalculatedColumnWidthContext);
}
const PivotDataContext = createContext(null);
const PivotStateContext = createContext(INITIAL_STATE());
export function usePivotState() {
  return useContext(PivotStateContext);
}
const PivotHeaderContext = createContext([]);
export function usePivotHeader() {
  return useContext(PivotHeaderContext);
}
const PivotRowsContext = createContext([]);
export function usePivotRows() {
  return useContext(PivotRowsContext);
}
const PivotDraftPowerSearchFiltersContext = createContext(List());
export function usePivotDraftPowerSearchFilters() {
  return useContext(PivotDraftPowerSearchFiltersContext);
}
const PivotStateGetterContext = createContext(() => INITIAL_STATE());
export function usePivotStateGetter() {
  return useContext(PivotStateGetterContext);
}
export function usePivotDataContext() {
  return useContext(PivotDataContext);
}
const PivotDataDispatcherContext = createContext(emptyFunction);
export function usePivotDispatcher() {
  return useContext(PivotDataDispatcherContext);
}
export function PivotContextProvider({ children, columns, initialSettings, onSettingsChange }) {
  const [state, dispatch] = usePivotReducer();
  const [settings, setSettings] = useState(initialSettings);
  const stateRef = useLatest(state);
  const onSettingChangeRef = useLatest(onSettingsChange);
  const latestSettings = useLatest(initialSettings);
  useEffect(() => {
    if (stableStringify(settings) !== stableStringify(latestSettings.current)) {
      onSettingChangeRef.current?.(settings);
    }
  }, [onSettingChangeRef, settings, latestSettings]);
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);
  const [_columns, setColumns] = useState(columns);
  useEffect(() => {
    setColumns(columns);
  }, [columns]);
  const updateColumnWidth = useCallback((key, newWidth) => {
    setSettings((prev) => ({
      ...prev,
      columnWidths: { ...prev.columnWidths, [key]: newWidth },
    }));
  }, []);
  const updateCalculatedColumnWidth = useCallback((calculatedColumnId, newWidth) => {
    setSettings((prev) => ({
      ...prev,
      calculatedColumns:
        prev.calculatedColumns?.map((c) => (c.id === calculatedColumnId ? { ...c, width: newWidth } : c)) ?? [],
    }));
  }, []);
  const getState = useCallback(() => {
    return stateRef.current;
  }, [stateRef]);
  return _jsx(PivotSettingsSetterContext, {
    value: setSettings,
    children: _jsx(PivotDataDispatcherContext, {
      value: dispatch,
      children: _jsx(PivotColumnsContext, {
        value: _columns,
        children: _jsx(PivotUpdateColumnWidthContext, {
          value: updateColumnWidth,
          children: _jsx(PivotUpdateCalculatedColumnWidthContext, {
            value: updateCalculatedColumnWidth,
            children: _jsx(PivotSettingsContext, {
              value: settings,
              children: _jsx(PivotDataContext, {
                value: state.pivot,
                children: _jsx(PivotRowCollapseTreeContextProvider, {
                  totalRows: state.totalRows,
                  tree: state.rowTree,
                  children: _jsx(PivotColumnCollapseTreeContextProvider, {
                    totalColumns: state.totalColumns,
                    tree: state.columnTree,
                    children: _jsx(PivotStateGetterContext, {
                      value: getState,
                      children: _jsx(PivotStateContext, {
                        value: state,
                        children: _jsx(PivotHeaderContext, {
                          value: state.header,
                          children: _jsx(PivotRowsContext, {
                            value: state.rows,
                            children: _jsx(PivotDraftPowerSearchFiltersContext, {
                              value: state.draftPowerSearchFilters,
                              children: _jsx(ErrorBoundary, {
                                showDetails: process.env.NODE_ENV === 'development',
                                children: children,
                              }),
                            }),
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  });
}
//# sourceMappingURL=PivotContext.js.map
