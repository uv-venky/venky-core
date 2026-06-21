import { jsx as _jsx } from "react/jsx-runtime";
/* Copyright (c) 2024-present VENKY Corp. */
import { cn } from '../../../lib/utils';
import React, { memo } from 'react';
import { COL_SPAN, COL_VALUE_SPAN, SPANS } from '../../../components/core/pivot/PivotTypes';
import { computeCalculatedColumn, makePivotItemData, totalLabel } from '../../../components/core/pivot/PivotUtils';
import { alignmentStyles, fontStyles, paddingStyles, SimplePivotTableCell, } from '../../../components/core/pivot/SimplePivotTableCell';
const styles = {
    wrapper: 'flex overflow-hidden h-full box-border w-full',
    outer: 'overflow-hidden text-ellipsis whitespace-nowrap flex items-center box-border w-full',
    inner: 'w-full overflow-hidden text-ellipsis whitespace-nowrap box-border',
    borderRight: 'border-r',
    overlay: 'bg-hover-overlay',
};
function SimplePivotTableFooterCell({ columnIndex, data, isScrolling, rowIndex, style, }) {
    const { columns, density, getActualColumnIndex, getCellStyle, grayedOutSummaryCells, header, hideBorders, onFooterCellClick, pivot, removeColumnLines, removeRowLines, } = data.data;
    if (!pivot) {
        return null;
    }
    const actualColumnIndex = getActualColumnIndex(columnIndex + data.startColumnIndex);
    const colKeys = pivot.getColKeys();
    const valuesInRows = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
    const calculatedCols = pivot.config.calculatedColumns ?? [];
    const footerRowCount = valuesInRows ? (pivot.config.values?.length ?? 0) + calculatedCols.length : 1;
    const footerMetricIndex = data.endRowIndex >= 1 ? rowIndex : 0;
    const isFooterValuesInRows = valuesInRows && footerRowCount > 1;
    const hasMultiMetrics = (pivot.config.values?.length ?? 0) > 1 || calculatedCols.length > 0;
    const valuesBeforeCols = !valuesInRows && pivot.config.columnsBeforeValues !== false && colKeys.length > 0 && hasMultiMetrics;
    const colsBeforeValues = !valuesInRows && pivot.config.columnsBeforeValues === false && colKeys.length > 0 && hasMultiMetrics;
    const useSeqLayout = valuesBeforeCols || colsBeforeValues;
    const seq = useSeqLayout ? pivot.getDataColumnSequence() : [];
    const scrollableIndex = actualColumnIndex - data.startColumnIndex;
    const seqEntry = useSeqLayout && data.startColumnIndex > 0 && scrollableIndex < seq.length ? seq[scrollableIndex] : undefined;
    const colKeyIdx = seqEntry?.colKeyIdx ?? scrollableIndex;
    const colKey = data.startColumnIndex > 0 ? colKeys[colKeyIdx] : undefined;
    let head = header[header.length - 1]?.[actualColumnIndex];
    if (head === COL_VALUE_SPAN) {
        head = header[header.length - 2]?.[actualColumnIndex];
    }
    const summary = data.startColumnIndex > 0 && SPANS.includes(head);
    const hasCalculatedColumns = calculatedCols.length > 0;
    const calculatedColumn = hasCalculatedColumns && data.startColumnIndex > 0 && !isFooterValuesInRows
        ? seqEntry?.calcIdx !== undefined
            ? calculatedCols[seqEntry.calcIdx]
            : calculatedCols.find((calcCol) => {
                return header.some((headerRow) => headerRow[actualColumnIndex] === calcCol.name);
            })
        : undefined;
    const isCalculatedColumn = !!calculatedColumn;
    const valueIdxForCol = valuesBeforeCols && seqEntry?.valueIdx !== undefined ? seqEntry.valueIdx : undefined;
    let value = '';
    let vals;
    // When valuesInRows with multiple footer rows, each row shows one metric's grand total
    if (isFooterValuesInRows) {
        const isValueMetric = footerMetricIndex < (pivot.config.values?.length ?? 0);
        const valueIdx = isValueMetric ? footerMetricIndex : -1;
        const calcCol = !isValueMetric ? calculatedCols[footerMetricIndex - (pivot.config.values?.length ?? 0)] : undefined;
        const valuesColumnIndex = pivot.config.rows.length + (pivot.config.measure != null ? 1 : 0);
        const isValuesColumn = actualColumnIndex === valuesColumnIndex;
        if (data.startColumnIndex === 0) {
            if (columnIndex === 0) {
                value = rowIndex === 0 ? (totalLabel(pivot.config.aggregatorName) ?? '') : '';
                if (rowIndex === 0 && pivot.config.getTotalLabel) {
                    value = pivot.config.getTotalLabel({
                        aggregatorName: pivot.config.aggregatorName,
                        defaultLabel: String(value),
                        values: pivot.config.values ?? [],
                        location: 'footer',
                    });
                }
                if (rowIndex > 0)
                    value = COL_SPAN;
            }
            else if (isValuesColumn) {
                value = isValueMetric
                    ? `${pivot.config.valueAggregators?.[pivot.config.values[valueIdx]] ?? pivot.config.aggregatorName} of ${pivot.config.getValueLabel?.(pivot.config.values[valueIdx]) ?? pivot.config.values[valueIdx]}`
                    : (calcCol?.name ?? COL_SPAN);
            }
            else {
                value = COL_SPAN;
            }
        }
        else {
            const hideZeroValues = pivot.config.hideZeroValues;
            const showGrandTotal = pivot.config.showGrandTotal !== false;
            if (isValueMetric) {
                if (colKey) {
                    const aggregator = pivot.getAggregator([], colKey);
                    vals = aggregator.values();
                    const val = vals[valueIdx];
                    value = val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdx);
                }
                else {
                    if (showGrandTotal) {
                        const aggregator = pivot.getAggregator([], []);
                        vals = aggregator.values();
                        const val = vals[valueIdx];
                        value = val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdx);
                    }
                    else {
                        value = '';
                    }
                }
            }
            else {
                let allRecords = [];
                if (colKey) {
                    allRecords = pivot.getAllRecordsForColumnKey(colKey);
                }
                else {
                    allRecords = pivot.getAllRecordsForCalculatedColumn();
                }
                let calculatedValue = '';
                if (allRecords.length > 0 && calcCol?.formula.type === 'aggregation') {
                    const result = computeCalculatedColumn(calcCol?.formula, allRecords, pivot.config.getNumberValue, pivot.config.getTextValue);
                    calculatedValue =
                        result === 0 && hideZeroValues
                            ? ''
                            : calcCol?.formula.mathOperator === '%' || calcCol?.formula.multiplier === 100
                                ? `${result.toFixed(2)}%`
                                : result.toFixed(2);
                }
                value = calculatedValue;
            }
        }
    }
    else {
        // Original single-row footer logic
        const showGrandTotal = pivot.config.showGrandTotal !== false;
        const hideZeroValues = pivot.config.hideZeroValues;
        const isCalculatedGrandTotalColumn = isCalculatedColumn && data.startColumnIndex > 0 && !colKey;
        // Fixed section (row dimension columns): only first column shows "Total", rest show empty.
        // The fixed section always contains row dimensions; use columnIndex for reliable detection.
        const isInFixedSection = data.startColumnIndex === 0;
        if (isInFixedSection) {
            if (columnIndex === 0) {
                value = totalLabel(pivot.config.aggregatorName) ?? '';
                if (pivot.config.getTotalLabel) {
                    value = pivot.config.getTotalLabel({
                        aggregatorName: pivot.config.aggregatorName,
                        defaultLabel: String(value),
                        values: pivot.config.values ?? [],
                        location: 'footer',
                    });
                }
            }
            else {
                value = COL_SPAN;
            }
        }
        else {
            // When valuesBeforeCols, scrollableIndex >= seq.length means we're in row totals section
            const isInRowTotalsSection = useSeqLayout && scrollableIndex >= seq.length;
            const rowTotalSubIndex = useSeqLayout ? scrollableIndex - seq.length : -1;
            // When cols is empty, handle data columns directly (bundled values + calc columns)
            const noColDims = (pivot.config.cols?.length ?? 0) === 0;
            if (noColDims && data.startColumnIndex > 0) {
                if (isCalculatedColumn && calculatedColumn) {
                    const allRecords = pivot.getAllRecordsForCalculatedColumn();
                    let calculatedValue = '';
                    if (allRecords.length > 0 && calculatedColumn.formula.type === 'aggregation') {
                        const result = computeCalculatedColumn(calculatedColumn.formula, allRecords, pivot.config.getNumberValue, pivot.config.getTextValue);
                        if (result === 0 && hideZeroValues) {
                            calculatedValue = '';
                        }
                        else if (calculatedColumn.formula.mathOperator === '%' || calculatedColumn.formula.multiplier === 100) {
                            calculatedValue = `${result.toFixed(2)}%`;
                        }
                        else {
                            calculatedValue = result.toFixed(2);
                        }
                    }
                    value = [calculatedValue];
                }
                else if (showGrandTotal) {
                    const aggregator = pivot.getAggregator([], []);
                    vals = aggregator.values();
                    value = vals.map((val, i) => (val === 0 && hideZeroValues ? '' : aggregator.format(val, i)));
                }
                else {
                    value = [];
                }
            }
            else if (isCalculatedColumn && calculatedColumn && seqEntry) {
                let allRecords = [];
                if (isCalculatedGrandTotalColumn && showGrandTotal && !colsBeforeValues) {
                    allRecords = pivot.getAllRecordsForCalculatedColumn();
                }
                else if (colKey) {
                    allRecords = pivot.getAllRecordsForColumnKey(colKey);
                }
                let calculatedValue = '';
                if (allRecords.length > 0 && calculatedColumn.formula.type === 'aggregation') {
                    const result = computeCalculatedColumn(calculatedColumn.formula, allRecords, pivot.config.getNumberValue, pivot.config.getTextValue);
                    if (result === 0 && hideZeroValues) {
                        calculatedValue = '';
                    }
                    else {
                        if (calculatedColumn.formula.mathOperator === '%' || calculatedColumn.formula.multiplier === 100) {
                            calculatedValue = `${result.toFixed(2)}%`;
                        }
                        else {
                            calculatedValue = result.toFixed(2);
                        }
                    }
                }
                value = [calculatedValue];
            }
            else if (colsBeforeValues && seqEntry && seqEntry.valueIdx !== undefined && colKey) {
                // columnsBeforeValues=false layout: one footer cell per (colKey, valueIdx)
                const valueIdx = seqEntry.valueIdx;
                const aggregator = pivot.getAggregator([], colKey);
                vals = aggregator.values();
                const val = vals[valueIdx];
                value = [val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdx)];
            }
            else if (isInRowTotalsSection) {
                const valuesCount = pivot.config.values?.length ?? 0;
                const hasExpandedTotals = colsBeforeValues || valuesBeforeCols;
                if (hasExpandedTotals && rowTotalSubIndex < valuesCount && showGrandTotal) {
                    // Expanded Total: each sub-index maps to an individual value
                    const aggregator = pivot.getAggregator([], []);
                    vals = aggregator.values();
                    const val = vals[rowTotalSubIndex];
                    value = [val === 0 && hideZeroValues ? '' : aggregator.format(val, rowTotalSubIndex)];
                }
                else if (hasExpandedTotals && rowTotalSubIndex >= valuesCount && hasCalculatedColumns) {
                    // Expanded Total: calc columns after values
                    const calcCol = calculatedCols[rowTotalSubIndex - valuesCount];
                    const allRecords = pivot.getAllRecordsForCalculatedColumn();
                    let calculatedValue = '';
                    if (allRecords.length > 0 && calcCol?.formula.type === 'aggregation') {
                        const result = computeCalculatedColumn(calcCol.formula, allRecords, pivot.config.getNumberValue, pivot.config.getTextValue);
                        calculatedValue =
                            result === 0 && hideZeroValues
                                ? ''
                                : calcCol.formula.mathOperator === '%' || calcCol.formula.multiplier === 100
                                    ? `${result.toFixed(2)}%`
                                    : result.toFixed(2);
                    }
                    value = [calculatedValue];
                }
                else if (!hasExpandedTotals && rowTotalSubIndex === 0 && showGrandTotal) {
                    // Standard: combined values total in first column
                    const aggregator = pivot.getAggregator([], []);
                    vals = aggregator.values();
                    const formattedValues = vals.map((val, i) => aggregator.format(val, i));
                    const calcTotals = [];
                    if (hasCalculatedColumns) {
                        const allRecords = pivot.getAllRecordsForCalculatedColumn();
                        calculatedCols.forEach((calcCol) => {
                            let calculatedValue = '';
                            if (allRecords.length > 0 && calcCol.formula.type === 'aggregation') {
                                const result = computeCalculatedColumn(calcCol.formula, allRecords, pivot.config.getNumberValue, pivot.config.getTextValue);
                                if (!(result === 0 && hideZeroValues)) {
                                    if (calcCol.formula.mathOperator === '%' || calcCol.formula.multiplier === 100) {
                                        calculatedValue = `${result.toFixed(2)}%`;
                                    }
                                    else {
                                        calculatedValue = result.toFixed(2);
                                    }
                                }
                            }
                            calcTotals.push(calculatedValue);
                        });
                    }
                    value = [...formattedValues, ...calcTotals];
                }
                else if (!hasExpandedTotals && rowTotalSubIndex > 0 && hasCalculatedColumns) {
                    const calcCol = calculatedCols[rowTotalSubIndex - 1];
                    const allRecords = pivot.getAllRecordsForCalculatedColumn();
                    let calculatedValue = '';
                    if (allRecords.length > 0 && calcCol?.formula.type === 'aggregation') {
                        const result = computeCalculatedColumn(calcCol.formula, allRecords, pivot.config.getNumberValue, pivot.config.getTextValue);
                        calculatedValue =
                            result === 0 && hideZeroValues
                                ? ''
                                : calcCol.formula.mathOperator === '%' || calcCol.formula.multiplier === 100
                                    ? `${result.toFixed(2)}%`
                                    : result.toFixed(2);
                    }
                    value = [calculatedValue];
                }
                else {
                    value = [];
                }
            }
            else if (!valuesBeforeCols &&
                !colKey &&
                columnIndex === data.endColumnIndex - data.startColumnIndex &&
                data.startColumnIndex > 0) {
                if (showGrandTotal) {
                    const aggregator = pivot.getAggregator([], []);
                    vals = aggregator.values();
                    value = vals.map((val, i) => aggregator.format(val, i));
                }
                else {
                    value = [];
                }
            }
            else if (!colKey || data.startColumnIndex === 0) {
                const valuesInRowsOrig = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
                const valuesColumnIndexOrig = pivot.config.rows.length + (pivot.config.measure != null ? 1 : 0);
                const isValuesColumnOrig = valuesInRowsOrig && actualColumnIndex === valuesColumnIndexOrig;
                if (columnIndex === 0) {
                    value = totalLabel(pivot.config.aggregatorName);
                    if (pivot.config.getTotalLabel) {
                        value = pivot.config.getTotalLabel({
                            aggregatorName: pivot.config.aggregatorName,
                            defaultLabel: value,
                            values: pivot.config.values ?? [],
                            location: 'footer',
                        });
                    }
                }
                else if (isValuesColumnOrig) {
                    value = '';
                }
                else {
                    value = COL_SPAN;
                }
            }
            else if (valuesBeforeCols && seqEntry && valueIdxForCol !== undefined) {
                // Single value column when valuesBeforeCols
                const aggregator = pivot.getAggregator([], colKey);
                vals = aggregator.values();
                const val = vals[valueIdxForCol];
                value = [val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdxForCol)];
            }
            else {
                const aggregator = pivot.getAggregator([], colKey);
                vals = aggregator.values();
                value = vals.map((val, i) => aggregator.format(val, i));
            }
        }
    }
    let label = typeof value === 'string' ? value : value?.length === 1 ? value[0] : '';
    if (SPANS.includes(label)) {
        label = '';
    }
    else if (Array.isArray(value) && value.length > 1) {
        // Multi-metric total cell (e.g. combined Total column or bundled footer when cols is empty).
        // When no column dimensions, calc columns have their own separate footer cells.
        const noColDimsFooter = (pivot.config.cols?.length ?? 0) === 0;
        const metricColumns = [
            ...pivot.config.values.map((col) => {
                const c = columns.find((c) => c.key === col);
                if (c == null) {
                    throw new Error(`Column not found ${col}`);
                }
                return c;
            }),
            ...(noColDimsFooter
                ? []
                : (pivot.config.calculatedColumns ?? []).map((calcCol) => ({
                    key: calcCol.id,
                    width: calcCol.width ?? 200,
                    alignment: 'end',
                }))),
        ];
        const totalWidth = metricColumns.map((v) => v?.width ?? 200).reduce((a, b) => a + b, 0);
        label = (_jsx("div", { className: cn(styles.wrapper, fontStyles[density], grayedOutSummaryCells && summary && styles.overlay), children: metricColumns.map((c, idx) => {
                return (_jsx("div", { className: cn(styles.outer, idx !== metricColumns.length - 1 ? styles.borderRight : null, grayedOutSummaryCells && idx % 2 !== 0 && styles.overlay), style: {
                        width: `${Math.floor(((c.width ?? 200) / totalWidth) * 100)}%`,
                    }, children: _jsx("span", { className: cn(styles.inner, paddingStyles[density], c.alignment == null && data.startColumnIndex > 0 && alignmentStyles.end, c.alignment === 'center' && alignmentStyles.center, c.alignment === 'end' && alignmentStyles.end, c.alignment === 'start' && alignmentStyles.start), children: value[idx] }) }, c.key));
            }) }));
    }
    else {
        const valuesInRowsForCol = pivot.config.valuesPosition === 'rows' && (pivot.config.values?.length ?? 0) > 1;
        const valuesColumnIndexForCol = pivot.config.rows.length + (pivot.config.measure != null ? 1 : 0);
        const isValuesColumnForCol = valuesInRowsForCol && actualColumnIndex === valuesColumnIndexForCol;
        let colKey;
        if (isValuesColumnForCol) {
            // For the "Values" column, use the first value for styling
            colKey = pivot.config.values[0];
        }
        else if (data.startColumnIndex > 0) {
            colKey = pivot.config.values[0];
        }
        else {
            colKey = pivot.config.rows[actualColumnIndex];
        }
        const col = columns.find((c) => c.key === colKey);
        if (col == null) {
            throw new Error(`Column not found ${colKey}`);
        }
        label = (_jsx("div", { className: cn(styles.wrapper, fontStyles[density]), children: _jsx("div", { className: cn(styles.outer, grayedOutSummaryCells && summary && styles.overlay), children: _jsx("span", { className: cn(styles.inner, paddingStyles[density], col.alignment == null && data.startColumnIndex > 0 && !isValuesColumnForCol && alignmentStyles.end, col.alignment === 'center' && alignmentStyles.center, col.alignment === 'end' && alignmentStyles.end, (col.alignment === 'start' || isValuesColumnForCol) && alignmentStyles.start), children: label }) }) }));
    }
    const cell = _jsx("div", { className: "h-full w-full font-medium text-muted-foreground", children: label });
    const onClick = data.startColumnIndex !== 0 && onFooterCellClick && label !== ''
        ? (e) => {
            e.stopPropagation();
            const row = pivot.getCellData(-1, actualColumnIndex - data.startColumnIndex);
            onFooterCellClick?.(value, row);
        }
        : undefined;
    return (_jsx(SimplePivotTableCell, { columnIndex: columnIndex, endColumnIndex: data.endColumnIndex, endRowIndex: data.endRowIndex, hideBorders: hideBorders, removeColumnLines: removeColumnLines, removeRowLines: removeRowLines, rowIndex: rowIndex, startColumnIndex: data.startColumnIndex, style: style, type: "footer", value: value, className: getCellStyle?.({
            data: makePivotItemData(data),
            rowIndex,
            columnIndex,
            isScrolling,
            type: 'footer',
            formattedValue: value,
            numberValue: vals?.length === 1 ? vals[0] : vals,
        }), onClick: onClick, children: cell }));
}
export default memo(SimplePivotTableFooterCell);
//# sourceMappingURL=SimplePivotTableFooterCell.js.map