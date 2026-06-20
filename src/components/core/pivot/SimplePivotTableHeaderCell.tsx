/* Copyright (c) 2024-present VENKY Corp. */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import React, { type CSSProperties, memo, useCallback, useMemo, useState } from 'react';
import ExpandCollapseIcon from '@/components/core/pivot/ExpandCollapseIcon';
import {
  usePivotSettingsContext,
  usePivotSettingsSetterContext,
  usePivotUpdateColumnWidthContext,
  usePivotUpdateCalculatedColumnWidthContext,
} from '@/components/core/pivot/PivotContext';
import PivotSettings from '@/components/core/pivot/PivotSettings';
import type { ItemData, PivotColumn, PivotItemDataInternal, SortDirection } from '@/components/core/pivot/PivotTypes';
import { COL_SPAN, COL_VALUE_SPAN, ROW_SPAN } from '@/components/core/pivot/PivotTypes';
import { makePivotItemData, totalLabel } from '@/components/core/pivot/PivotUtils';
import {
  SimplePivotTableCell,
  alignmentStyles,
  fontStyles,
  paddingStyles,
} from '@/components/core/pivot/SimplePivotTableCell';
import SortMenu from '@/components/core/common/SortMenu';
import ResizeHandler from '@/components/core/common/ResizeHandler';
import PivotSearchableMultiSelector from '@/components/core/pivot/PivotSearchableMultiSelector';

const styles = {
  wrapper: 'flex overflow-hidden h-full box-border',
  outer: 'overflow-hidden text-ellipsis whitespace-nowrap box-border',
  cell: 'block w-full overflow-hidden text-ellipsis whitespace-nowrap box-border',
  borderLeft: 'border-l',
  flexGrow: 'flex-grow',
  ellipsis: 'overflow-hidden text-ellipsis',
  dragHandlePlaceHolder: 'w-4 h-full ml-2',
  dragHandle: 'absolute right-0 top-0 bottom-0',
  dragHandleBar: 'w-4 h-full',
  hoveredDragHandle: 'bg-highlight-cell-background',
  activeDragHandle: 'bg-highlight-cell-background',
};

