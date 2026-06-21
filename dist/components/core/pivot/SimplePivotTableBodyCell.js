import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/* Copyright (c) 2024-present VENKY Corp. */
import { cn } from '../../../lib/utils';
import React, { memo, useCallback } from 'react';
import useWhyDidYouUpdate from '../../../components/core/hooks/useWhyDidYouUpdate';
import ExpandCollapseIcon from '../../../components/core/pivot/ExpandCollapseIcon';
import { BOTH_SPAN, COL_SPAN, COL_VALUE_SPAN, ROW_SPAN, SPANS } from '../../../components/core/pivot/PivotTypes';
import { makePivotItemData } from '../../../components/core/pivot/PivotUtils';
import {
  SimplePivotTableCell,
  alignmentStyles,
  fontStyles,
  paddingStyles,
} from '../../../components/core/pivot/SimplePivotTableCell';
const styles = {
  wrapper: 'flex overflow-hidden h-full box-border w-full',
  outer: 'overflow-hidden text-ellipsis whitespace-nowrap flex items-center box-border w-full',
  inner: 'w-full overflow-hidden text-ellipsis whitespace-nowrap box-border',
  borderRight: 'border-r border-r-border',
  flexGrow: 'flex-grow',
  overlay: 'bg-hover-overlay',
  summary: 'font-medium text-muted-foreground',
};
function SimplePivotTableBodyCell(props) {
  const { columnIndex, data, isScrolling, rowIndex, style } = props;
  useWhyDidYouUpdate(`SimplePivotTableBodyCell-${rowIndex}-${columnIndex + data.startColumnIndex}`, props);
  const {
    CellRenderer,
    columns,
    density,
    dispatch,
    getActualColumnIndex,
    getActualRowIndex,
    getCellStyle,
    grayedOutSummaryCells,
    header,
    hideBodyBottomBorder,
    hideBorders,
    hideExpandCollapseIcons,
    isRowCollapsed,
    onValueCellClick,
    onRowCellClick,
    pivot,
    removeColumnLines,
    removeRowLines,
  } = data.data;
  const actualRowIndex = getActualRowIndex(rowIndex);
  const actualColumnIndex = getActualColumnIndex(columnIndex + data.startColumnIndex);
  const rowDimColumnIndex = pivot ? Math.min(actualColumnIndex, (pivot.config.rows?.length ?? 1) - 1) : columnIndex;
  const handleExpandCollapse = useCallback(
    (isExpanded) =>
      isExpanded
        ? dispatch({
            type: 'expandRow',
            rowIndex: actualRowIndex,
            columnIndex: rowDimColumnIndex,
          })
        : dispatch({
            type: 'collapseRow',
            rowIndex: actualRowIndex,
            columnIndex: rowDimColumnIndex,
          }),
    [dispatch, actualRowIndex, rowDimColumnIndex],
  );
  if (!pivot) {
    return null;
  }
  const row = data.data.rows[actualRowIndex];
  if (!row) {
    return null;
  }
  let vals;
  if (data.startColumnIndex > 0 && (getCellStyle || CellRenderer)) {
    const scrollableIdx = actualColumnIndex - data.startColumnIndex;
    const valuesBeforeCols =
      pivot.config.valuesPosition !== 'rows' &&
      pivot.config.columnsBeforeValues !== false &&
      pivot.colKeys.length > 0 &&
      ((pivot.config.values?.length ?? 0) > 1 || (pivot.config.calculatedColumns?.length ?? 0) > 0);
    const seq = valuesBeforeCols ? pivot.getDataColumnSequence() : [];
    const seqEntry = valuesBeforeCols && scrollableIdx < seq.length ? seq[scrollableIdx] : undefined;
    const colKeyIdx = seqEntry?.colKeyIdx ?? scrollableIdx;
    const rowKey = pivot.rowKeys[actualRowIndex];
    const colKey = colKeyIdx >= pivot.colKeys.length ? [] : pivot.colKeys[colKeyIdx];
    const aggr = pivot.getAggregator(rowKey, colKey);
    vals = aggr.values();
    if (seqEntry?.valueIdx !== undefined && vals && vals.length > 1) {
      vals = [vals[seqEntry.valueIdx]];
    } else if (seqEntry?.calcIdx !== undefined) {
      vals = undefined;
    }
  }
  let head = header[header.length - 1][actualColumnIndex];
  if (head === COL_VALUE_SPAN) {
    head = header[header.length - 2][actualColumnIndex];
  }
  const columnSummary = data.startColumnIndex > 0 && SPANS.includes(head);
  const rowSummary = data.startColumnIndex > 0 && SPANS.includes(row[data.startColumnIndex - 1]);
  let value = row[actualColumnIndex];
  if (Array.isArray(value) && value.length === 1) {
    value = value[0];
  }
  const nextRowValue = data.data.rows[actualRowIndex + 1]?.[actualColumnIndex];
  let label = typeof value === 'string' ? value : '';
  if (typeof label === 'string' && SPANS.includes(label)) {
    label = '';
  } else if (Array.isArray(value) && value.length > 1) {
    // Multi-metric cell (e.g. combined Total column or bundled values when cols is empty).
    // When no column dimensions, calc columns have their own separate cells.
    const noColDims = (pivot.config.cols?.length ?? 0) === 0;
    const metricColumns = [
      ...pivot.config.values.map((col) => {
        const c = columns.find((c) => c.key === col);
        if (c == null) {
          throw new Error(`Column not found ${col}`);
        }
        return c;
      }),
      ...(noColDims
        ? []
        : (pivot.config.calculatedColumns ?? []).map((calcCol) => ({
            key: calcCol.id,
            width: calcCol.width ?? 200,
            alignment: 'end',
          }))),
    ];
    const totalWidth = metricColumns.map((v) => v?.width ?? 200).reduce((a, b) => a + b, 0);
    label = _jsx('div', {
      className: cn(styles.wrapper, 'flex'),
      children: metricColumns.map((c, idx) => {
        return _jsx(
          'div',
          {
            className: cn(
              styles.outer,
              idx !== metricColumns.length - 1 ? styles.borderRight : null,
              grayedOutSummaryCells && idx % 2 !== 0,
            ),
            style: {
              width: `${Math.floor(((c.width ?? 200) / totalWidth) * 100)}%`,
            },
            children: _jsx('span', {
              className: cn(
                styles.inner,
                paddingStyles[density],
                c.alignment == null && data.startColumnIndex > 0 && alignmentStyles.end,
                c.alignment === 'center' && alignmentStyles.center,
                c.alignment === 'end' && alignmentStyles.end,
                c.alignment === 'start' && alignmentStyles.start,
              ),
              children: value[idx],
            }),
          },
          c.key,
        );
      }),
    });
  } else {
    const valuesInRows = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
    const valuesColumnIndex = pivot.config.rows.length + (pivot.config.measure != null ? 1 : 0);
    // Check if this is the "Values" column when values are in rows
    const isValuesColumn = valuesInRows && actualColumnIndex === valuesColumnIndex;
    let colKey;
    if (isValuesColumn) {
      // This is the "Values" column - the value is the label (e.g., "Sum of revenue")
      // Don't look up a column, just use the value as-is
      colKey = pivot.config.values[0]; // Use first value for styling purposes
    } else if (data.startColumnIndex > 0) {
      colKey = pivot.config.values[0];
    } else if (pivot.config.measure != null && actualColumnIndex === pivot.config.rows.length) {
      colKey = pivot.config.measure;
    } else {
      colKey = pivot.config.rows[actualColumnIndex];
    }
    const col = columns.find((c) => c.key === colKey);
    if (col == null) {
      throw new Error(`Column not found ${colKey}`);
    }
    label = _jsx('div', {
      className: cn(styles.wrapper),
      children: _jsx('div', {
        className: cn(styles.outer),
        children: _jsx('span', {
          className: cn(
            styles.inner,
            paddingStyles[density],
            col.alignment == null && data.startColumnIndex > 0 && !isValuesColumn && alignmentStyles.end,
            col.alignment === 'center' && alignmentStyles.center,
            col.alignment === 'end' && alignmentStyles.end,
            (col.alignment === 'start' || isValuesColumn) && alignmentStyles.start,
          ),
          children: label,
        }),
      }),
    });
  }
  const valuesInRowsCheck = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
  const showExpandCollapseIcon =
    data.startColumnIndex === 0 &&
    columnIndex < data.endColumnIndex - (pivot.config.measure != null ? 1 : 0) - (valuesInRowsCheck ? 1 : 0) &&
    value !== ROW_SPAN &&
    value !== COL_SPAN &&
    value !== BOTH_SPAN &&
    nextRowValue === ROW_SPAN &&
    !hideExpandCollapseIcons;
  // Click handler for value cells (numeric columns)
  const onValueClick =
    data.startColumnIndex !== 0 && onValueCellClick && label !== ''
      ? (e) => {
          e.stopPropagation();
          const scrollableIdx = actualColumnIndex - data.startColumnIndex;
          const valuesBeforeCols =
            pivot.config.valuesPosition !== 'rows' &&
            pivot.config.columnsBeforeValues !== false &&
            pivot.colKeys.length > 0 &&
            ((pivot.config.values?.length ?? 0) > 1 || (pivot.config.calculatedColumns?.length ?? 0) > 0);
          const seq = valuesBeforeCols ? pivot.getDataColumnSequence() : [];
          const colKeyIdx =
            valuesBeforeCols && scrollableIdx < seq.length
              ? (seq[scrollableIdx]?.colKeyIdx ?? scrollableIdx)
              : scrollableIdx;
          const row = pivot.getCellData(actualRowIndex, colKeyIdx);
          onValueCellClick?.(value, row);
        }
      : undefined;
  // Click handler for row dimension cells (text columns like State, Customer, etc.)
  const onRowClick =
    data.startColumnIndex === 0 && onRowCellClick && typeof value === 'string' && value !== '' && !SPANS.includes(value)
      ? (e) => {
          e.stopPropagation();
          // Use pivot.config.rows to get the correct column key for row dimension cells
          const columnKey = pivot.config.rows[actualColumnIndex];
          const context = pivot.getCellData(actualRowIndex, 0);
          onRowCellClick?.(columnKey, value, context);
        }
      : undefined;
  const onClick = onValueClick ?? onRowClick;
  let className;
  if (getCellStyle) {
    const _data = makePivotItemData(data);
    className = getCellStyle?.({
      data: _data,
      rowIndex,
      columnIndex,
      isScrolling,
      type: 'body',
      formattedValue: value,
      numberValue: vals?.length === 1 ? vals[0] : vals,
    });
  }
  const cell = _jsx('div', {
    className: cn(
      fontStyles[density],
      styles.flexGrow,
      'h-full',
      'overflow-hidden',
      (columnSummary || rowSummary) && styles.summary,
      className,
    ),
    children: label,
  });
  return _jsxs(SimplePivotTableCell, {
    columnIndex: columnIndex,
    endColumnIndex: data.endColumnIndex,
    endRowIndex: data.endRowIndex,
    hideBodyBottomBorder: hideBodyBottomBorder,
    hideBorders: hideBorders,
    removeColumnLines: removeColumnLines,
    removeRowLines: removeRowLines,
    rowIndex: rowIndex,
    startColumnIndex: data.startColumnIndex,
    style: style,
    className: cn(className, grayedOutSummaryCells && (columnSummary || rowSummary) && styles.overlay),
    type: 'body',
    value: value,
    onClick: onClick,
    dataTestId: `pivot-cell-${columnSummary || rowSummary ? 's-' : ''}${columnSummary ? 'c-' : ''}${rowSummary ? 'r-' : ''}${rowIndex}-${columnIndex + data.startColumnIndex}`,
    children: [
      showExpandCollapseIcon
        ? _jsx(ExpandCollapseIcon, {
            dataTestId: `ec-${rowIndex}-${columnIndex}`,
            isExpanded: !isRowCollapsed(actualRowIndex, rowDimColumnIndex),
            onClick: handleExpandCollapse,
          })
        : null,
      CellRenderer
        ? _jsx(CellRenderer, {
            density: density,
            formattedValue: value,
            numberValue: vals?.length === 1 ? vals[0] : vals,
            context: pivot.getCellData(actualRowIndex, actualColumnIndex - data.startColumnIndex),
            columnIndex: columnIndex,
            rowIndex: rowIndex,
            data: makePivotItemData(data),
            children: cell,
          })
        : cell,
    ],
  });
}
export default memo(SimplePivotTableBodyCell);
//# sourceMappingURL=SimplePivotTableBodyCell.js.map
