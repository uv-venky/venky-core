/* Copyright (c) 2024-present VENKY Corp. */

import { cn } from '@/lib/utils';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from '@/components/core/common/EmptyState';
import useAutoSizer from '@/components/core/hooks/useAutoSizer';
import { useTableVariant } from '@/components/core/hooks/useTableVariant';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';
import { usePivotTotalColumns } from '@/components/core/pivot/PivotColumnCollapseTreeContext';
import {
  usePivotColumnsContext,
  usePivotDataContext,
  usePivotDispatcher,
  usePivotHeader,
  usePivotRows,
  usePivotSettingsContext,
  usePivotSettingsSetterContext,
  usePivotState,
} from '@/components/core/pivot/PivotContext';
import type { Sorters } from '@/components/core/pivot/PivotData';
import { PivotData } from '@/components/core/pivot/PivotData';
import PivotMultiGrid from '@/components/core/pivot/PivotMultiGrid';
import { usePivotTotalRows } from '@/components/core/pivot/PivotRowCollapseTreeContext';
import { PivotSearchAsyncSourceMap } from '@/components/core/pivot/PivotSearchAsyncSource';
import type {
  CellProps,
  CellXStyleCallback,
  Density,
  PivotItemDataInternal,
  PivotSetting,
} from '@/components/core/pivot/PivotTypes';
import { DENSITY_PROPS, ROW_SPAN } from '@/components/core/pivot/PivotTypes';
import SimplePivotTableBodyCell from '@/components/core/pivot/SimplePivotTableBodyCell';
import SimplePivotTableFooterCell from '@/components/core/pivot/SimplePivotTableFooterCell';
import SimplePivotTableHeaderCell from '@/components/core/pivot/SimplePivotTableHeaderCell';
import usePivotColumnCollapse from '@/components/core/pivot/usePivotColumnCollapse';
import usePivotRowCollapse from '@/components/core/pivot/usePivotRowCollapse';
import type { AggregatorNames } from '@/components/core/pivot/PivotUtils';
import { showError } from '@/components/core/common/Notification';

const styles = {
  tableContainer: 'h-full w-full flex-1 absolute inset-0',
};

const EMPTY_OBJECT = {};

export type SimplePivotTableProps<Item, ColumnKey extends string> = {
  CellRenderer?: React.ComponentType<CellProps<Item, ColumnKey>>;
  data: ReadonlyArray<Readonly<Item>>;
  disableSort?: boolean;
  emptyStateSubtitle?: string;
  emptyStateTitle?: string;
  getCellStyle?: CellXStyleCallback<ColumnKey, Item>;
  getNumberValue: (item: Readonly<Item>, field: ColumnKey) => number;
  getTextValue: (item: Readonly<Item>, field: ColumnKey) => string;
  grayedOutSummaryCells?: boolean;
  hideBorders?: boolean;
  hideExpandCollapseIcons?: boolean;
  hideFilters?: boolean;
  hideZeroValues?: boolean;
  initialCollapsed: boolean;
  initialColumnCollapsed?: boolean;
  initialRowCollapsed?: boolean;
  /** Maximum footer height in pixels. Defaults to 40% of total height. When the footer overflows, a scrollbar and resize handle appear. */
  maxFooterHeight?: number;
  onFooterCellClick?: (formattedValue: string | Array<string>, context: Partial<Record<ColumnKey, string>>) => void;
  onValueCellClick?: (formattedValue: string | Array<string>, context: Partial<Record<ColumnKey, string>>) => void;
  onRowCellClick?: (columnKey: ColumnKey, value: string, context: Partial<Record<ColumnKey, string>>) => void;
  removeColumnLines?: boolean;
  removeRowLines?: boolean;
  rowHeight?: (density: Density) => number;
  showColumnTotals?: boolean;
  showRowTotals?: boolean;
  /** When false, hides the grand total cell (default true). */
  showGrandTotal?: boolean;
  /**
   * Per-field sort configuration.
   * - function: fully custom comparator
   * - 1: ascending (date-like values sort chronologically)
   * - -1: descending (date-like values sort chronologically)
   */
  sorters?: Sorters<ColumnKey>;
  getTotalLabel?: (props: {
    aggregatorName: AggregatorNames;
    defaultLabel: string;
    values: Array<ColumnKey>;
    location: 'header' | 'footer';
  }) => string;
};