function isArrayEqual(a: Array<string>, b: Array<string>): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function SimplePivotTableHeaderCell<ColumnKey extends string, Item>({
  columnIndex,
  data,
  isScrolling,
  rowIndex,
  style,
}: {
  columnIndex: number;
  data: ItemData<PivotItemDataInternal<ColumnKey, Item>>;
  isScrolling?: boolean;
  rowIndex: number;
  style: CSSProperties;
}) {
  const settings = usePivotSettingsContext<ColumnKey>();
  const setSettings = usePivotSettingsSetterContext<ColumnKey>();
  const updateColumnWidth = usePivotUpdateColumnWidthContext<ColumnKey>();
  const updateCalculatedColumnWidth = usePivotUpdateCalculatedColumnWidthContext<ColumnKey>();
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const {
    columns,
    dispatch,
    density,
    disableSort,
    getActualColumnIndex,
    getCellStyle,
    header,
    hideBorders,
    hideExpandCollapseIcons,
    hideFilters,
    isColumnCollapsed,
    pivot,
    removeColumnLines,
    removeRowLines,
    searchSourceMap,
    filters,
    setFilters,
  } = data.data;
  const actualColumnIndex = getActualColumnIndex(columnIndex + data.startColumnIndex);

  const {
    rows: configRows,
    cols: configCols,
    measure: configMeasure,
    valuesPosition: configValuesPosition,
    values: configValues,
    calculatedColumns: configCalcCols,
  } = pivot?.config ?? {};
  const valuesInRowsConfig = configValuesPosition === 'rows' && (configValues?.length ?? 0) > 1;
  const fixedColumnCount = (configRows?.length ?? 0) + (configMeasure != null ? 1 : 0) + (valuesInRowsConfig ? 1 : 0);
  const noColumnDimensions = (configCols?.length ?? 0) === 0;
  const headerValue = pivot ? header[rowIndex]?.[actualColumnIndex] : undefined;
  const dataColumnResize = useMemo(() => {
    if (
      !pivot ||
      data.startColumnIndex === 0 ||
      rowIndex !== header.length - 1 ||
      actualColumnIndex < fixedColumnCount ||
      headerValue === ROW_SPAN ||
      headerValue === COL_SPAN ||
      headerValue === COL_VALUE_SPAN
    ) {
      return null;
    }
    const scrollableIndex = actualColumnIndex - fixedColumnCount;
    const valuesLength = configValues?.length ?? 0;
    const calcLen = configCalcCols?.length ?? 0;

    // When there are no column dimensions, values are bundled into one cell
    if (noColumnDimensions && !valuesInRowsConfig) {
      const perBlock = 1 + calcLen;
      if (perBlock <= 0) return null;
      const columnInBlock = scrollableIndex % perBlock;
      if (columnInBlock === 0) {
        // Bundled values column - don't allow resizing individual values,
        // could potentially allow resizing the whole bundle in future
        return null;
      }
      // Calculated columns
      const calcCol = configCalcCols?.[columnInBlock - 1];
      if (!calcCol) return null;
      return { type: 'calculated' as const, id: calcCol.id, width: calcCol.width ?? 150 };
    }

    // Original logic for when there ARE column dimensions
    const perBlock = valuesInRowsConfig ? 1 + calcLen : valuesLength + calcLen;
    if (perBlock <= 0) return null;
    const columnInBlock = scrollableIndex % perBlock;
    const valueColsInBlock = valuesInRowsConfig ? 1 : valuesLength;
    if (columnInBlock < valueColsInBlock) {
      const valueKey = configValues?.[valuesInRowsConfig ? 0 : columnInBlock];
      if (valueKey == null) return null;
      const col = columns.find((c) => c.key === valueKey);
      /** Value columns display "Aggregator of Label" and need more width than data columns. */
      const width = settings.columnWidths?.[valueKey] ?? col?.width ?? 240;
      return { type: 'value' as const, key: valueKey, width };
    }
    const calcCol = configCalcCols?.[columnInBlock - valueColsInBlock];
    if (!calcCol) return null;
    return { type: 'calculated' as const, id: calcCol.id, width: calcCol.width ?? 150 };
  }, [
    pivot,
    data.startColumnIndex,
    rowIndex,
    header.length,
    actualColumnIndex,
    fixedColumnCount,
    headerValue,
    configValues,
    configCalcCols,
    valuesInRowsConfig,
    noColumnDimensions,
    columns,
    settings.columnWidths,
  ]);

  const handleExpandCollapse = useCallback(
    (isExpanded: boolean) =>
      isExpanded
        ? dispatch({
            type: 'expandColumn',
            rowIndex,
            columnIndex: actualColumnIndex,
          })
        : dispatch({
            type: 'collapseColumn',
            rowIndex,
            columnIndex: actualColumnIndex,
          }),
    [actualColumnIndex, dispatch, rowIndex],
  );

  const colKeys = useMemo(() => {
    const _colKeys: Array<string> = [];
    for (let i = 0; i <= rowIndex && pivot.config.cols.length; i++) {
      let val = header[i][actualColumnIndex];
      if (val === ROW_SPAN) {
        continue;
      }

      if (rowIndex === 0 && header[i].length === actualColumnIndex + 1 && val.startsWith('Total')) {
        break;
      }
      let j = actualColumnIndex;
      while (COL_SPAN === val) {
        j--;
        val = header[i][j];
      }
      _colKeys.push(val);
    }
    return _colKeys;
  }, [actualColumnIndex, header, pivot.config.cols.length, rowIndex]);

  const handleSort = useCallback(
    async (newSortState?: SortDirection) => {
      setSettings((s) => {
        const newSettings = { ...s };
        if (newSortState != null) {
          newSettings.sort = {
            colKeys,
            direction: newSortState,
          };
        } else {
          newSettings.sort = undefined;
        }
        return newSettings;
      });
    },
    [colKeys, setSettings],
  );

  if (!pivot) {
    return null;
  }

  const value = header[rowIndex][actualColumnIndex];

  const nextColumnValue = header[rowIndex][actualColumnIndex + 1];
  let column: PivotColumn<ColumnKey> | undefined;

  let label = value;
  if (label === ROW_SPAN || label === COL_SPAN) {
    label = '';
  }
  let tooltip: React.ReactNode | undefined;
  let labelNode: React.ReactNode = label;
  const valuesInRows = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
  const valuesColumnIndex = pivot.config.rows.length + (pivot.config.measure != null ? 1 : 0);
  let valuesColumnResize: { key: ColumnKey; width: number } | null = null;
  if (rowIndex === 0 && data.startColumnIndex === 0 && valuesInRows && actualColumnIndex === valuesColumnIndex) {
    const valuesColumnKey = pivot.config.values?.[0];
    if (valuesColumnKey != null) {
      const valuesColumn = columns.find((c) => c.key === valuesColumnKey);
      valuesColumnResize = {
        key: valuesColumnKey,
        width: settings.columnWidths?.[valuesColumnKey] ?? valuesColumn?.width ?? 240,
      };
    }
  }

  if (data.startColumnIndex === 0 && rowIndex === 0) {
    // Check if this is the "Values" column when values are in rows
    if (valuesInRows && actualColumnIndex === valuesColumnIndex) {
      label = 'Values';
      labelNode = <span className={cn(styles.cell, alignmentStyles.start)}>{label}</span>;
    } else {
      const colKey =
        pivot.config.measure != null && actualColumnIndex === pivot.config.rows.length
          ? pivot.config.measure
          : pivot.config.rows[actualColumnIndex];
      column = columns.find((c) => c.key === colKey);
      label = column?.label ?? label;
      labelNode = label;
      if (label !== '') {
        labelNode = (
          <span
            className={cn(
              styles.cell,
              (column?.alignment === 'center' || column?.dataType === 'Number') && alignmentStyles.center,
              column?.alignment === 'end' && alignmentStyles.end,
              (column?.alignment ?? 'start') === 'start' && alignmentStyles.start,
            )}
          >
            {label}
          </span>
        );
      }
    }
  } else if (value === COL_VALUE_SPAN) {
    /** Value columns (and calculated columns) need more width for headers. */
    const valueColWidth = (v: string) =>
      settings.columnWidths?.[v as ColumnKey] ?? columns.find((c) => c.key === v)?.width ?? 240;
    const calcCols = pivot.config.calculatedColumns ?? [];
    // When no column dimensions, calc columns have their own separate header cells
    const includeCalcCols = !noColumnDimensions;
    const metrics = [
      ...pivot.config.values.map((v) => ({
        type: 'value' as const,
        key: v,
        width: valueColWidth(v),
      })),
      ...(includeCalcCols
        ? calcCols.map((calc) => ({
            type: 'calc' as const,
            key: calc.id,
            width: calc.width ?? 240,
          }))
        : []),
    ];
    const totalWidth = metrics.map((m) => m.width).reduce((a, b) => a + b, 0);
    tooltip = (
      <div className={cn(styles.wrapper)}>
        {metrics.map((m, idx) => {
          const column = m.type === 'value' ? columns.find((c) => c.key === m.key) : undefined;
          const calcCol = m.type === 'calc' ? calcCols.find((c) => c.id === m.key) : undefined;
          const colWidth = m.width;
          const labelText = m.type === 'value' ? (column?.label ?? m.key) : (calcCol?.name ?? m.key);
          return (
            <div
              key={`${m.type}-${m.key}`}
              className={cn(styles.outer, idx > 0 ? styles.borderLeft : null)}
              style={{
                width: `${Math.floor((colWidth / totalWidth) * 100)}%`,
              }}
            >
              <span
                className={cn(
                  styles.cell,
                  paddingStyles[density],
                  column?.alignment === 'center' && alignmentStyles.center,
                  column?.alignment === 'end' && alignmentStyles.end,
                  (column?.alignment ?? 'start') === 'start' && alignmentStyles.start,
                )}
              >
                {labelText}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const isTotalHeader =
    rowIndex === 0 && data.startColumnIndex !== 0 && value === totalLabel(pivot.config.aggregatorName);

  const showExpandCollapseIcon =
    data.startColumnIndex !== 0 &&
    rowIndex < data.endRowIndex &&
    value !== ROW_SPAN &&
    value !== COL_SPAN &&
    nextColumnValue === COL_SPAN &&
    !hideExpandCollapseIcons;

  const searchSource =
    rowIndex === 0 && data.startColumnIndex === 0 && !(valuesInRows && actualColumnIndex === valuesColumnIndex)
      ? searchSourceMap.getSearchSource(
          actualColumnIndex === pivot.config.rows.length && pivot.config.measure != null
            ? pivot.config.measure
            : pivot.config.rows[actualColumnIndex],
        )
      : undefined;

  const sortState =
    !disableSort && settings.sort && isArrayEqual(settings.sort.colKeys, colKeys)
      ? settings.sort?.direction
      : undefined;

  const showExpandAllIcon =
    rowIndex === 0 &&
    data.startColumnIndex === 0 &&
    columnIndex === 0 &&
    !hideExpandCollapseIcons &&
    pivot.config.cols.length < 2 &&
    pivot.config.rows.length > 1 &&
    rowIndex !== header.length - 1;

  const showSortIcon =
    !disableSort && data.startColumnIndex !== 0 && label && value !== COL_VALUE_SPAN && !isTotalHeader;

  const showFilterIcon = !hideFilters && searchSource != null;

  const showPivotControls =
    rowIndex === header.length - 1 && data.startColumnIndex === 0 && columnIndex === 0 && !hideExpandCollapseIcons;

  return (
    <SimplePivotTableCell
      columnIndex={columnIndex}
      endColumnIndex={data.endColumnIndex}
      endRowIndex={data.endRowIndex}
      hideBorders={hideBorders}
      removeColumnLines={removeColumnLines}
      removeRowLines={removeRowLines}
      rowIndex={rowIndex}
      startColumnIndex={data.startColumnIndex}
      style={style}
      type="header"
      value={value}
      className={cn(
        'group/resizable relative',
        value !== COL_VALUE_SPAN && paddingStyles[density],
        getCellStyle?.({
          data: makePivotItemData(data),
          rowIndex,
          columnIndex,
          isScrolling,
          type: 'header',
        }),
      )}
    >
      {showExpandCollapseIcon ? (
        <div className="shrink-0">
          <ExpandCollapseIcon
            dataTestId={`ech-${rowIndex}-${actualColumnIndex}`}
            isExpanded={!isColumnCollapsed(rowIndex, actualColumnIndex)}
            onClick={handleExpandCollapse}
          />
        </div>
      ) : null}
      <div className="flex-1 overflow-hidden">
        <div className="flex w-full items-center justify-between gap-2">
          <div
            className={cn(
              fontStyles[density],
              styles.flexGrow,
              styles.ellipsis,
              'w-full font-medium text-table-header-foreground',
              data.startColumnIndex !== 0 && alignmentStyles.end,
            )}
          >
            {tooltip ?? labelNode}
          </div>
          {(showExpandAllIcon || showSortIcon || showFilterIcon) && (
            <div className="flex shrink-0 items-center">
              {showExpandAllIcon && (
                <>
                  <Button
                    data-tip="Expand All"
                    onClick={() => dispatch({ type: 'expandAll' })}
                    variant="ghost"
                    size="icon"
                    className="hidden text-table-header-foreground hover:bg-table-header-accent group-hover/cell:flex"
                    data-testid="expand-all-hover"
                  >
                    <PlusCircleIcon className="size-4" />
                  </Button>
                  <Button
                    data-tip="Collapse All"
                    onClick={() => dispatch({ type: 'collapseAll' })}
                    variant="ghost"
                    size="icon"
                    className="hidden hover:bg-table-header-accent group-hover/cell:flex"
                    data-testid="collapse-all-hover"
                  >
                    <MinusCircleIcon className="size-4 text-table-header-foreground" />
                  </Button>
                </>
              )}
              {showSortIcon && (
                <SortMenu
                  sortDirection={sortState}
                  onSort={handleSort}
                  className={cn(
                    'hover:bg-table-header-accent group-hover/cell:flex [&[data-state=open]]:flex',
                    sortState ? 'flex' : 'hidden',
                  )}
                  iconClassName="text-table-header-foreground"
                  open={sortMenuOpen}
                  onOpenChange={setSortMenuOpen}
                  disableHeaderFilters
                />
              )}
              {showFilterIcon && searchSource != null && (
                <PivotSearchableMultiSelector
                  searchSource={searchSource}
                  value={
                    filters[
                      actualColumnIndex === pivot.config.rows.length && pivot.config.measure != null
                        ? (pivot.config.measure as ColumnKey)
                        : (pivot.config.rows[actualColumnIndex] as ColumnKey)
                    ] ?? []
                  }
                  buttonSize={density === 'compact' ? 'compact' : 'default'}
                  onChange={(value: ReadonlyArray<string>) => {
                    const key: ColumnKey =
                      actualColumnIndex === pivot.config.rows.length && pivot.config.measure != null
                        ? pivot.config.measure
                        : pivot.config.rows[actualColumnIndex];

                    setFilters((prev: Partial<Record<ColumnKey, string[]>>) => {
                      return {
                        ...prev,
                        [key]: [...value],
                      };
                    });
                  }}
                />
              )}
            </div>
          )}
        </div>
        {showPivotControls && (
          <>
            <Button
              data-tip="Expand All"
              onClick={() => dispatch({ type: 'expandAll' })}
              variant="ghost"
              size="icon"
              data-testid="expand-all"
              className="hover:bg-table-header-accent"
            >
              <PlusCircleIcon className="size-4" />
            </Button>
            <Button
              data-tip="Collapse All"
              onClick={() => dispatch({ type: 'collapseAll' })}
              variant="ghost"
              size="icon"
              data-testid="collapse-all"
              className="hover:bg-table-header-accent"
            >
              <MinusCircleIcon className="size-4" />
            </Button>
            <PivotSettings />
          </>
        )}
      </div>
      {rowIndex === 0 && data.startColumnIndex === 0 && column && (
        <ResizeHandler
          side="r"
          size={settings.columnWidths?.[column.key] ?? column.width ?? 200}
          min={50}
          onMove={(newSize) => updateColumnWidth(column.key, newSize)}
        />
      )}
      {valuesColumnResize && (
        <ResizeHandler
          side="r"
          size={valuesColumnResize.width}
          min={50}
          onMove={(newSize) => updateColumnWidth(valuesColumnResize.key, newSize)}
        />
      )}
      {dataColumnResize && (
        <ResizeHandler
          side="r"
          size={dataColumnResize.width}
          min={50}
          onMove={(newSize) =>
            dataColumnResize.type === 'value'
              ? updateColumnWidth(dataColumnResize.key, newSize)
              : updateCalculatedColumnWidth(dataColumnResize.id, newSize)
          }
        />
      )}
    </SimplePivotTableCell>
  );
}

export default memo(SimplePivotTableHeaderCell);