export function SimplePivotTable<Item, ColumnKey extends string>(props: SimplePivotTableProps<Item, ColumnKey>) {
  useWhyDidYouUpdate('SimplePivotTable', props);
  const {
    CellRenderer,
    data,
    disableSort = false,
    emptyStateSubtitle = 'Use the smart search to fetch the data',
    emptyStateTitle = 'No pivot data available',
    getCellStyle,
    getNumberValue,
    getTextValue,
    grayedOutSummaryCells = false,
    hideBorders = false,
    hideExpandCollapseIcons = false,
    hideFilters = false,
    hideZeroValues = true,
    initialCollapsed = false,
    initialColumnCollapsed = false,
    initialRowCollapsed = false,
    maxFooterHeight,
    onFooterCellClick,
    onValueCellClick,
    onRowCellClick,
    removeColumnLines = false,
    removeRowLines = false,
    rowHeight,
    showColumnTotals,
    showRowTotals,
    showGrandTotal,
    sorters = EMPTY_OBJECT,
    getTotalLabel,
  } = props;
  const columns = usePivotColumnsContext<ColumnKey>();
  const settings = usePivotSettingsContext<ColumnKey>();
  const setSettings = usePivotSettingsSetterContext<ColumnKey>();
  const prevPivotRef = useRef<PivotData<ColumnKey, Item> | null>(null);
  const prevSettingRef = useRef<PivotSetting<ColumnKey>>(settings);
  const dispatch = usePivotDispatcher<ColumnKey, Item>();
  const pivot = usePivotDataContext<ColumnKey, Item>();
  const [filters, setFilters] = useState<Partial<Record<ColumnKey, Array<string>>>>({});
  const { width, height, Container } = useAutoSizer();

  const searchSourceMap = useMemo(() => {
    return new PivotSearchAsyncSourceMap<Item, ColumnKey>(data, getTextValue);
  }, [data, getTextValue]);

  const getValueLabel = useCallback(
    (valueKey: ColumnKey) => {
      const column = columns.find((c) => c.key === valueKey);
      return column?.label ?? valueKey;
    },
    [columns],
  );

  const getAllowDecimals = useCallback(
    (valueKey: ColumnKey) => {
      const column = columns.find((c) => c.key === valueKey);
      return column?.allowDecimals;
    },
    [columns],
  );

  const totalRows = usePivotTotalRows();
  const totalColumns = usePivotTotalColumns();
  const rawHeader = usePivotHeader();
  const tableRows = usePivotRows();

  const header = useMemo(() => {
    if (rawHeader.length !== 1 || hideExpandCollapseIcons) return rawHeader;
    const extraRow: string[] = rawHeader[0].map(() => ROW_SPAN);
    return [...rawHeader, extraRow];
  }, [rawHeader, hideExpandCollapseIcons]);

  const effectiveShowRowTotals = showRowTotals ?? settings.showRowTotals ?? true;
  const effectiveShowColumnTotals = showColumnTotals ?? settings.showColumnTotals ?? true;
  const effectiveShowGrandTotal = showGrandTotal ?? settings.showGrandTotal ?? true;

  useEffect(() => {
    const {
      aggregatorName,
      cols,
      measure,
      rows,
      sort,
      values,
      valueAggregators,
      flattenLayout,
      calculatedColumns,
      valuesPosition,
      columnsBeforeValues,
    } = settings;

    const prevSettings = prevSettingRef.current;
    let _pivot = prevPivotRef.current;
    let pivotChanged = false;
    // do not recompute the pivot if the only change is in the sort
    if (
      !_pivot ||
      aggregatorName !== prevSettings.aggregatorName ||
      cols !== prevSettings.cols ||
      data !== _pivot.config.data ||
      filters !== _pivot.config.filters ||
      getNumberValue !== _pivot.config.getNumberValue ||
      getTextValue !== _pivot.config.getTextValue ||
      getValueLabel !== _pivot.config.getValueLabel ||
      getAllowDecimals !== _pivot.config.getAllowDecimals ||
      hideZeroValues !== _pivot.config.hideZeroValues ||
      measure !== prevSettings.measure ||
      rows !== prevSettings.rows ||
      effectiveShowColumnTotals !== _pivot.config.showColumnTotals ||
      effectiveShowRowTotals !== _pivot.config.showRowTotals ||
      effectiveShowGrandTotal !== _pivot.config.showGrandTotal ||
      sorters !== _pivot.config.sorters ||
      values !== prevSettings.values ||
      valueAggregators !== prevSettings.valueAggregators ||
      flattenLayout !== prevSettings.flattenLayout ||
      getTotalLabel !== _pivot.config.getTotalLabel ||
      JSON.stringify(calculatedColumns) !== JSON.stringify(_pivot.config.calculatedColumns) ||
      valuesPosition !== prevSettings.valuesPosition ||
      columnsBeforeValues !== prevSettings.columnsBeforeValues
    ) {
      _pivot = new PivotData<ColumnKey, Item>({
        aggregatorName,
        valueAggregators,
        cols,
        data,
        filters,
        getNumberValue,
        getTextValue,
        getValueLabel,
        getAllowDecimals,
        hideZeroValues,
        measure,
        rows,
        showColumnTotals: effectiveShowColumnTotals,
        showRowTotals: effectiveShowRowTotals,
        showGrandTotal: effectiveShowGrandTotal,
        sorters,
        values,
        getTotalLabel,
        flattenLayout,
        calculatedColumns,
        valuesPosition,
        columnsBeforeValues,
      });
      if (_pivot.getColKeys().length > 500) {
        showError(
          `This configuration results in ${_pivot.getColKeys().length} columns, which is too many to render in the UI. Reverting to previous settings.`,
        );
        setSettings(prevSettingRef.current);
        return;
      }
      prevPivotRef.current = _pivot;
      pivotChanged = true;
    }
    prevSettingRef.current = settings;

    const sortChanged = _pivot.config.sort !== sort;
    const sorted = _pivot.doSort(sort);
    if (pivotChanged || sorted) {
      dispatch({
        type: 'setPivot',
        pivot: _pivot,
        initialCollapsed,
        initialColumnCollapsed,
        sortChanged,
        initialRowCollapsed,
      });
    }
  }, [
    dispatch,
    data,
    filters,
    getNumberValue,
    getTextValue,
    getValueLabel,
    getAllowDecimals,
    hideZeroValues,
    setSettings,
    settings,
    effectiveShowColumnTotals,
    effectiveShowGrandTotal,
    effectiveShowRowTotals,
    initialRowCollapsed,
    sorters,
    initialCollapsed,
    initialColumnCollapsed,
    getTotalLabel,
  ]);

  const globalVariant = useTableVariant();
  const density = settings.density ?? (globalVariant as Density);

  const hideBodyBottomBorder =
    hideBorders && DENSITY_PROPS[density].rowHeight * (totalRows - header.length - 1) >= height;

  const { isColumnCollapsed, getActualColumnIndex } = usePivotColumnCollapse();

  const { getActualRowIndex, isRowCollapsed } = usePivotRowCollapse();

  usePivotState<ColumnKey, Item>();

  const pivotItemData = useMemo(() => {
    const data: PivotItemDataInternal<ColumnKey, Item> | null =
      pivot == null
        ? null
        : {
            dispatch,
            CellRenderer,
            columns,
            density,
            disableSort,
            getActualColumnIndex,
            getActualRowIndex,
            getCellStyle,
            grayedOutSummaryCells,
            header,
            hideBodyBottomBorder,
            hideBorders,
            hideExpandCollapseIcons,
            hideFilters,
            isColumnCollapsed,
            isRowCollapsed,
            onFooterCellClick,
            onValueCellClick,
            onRowCellClick,
            pivot,
            removeColumnLines,
            removeRowLines,
            rows: tableRows,
            searchSourceMap,
            filters,
            setFilters,
          };
    return data;
  }, [
    dispatch,
    CellRenderer,
    columns,
    density,
    disableSort,
    getActualColumnIndex,
    getActualRowIndex,
    getCellStyle,
    grayedOutSummaryCells,
    hideBodyBottomBorder,
    hideBorders,
    hideExpandCollapseIcons,
    hideFilters,
    isColumnCollapsed,
    isRowCollapsed,
    onFooterCellClick,
    onValueCellClick,
    onRowCellClick,
    pivot,
    removeColumnLines,
    removeRowLines,
    searchSourceMap,
    filters,
    header,
    tableRows,
  ]);

  const { measure, rows, cols, values, valuesPosition, calculatedColumns, columnsBeforeValues } = pivot?.config ?? {};
  const valuesInRows = valuesPosition === 'rows' && (values?.length ?? 0) > 1;
  const fixedColumnCount = (rows?.length ?? 0) + (measure != null ? 1 : 0) + (valuesInRows ? 1 : 0);
  const columnWidths = settings.columnWidths;
  // When cols is empty, values are bundled into a single cell, not separate columns
  const noColumnDimensions = (cols?.length ?? 0) === 0;
  // When columnsBeforeValues is true: for each value, show column dimensions (use values-before-cols layout)
  const valuesBeforeCols =
    !valuesInRows &&
    columnsBeforeValues !== false &&
    !noColumnDimensions &&
    ((values?.length ?? 0) > 1 || (calculatedColumns?.length ?? 0) > 0);

  /** Row dimension labels (Region, Category) need space; compact density scales to ~85%. */
  const ROW_LABEL_DEFAULT_WIDTH = 150;
  const DATA_COLUMN_DEFAULT_WIDTH = 200;
  /** Value columns display "Aggregator of Label" (e.g. "Sum of Quantity") and need more width. */
  const VALUE_COLUMN_DEFAULT_WIDTH = 240;
  /** Calculated column headers (e.g. "Avg Price") need adequate width. */
  const CALC_COLUMN_DEFAULT_WIDTH = 150;

  const getEffectiveWidth = useCallback(
    (colKey: ColumnKey, defaultWidth = DATA_COLUMN_DEFAULT_WIDTH, skipDensityShrink = false) => {
      const baseWidth = columnWidths?.[colKey] ?? columns.find((c) => c.key === colKey)?.width ?? defaultWidth;
      const multiplier = skipDensityShrink ? 1 : DENSITY_PROPS[density].columnWidthPercent;
      return baseWidth * multiplier;
    },
    [columnWidths, columns, density],
  );

  const getColumnWidth = useCallback(
    (index: number) => {
      if (rows == null) {
        return 0;
      }
      if (index < rows.length) {
        return getEffectiveWidth(rows[index], ROW_LABEL_DEFAULT_WIDTH, true);
      }
      if (index === rows.length && measure != null) {
        return getEffectiveWidth(measure, ROW_LABEL_DEFAULT_WIDTH, true);
      }
      if (valuesInRows && index === rows.length + (measure != null ? 1 : 0)) {
        // "Values" column when values are in rows
        const valuesColKey = values?.[0];
        return valuesColKey != null
          ? getEffectiveWidth(valuesColKey, VALUE_COLUMN_DEFAULT_WIDTH)
          : VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
      } else if (index >= fixedColumnCount) {
        // Scrollable data columns (value columns + calculated columns per colKey)
        const scrollableIndex = index - fixedColumnCount;
        const colKeysLength = pivot?.getColKeys().length ?? 0;
        const valuesLength = values?.length ?? 0;
        const calcLen = calculatedColumns?.length ?? 0;

        // When valuesBeforeCols, column order follows getDataColumnSequence
        if (valuesBeforeCols && pivot != null) {
          const seq = pivot.getDataColumnSequence();
          if (scrollableIndex < seq.length) {
            const entry = seq[scrollableIndex];
            if (entry.valueIdx !== undefined && values != null) {
              const valueKey = values[entry.valueIdx];
              return valueKey != null
                ? getEffectiveWidth(valueKey, VALUE_COLUMN_DEFAULT_WIDTH)
                : VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
            }
            if (entry.calcIdx !== undefined && calculatedColumns != null) {
              const calcCol = calculatedColumns[entry.calcIdx];
              return (calcCol?.width ?? CALC_COLUMN_DEFAULT_WIDTH) * DENSITY_PROPS[density].columnWidthPercent;
            }
          }
        }

        // When there are no column dimensions (cols: []), values are bundled into
        // a single cell, so the grid has: 1 bundled-values column + N calc columns.
        // When valuesInRows, calculated columns are rows not columns, so perBlock = 1.
        if (noColumnDimensions && !valuesInRows) {
          if (scrollableIndex === 0) {
            let w = 0;
            values?.forEach((v) => {
              w += columnWidths?.[v] ?? columns.find((c) => c.key === v)?.width ?? VALUE_COLUMN_DEFAULT_WIDTH;
            });
            return w * DENSITY_PROPS[density].columnWidthPercent;
          }
          if (scrollableIndex > 0 && scrollableIndex <= calcLen) {
            const calcCol = calculatedColumns?.[scrollableIndex - 1];
            return (calcCol?.width ?? CALC_COLUMN_DEFAULT_WIDTH) * DENSITY_PROPS[density].columnWidthPercent;
          }
          return VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
        }

        const perBlock = valuesInRows ? 1 : valuesLength + calcLen;
        const totalDataColumns = perBlock > 0 ? colKeysLength * perBlock : 0;
        const showRowTotals = settings.showRowTotals !== false && (cols?.length ?? 0) > 0;

        if (perBlock > 0) {
          if (scrollableIndex < totalDataColumns) {
            const columnInBlock = scrollableIndex % perBlock;
            const valueColsInBlock = valuesInRows ? 1 : valuesLength;
            if (columnInBlock < valueColsInBlock) {
              const valueKey = values?.[valuesInRows ? 0 : columnInBlock];
              return valueKey != null
                ? getEffectiveWidth(valueKey, VALUE_COLUMN_DEFAULT_WIDTH)
                : VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
            }
            const calcCol = calculatedColumns?.[columnInBlock - valueColsInBlock];
            return (calcCol?.width ?? CALC_COLUMN_DEFAULT_WIDTH) * DENSITY_PROPS[density].columnWidthPercent;
          }
          // Row totals column(s): first column shows all value totals in one cell; width = sum of value column widths
          if (showRowTotals && scrollableIndex >= totalDataColumns) {
            const totalBlockIndex = scrollableIndex - totalDataColumns;

            // When values are shown as rows, each row total column should match
            // the width of a single value/calculated column, not the sum of all.
            if (valuesInRows) {
              if (totalBlockIndex === 0) {
                const firstValueKey = values?.[0];
                return firstValueKey != null
                  ? getEffectiveWidth(firstValueKey, VALUE_COLUMN_DEFAULT_WIDTH)
                  : VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
              }
              const calcCol = calculatedColumns?.[totalBlockIndex - 1];
              if (calcCol) {
                return (calcCol.width ?? CALC_COLUMN_DEFAULT_WIDTH) * DENSITY_PROPS[density].columnWidthPercent;
              }
            } else {
              // Expanded Total: individual columns (one per value, one per calc)
              if (totalBlockIndex < valuesLength) {
                const valueKey = values?.[totalBlockIndex];
                return valueKey != null
                  ? getEffectiveWidth(valueKey, VALUE_COLUMN_DEFAULT_WIDTH)
                  : VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
              }
              const calcCol = calculatedColumns?.[totalBlockIndex - valuesLength];
              if (calcCol) {
                return (calcCol.width ?? CALC_COLUMN_DEFAULT_WIDTH) * DENSITY_PROPS[density].columnWidthPercent;
              }
            }
          }
        }
        let w = 0;
        values?.forEach((v) => {
          w += columnWidths?.[v] ?? columns.find((c) => c.key === v)?.width ?? VALUE_COLUMN_DEFAULT_WIDTH;
        });
        if (!valuesInRows) {
          calculatedColumns?.forEach((c) => {
            w += c.width ?? CALC_COLUMN_DEFAULT_WIDTH;
          });
        }
        return w * DENSITY_PROPS[density].columnWidthPercent;
      } else {
        // When values are in rows, each data cell is a single value, not multiple
        if (valuesInRows) {
          const firstValueKey = values?.[0];
          return firstValueKey != null
            ? getEffectiveWidth(firstValueKey, VALUE_COLUMN_DEFAULT_WIDTH)
            : VALUE_COLUMN_DEFAULT_WIDTH * DENSITY_PROPS[density].columnWidthPercent;
        }
        let w = 0;
        values?.forEach((v) => {
          w += columnWidths?.[v] ?? columns.find((c) => c.key === v)?.width ?? VALUE_COLUMN_DEFAULT_WIDTH;
        });
        return w * DENSITY_PROPS[density].columnWidthPercent;
      }
    },
    [
      columns,
      density,
      measure,
      rows,
      values,
      valuesInRows,
      valuesBeforeCols,
      pivot,
      calculatedColumns,
      fixedColumnCount,
      columnWidths,
      getEffectiveWidth,
      noColumnDimensions,
      settings.showRowTotals,
      cols,
    ],
  );

  const rowHeightValue = rowHeight?.(density) ?? DENSITY_PROPS[density].rowHeight;

  return (
    <Container className={cn(styles.tableContainer)}>
      {pivot &&
        pivotItemData &&
        width > 0 &&
        height > 0 &&
        (totalRows > 0 ? (
          <PivotMultiGrid
            BodyCell={SimplePivotTableBodyCell}
            data={pivotItemData}
            fixedColumnCount={(pivot.rowKeys[0]?.length ?? 0) + (valuesInRows ? 1 : 0)}
            FooterCell={SimplePivotTableFooterCell}
            footerRows={
              effectiveShowColumnTotals
                ? valuesInRows
                  ? (values?.length ?? 0) + (calculatedColumns?.length ?? 0)
                  : 1
                : 0
            }
            getColumnWidth={getColumnWidth}
            HeaderCell={SimplePivotTableHeaderCell}
            headerRows={header.length}
            height={height}
            key={`${density}-${rowHeightValue}`}
            maxFooterHeight={maxFooterHeight}
            rowHeight={rowHeightValue}
            totalColumns={totalColumns}
            totalRows={totalRows}
            width={width}
          />
        ) : (
          <EmptyState title={emptyStateTitle} description={emptyStateSubtitle} icon="pivot" />
        ))}
    </Container>
  );
}
