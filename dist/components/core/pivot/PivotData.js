/* Copyright (c) 2024-present VENKY Corp. */
import { entries } from '../../../lib/core/common/isEmpty';
import { BOTH_SPAN, COL_SPAN, COL_VALUE_SPAN, ROW_SPAN, SPANS } from '../../../components/core/pivot/PivotTypes';
import {
  aggregators,
  compareSpans,
  createCompositeAggregator,
  getSort,
  totalLabel,
  computeCalculatedColumn,
  SUPPRESSED_MARKER,
} from '../../../components/core/pivot/PivotUtils';
import { showError } from '../../../components/core/common/Notification';
function isEqual(a, b) {
  return a === b || (SPANS.includes(a) && SPANS.includes(b));
}
/*
 * This class is inspired from PivotTable.js
 * https://github.com/nicolaskruchten/pivottable
 * It takes in the data, and returns a tree of aggregated data for the given
 * config of rows/cols.
 */
class PivotData {
  config;
  rowKeys;
  colKeys;
  rowTotals;
  colTotals;
  allTotal;
  sorted;
  tree;
  recordsTree;
  aggregator;
  constructor(inputProps) {
    this.config = { flattenLayout: false, columnsBeforeValues: true, ...inputProps };
    const va = this.config.valueAggregators;
    const hasPerValueAggregators = va != null && this.config.values.some((v) => va[v] != null);
    const baseAggregatorFactory =
      hasPerValueAggregators && va
        ? createCompositeAggregator({
            values: this.config.values,
            valueAggregators: va,
            defaultAggregator: this.config.aggregatorName,
            getNumberValue: this.config.getNumberValue,
            getTextValue: this.config.getTextValue,
          })
        : aggregators[this.config.aggregatorName]({
            attrs: this.config.values,
            getNumberValue: this.config.getNumberValue,
            getTextValue: this.config.getTextValue,
          });
    // Wrap formatting so per-value allowDecimals=false renders as integer (no trailing .00).
    // This is intentionally a formatting-only change (aggregation math remains unchanged).
    this.aggregator = () => {
      const agg = baseAggregatorFactory();
      return {
        ...agg,
        format: (x, valueIndex) => {
          const idx = valueIndex ?? 0;
          const valueKey = this.config.values[idx];
          const allowDecimals = valueKey != null ? this.config.getAllowDecimals?.(valueKey) : undefined;
          if (allowDecimals === false) {
            const formatted = agg.format(x, idx);
            // Preserve suppressed marker / empty output from underlying aggregator.
            if (formatted === '' || formatted === SUPPRESSED_MARKER) {
              return formatted;
            }
            // Remove any decimal portion (e.g. "1,234.00" -> "1,234").
            return formatted.replace(/[.][0-9]+$/, '');
          }
          return agg.format(x, idx);
        },
      };
    };
    this.tree = {};
    this.recordsTree = {};
    this.rowKeys = [];
    this.colKeys = [];
    this.rowTotals = {};
    this.colTotals = {};
    this.allTotal = this.aggregator();
    this.sorted = false;
    this.init(inputProps);
  }
  init(inputProps) {
    if (this.config.rows.length === 0) {
      showError('You must choose at least one field for pivot rows!');
      return;
    }
    if ((this.config.values?.length ?? 0) === 0) {
      showError('You must choose at least one field for pivot values!');
      return;
    }
    let data = this.config.data;
    const filters = inputProps.filters;
    if (filters) {
      const filterKVs = [];
      for (const [key, value] of entries(filters)) {
        if (value && value.length > 0) {
          filterKVs.push([key, value]);
        }
      }
      if (filterKVs.length) {
        data = data.filter((item) => {
          for (let i = 0; i < filterKVs.length; ++i) {
            const [key, value] = filterKVs[i];
            let found = false;
            for (let j = 0; j < value.length; ++j) {
              // @ts-expect-error key is valid
              if (item[key] === value[j]) {
                found = true;
              }
            }
            if (!found) {
              return false;
            }
          }
          return true;
        });
      }
    }
    // iterate through input, accumulating data for cells
    forEachRecord(data, this.processRecord);
  }
  doSort = (sort) => {
    const sortChanged = this.sortKeys(sort);
    if (sortChanged) {
      this.removeHeaderTotalsWithSingleColumn();
      this.removeRowTotalsWithSingleRow();
    }
    return sortChanged;
  };
  // removes the header totals with a single column, since they are not
  // useful and just add noise to the table
  removeHeaderTotalsWithSingleColumn() {
    if (this.colKeys.length === 0) {
      return; // nothing to do here, we have no columns at all.
    }
    const removalIndices = [];
    const keyCounts = this.colKeys[0].map(() => 0); // Track the number of rows in the group for row segments
    for (let i = this.colKeys.length - 1; i >= 0; i--) {
      const row = this.colKeys[i];
      const idx = row.indexOf(ROW_SPAN);
      if (idx !== -1) {
        if (keyCounts[idx] === 1) {
          removalIndices.push(i);
          keyCounts[idx] = 0;
        } else {
          for (let j = idx; j < row.length; j++) {
            keyCounts[j] = 0;
          }
          if (idx === 1) {
            // the zeroth index will never be a $col-span$ so we need to reset it
            // if the first index is a $col-span$
            keyCounts[0] = 0;
          }
        }
      } else {
        for (let j = 0; j < row.length; j++) {
          keyCounts[j] += 1;
        }
      }
    }
    // remove from the end to avoid index shifting
    removalIndices.forEach((index) => {
      this.colKeys.splice(index, 1);
    });
  }
  // removes the row totals with a single row
  removeRowTotalsWithSingleRow() {
    if (this.rowKeys.length === 0) {
      return; // nothing to do here, we have no columns at all.
    }
    const removalIndices = [];
    const keyCounts = this.rowKeys[0].map(() => 0); // Track the number of rows in the group for row segments
    for (let i = this.rowKeys.length - 1; i >= 0; i--) {
      const row = this.rowKeys[i];
      const idx = row.indexOf(COL_SPAN);
      if (idx !== -1) {
        if (keyCounts[idx] === 1) {
          removalIndices.push(i);
          keyCounts[idx] = 0;
        } else {
          for (let j = idx; j < row.length; j++) {
            keyCounts[j] = 0;
          }
          if (idx === 1) {
            // the zeroth index will never be a $col-span$ so we need to reset it
            // if the first index is a $col-span$
            keyCounts[0] = 0;
          }
        }
      } else {
        for (let j = 0; j < row.length; j++) {
          keyCounts[j] += 1;
        }
      }
    }
    // remove from the end to avoid index shifting
    removalIndices.forEach((index) => {
      this.rowKeys.splice(index, 1);
    });
  }
  /** Returns indices to collapse so only the first row dimension is visible (e.g. Region only). */
  getIndicesToCollapseAllRows() {
    const removalIndices = [];
    const n = this.config.rows.length;
    if (n <= 1) return removalIndices;
    const valuesInRows = this.config.valuesPosition === 'rows' && (this.config.values?.length ?? 0) > 1;
    const rowMetricCount = valuesInRows
      ? (this.config.values?.length ?? 0) + (this.config.calculatedColumns?.length ?? 0)
      : 1;
    for (let i = 0; i < this.rowKeys.length; i++) {
      const row = this.rowKeys[i];
      if (row[0] === COL_SPAN || row[0] === BOTH_SPAN) continue;
      const isFirstInGroup = i === 0 || row[0] !== this.rowKeys[i - 1][0];
      const hasChildren =
        i + 1 < this.rowKeys.length && (this.rowKeys[i + 1][0] === row[0] || this.rowKeys[i + 1][0] === COL_SPAN);
      if (isFirstInGroup && hasChildren) {
        const tableRowIndex = i * rowMetricCount;
        removalIndices.push([tableRowIndex, 0]);
      }
    }
    return removalIndices;
  }
  /** Returns indices to collapse so only the first column dimension is visible (e.g. channel only). */
  getIndicesToCollapseAllColumns() {
    const removalIndices = [];
    const colDepth = this.config.cols?.length ?? 0;
    if (colDepth <= 1) return removalIndices;
    const header = this.getHeader();
    if (header.length === 0) return removalIndices;
    const valuesInRows = this.config.valuesPosition === 'rows' && (this.config.values?.length ?? 0) > 1;
    const calcCols = this.config.calculatedColumns ?? [];
    const colKeys = this.getColKeys();
    const valuesBeforeCols =
      !valuesInRows &&
      this.config.columnsBeforeValues !== false &&
      colKeys.length > 0 &&
      (colKeys.length > 1 || colKeys[0].length > 0) &&
      (this.config.values.length > 1 || calcCols.length > 0);
    // When valuesBeforeCols, row 0 contains value/calc names (not column dimensions).
    // The first column dimension row is row 1. Otherwise it's row 0.
    const scanRow = valuesBeforeCols ? 1 : 0;
    if (scanRow >= header.length) return removalIndices;
    const fixedCount = this.config.rows.length + (this.config.measure != null ? 1 : 0) + (valuesInRows ? 1 : 0);
    const headerRow = header[scanRow];
    // Only scan data columns, not the Total area at the end.
    // Data column count = colKeys × valueCount (for colsBeforeVals / valuesBeforeCols)
    // or colKeys.length for the standard layout.
    const colsBeforeVals =
      !valuesInRows &&
      this.config.columnsBeforeValues === false &&
      colKeys.length > 0 &&
      (colKeys.length > 1 || colKeys[0].length > 0) &&
      (this.config.values.length > 1 || calcCols.length > 0);
    const valueCount = this.config.values.length + calcCols.length;
    const dataColCount = valuesBeforeCols || colsBeforeVals ? colKeys.length * valueCount : colKeys.length;
    const scanEnd = fixedCount + dataColCount;
    for (let i = fixedCount; i < scanEnd; i++) {
      const val = headerRow[i];
      if (val === COL_SPAN || val === ROW_SPAN || val === COL_VALUE_SPAN) continue;
      if (i + 1 < scanEnd && headerRow[i + 1] === COL_SPAN) {
        removalIndices.push([scanRow, i]);
      }
    }
    return removalIndices;
  }
  arrSort(attrs, sort) {
    let a;
    const sortersArr = [];
    for (a of Array.from(attrs)) {
      sortersArr.push(getSort(this.config.sorters, a));
    }
    const getAggregator = this.getAggregator;
    const measure = this.config.measure;
    return (a, b) => {
      if (sort != null) {
        const { colKeys, direction } = sort;
        const directionValue = direction === 'ascending' ? 1 : -1;
        const len = a.length;
        for (let i = 0; i <= len; i++) {
          const result = compareSpans(a[i], b[i]);
          if (typeof result === 'number') {
            return result;
          }
          if (result) {
            continue;
          }
          const arrayA = a.slice(0, i + 1);
          const arrayB = b.slice(0, i + 1);
          const aa = getAggregator(arrayA, colKeys);
          const ba = getAggregator(arrayB, colKeys);
          const aaValue = aa.values()[0];
          const baValue = ba.values()[0];
          if (aaValue === baValue) {
            if (a[i] === b[i]) {
              continue;
            }
            return a[i].localeCompare(b[i]);
          }
          return (aaValue - baValue) * directionValue;
        }
        if (measure != null) {
          const measureA = a[len - 1];
          const measureB = b[len - 1];
          const result = compareSpans(measureA, measureB);
          if (typeof result === 'number') {
            return result;
          }
          const aa = getAggregator(a, colKeys);
          const ba = getAggregator(b, colKeys);
          const aaValue = aa.values()[0];
          const baValue = ba.values()[0];
          if (aaValue !== baValue) {
            return (aaValue - baValue) * directionValue;
          }
        }
      }
      for (let i = 0; i < sortersArr.length; i++) {
        const sorter = sortersArr[i];
        const result = compareSpans(a[i], b[i]);
        if (typeof result === 'number') {
          return result;
        }
        if (result) {
          continue;
        }
        const comparison = sorter(a[i], b[i]);
        if (comparison !== 0) {
          return comparison;
        }
      }
      return 0;
    };
  }
  sortKeys(sort) {
    if (!this.sorted || this.config.sort !== sort) {
      this.sorted = true;
      this.config.sort = sort;
      this.rowKeys.sort(
        this.arrSort(this.config.measure != null ? [...this.config.rows, this.config.measure] : this.config.rows, sort),
      );
      this.colKeys.sort(this.arrSort(this.config.cols));
      return true;
    }
    return false;
  }
  getColKeys() {
    return this.colKeys;
  }
  /** Header when values/calcs are outermost, column dimensions nested (Excel-style "values before columns"). */
  getHeaderValuesBeforeCols(colKeys, values, calcCols, len) {
    const headerRows = [];
    const valueCount = values.length + calcCols.length;
    // Row 0: value/calc names as top level, each spanning colKeys.length
    const topRow = [...this.config.rows];
    if (this.config.measure != null) topRow.push(this.config.measure);
    for (let v = 0; v < values.length; v++) {
      const aggName = this.config.valueAggregators?.[values[v]] ?? this.config.aggregatorName;
      const displayLabel = `${aggName} of ${this.config.getValueLabel?.(values[v]) ?? values[v]}`;
      topRow.push(displayLabel);
      for (let k = 1; k < colKeys.length; k++) topRow.push(COL_SPAN);
    }
    for (const calc of calcCols) {
      topRow.push(calc.name);
      for (let k = 1; k < colKeys.length; k++) topRow.push(COL_SPAN);
    }
    if (this.config.showRowTotals && this.config.cols.length) {
      let label = totalLabel(this.config.aggregatorName);
      if (this.config.getTotalLabel) {
        label = this.config.getTotalLabel({
          aggregatorName: this.config.aggregatorName,
          defaultLabel: label,
          values: this.config.values,
          location: 'header',
        });
      }
      topRow.push(label);
      for (let t = 1; t < valueCount; t++) {
        topRow.push(COL_SPAN);
      }
    }
    headerRows.push(topRow);
    // Rows 1..len: col dimension values, repeated for each value/calc block
    for (let i = 0; i < len; i++) {
      const headerRow = this.config.rows.map(() => ROW_SPAN);
      if (this.config.measure != null) headerRow.push(ROW_SPAN);
      for (let v = 0; v < valueCount; v++) {
        colKeys.forEach((c, idx) => {
          const val = c[i];
          if (i === len - 1) {
            headerRow.push(val);
            return;
          }
          const prevC = colKeys[idx - 1];
          let span = !!prevC;
          for (let j = i; prevC && j >= 0; j--) {
            if (prevC[j] !== c[j]) {
              span = false;
              break;
            }
          }
          headerRow.push(span ? COL_SPAN : val);
        });
      }
      if (this.config.showRowTotals && this.config.cols.length) {
        if (i === len - 1) {
          // Last dimension row: individual value/calc labels for Total columns
          for (let v = 0; v < values.length; v++) {
            const valueKey = values[v];
            const aggName = this.config.valueAggregators?.[valueKey] ?? this.config.aggregatorName;
            const displayLabel = `${aggName} of ${this.config.getValueLabel?.(valueKey) ?? valueKey}`;
            headerRow.push(displayLabel);
          }
          for (const calc of calcCols) {
            headerRow.push(calc.name);
          }
        } else {
          for (let t = 0; t < valueCount; t++) {
            headerRow.push(ROW_SPAN);
          }
        }
      }
      headerRows.push(headerRow);
    }
    return headerRows;
  }
  /**
   * Header when columnsBeforeValues is false: one column per (colKey, value/calc) in the same
   * order as getDataColumnSequence() so header and data column indices align.
   */
  getHeaderColsBeforeValues(colKeys, values, calcCols, len) {
    const seq = this.getDataColumnSequence();
    const headerRows = [];
    for (let i = 0; i < len; i++) {
      const headerRow = this.config.rows.map((r) => (i > 0 ? ROW_SPAN : r));
      if (this.config.measure != null) {
        headerRow.push(i > 0 ? ROW_SPAN : this.config.measure);
      }
      for (let s = 0; s < seq.length; s++) {
        const { colKeyIdx } = seq[s];
        const c = colKeys[colKeyIdx];
        const val = c[i];
        const prevColKeyIdx = s > 0 ? seq[s - 1].colKeyIdx : -1;
        const prevC = prevColKeyIdx >= 0 ? colKeys[prevColKeyIdx] : null;
        let span = !!prevC;
        for (let j = i; prevC && j >= 0; j--) {
          if (prevC[j] !== c[j]) {
            span = false;
            break;
          }
        }
        headerRow.push(span ? COL_SPAN : val);
      }
      if (this.config.showRowTotals && this.config.cols.length) {
        const valueCount = values.length + calcCols.length;
        const totalLabelResolved =
          i === 0
            ? this.config.getTotalLabel
              ? this.config.getTotalLabel({
                  aggregatorName: this.config.aggregatorName,
                  defaultLabel: totalLabel(this.config.aggregatorName),
                  values: this.config.values,
                  location: 'header',
                })
              : totalLabel(this.config.aggregatorName)
            : ROW_SPAN;
        headerRow.push(totalLabelResolved);
        for (let t = 1; t < valueCount; t++) {
          headerRow.push(i === 0 ? COL_SPAN : ROW_SPAN);
        }
      }
      headerRows.push(headerRow);
    }
    // Value/calc labels row: one cell per seq entry
    const valueRow = this.config.rows.map(() => ROW_SPAN);
    if (this.config.measure != null) valueRow.push(ROW_SPAN);
    for (const { valueIdx, calcIdx } of seq) {
      if (valueIdx !== undefined) {
        const valueKey = values[valueIdx];
        const aggName = this.config.valueAggregators?.[valueKey] ?? this.config.aggregatorName;
        const displayLabel = `${aggName} of ${this.config.getValueLabel?.(valueKey) ?? valueKey}`;
        valueRow.push(displayLabel);
      } else if (calcIdx !== undefined) {
        valueRow.push(calcCols[calcIdx]?.name ?? '');
      }
    }
    if (this.config.showRowTotals && this.config.cols.length) {
      // Individual value/calc labels matching the data column structure
      for (let v = 0; v < values.length; v++) {
        const valueKey = values[v];
        const aggName = this.config.valueAggregators?.[valueKey] ?? this.config.aggregatorName;
        const displayLabel = `${aggName} of ${this.config.getValueLabel?.(valueKey) ?? valueKey}`;
        valueRow.push(displayLabel);
      }
      for (const calc of calcCols) {
        valueRow.push(calc.name);
      }
    }
    headerRows.push(valueRow);
    return headerRows;
  }
  /**
   * Returns the sequence of data columns (colKeyIdx, valueIdx or calcIdx) for iteration.
   * When columnsBeforeValues: for each colKey, all values then all calcs.
   * When valuesBeforeColumns: for each value/calc, all colKeys.
   */
  getDataColumnSequence() {
    const colKeys = this.getColKeys();
    const values = this.config.values;
    const calcCols = this.config.calculatedColumns ?? [];
    // When columnsBeforeValues is true: for each value, show colKeys (values outermost)
    const colsBeforeVals = this.config.columnsBeforeValues === false;
    const valuesInRows = (this.config.valuesPosition ?? 'columns') === 'rows' && values.length > 1;
    if (valuesInRows) {
      return [];
    }
    // When no column dimensions are configured, values are bundled into a single
    // cell by the getTableData() fallback. Return empty to prevent individual columns.
    if (this.config.cols.length === 0) {
      return [];
    }
    const hasSingleEmptyCol = colKeys.length === 1 && colKeys[0].length === 0;
    const effectiveColKeys = colKeys.length === 0 ? [[]] : colKeys;
    const seq = [];
    const colKeysToUse = hasSingleEmptyCol ? effectiveColKeys : colKeys;
    if (colsBeforeVals) {
      for (let k = 0; k < colKeysToUse.length; k++) {
        for (let v = 0; v < values.length; v++) {
          seq.push({ colKeyIdx: k, valueIdx: v });
        }
        for (let c = 0; c < calcCols.length; c++) {
          seq.push({ colKeyIdx: k, calcIdx: c });
        }
      }
    } else {
      for (let v = 0; v < values.length; v++) {
        for (let k = 0; k < colKeysToUse.length; k++) {
          seq.push({ colKeyIdx: k, valueIdx: v });
        }
      }
      for (let c = 0; c < calcCols.length; c++) {
        for (let k = 0; k < colKeysToUse.length; k++) {
          seq.push({ colKeyIdx: k, calcIdx: c });
        }
      }
    }
    return seq;
  }
  getRowKeys() {
    return this.rowKeys;
  }
  // Get all records for calculated column grand total
  getAllRecordsForCalculatedColumn() {
    const allRecords = [];
    const hasCalculatedColumns = (this.config.calculatedColumns?.length ?? 0) > 0;
    if (!hasCalculatedColumns) {
      return allRecords;
    }
    // Collect all records from recordsTree
    for (const rowKey in this.recordsTree) {
      const colTree = this.recordsTree[rowKey];
      for (const colKey in colTree) {
        const records = colTree[colKey];
        if (records) {
          allRecords.push(...records);
        }
      }
    }
    return allRecords;
  }
  // Get all records for a specific column key (for column totals in calculated columns)
  getAllRecordsForColumnKey(colKey) {
    const allRecords = [];
    const hasCalculatedColumns = (this.config.calculatedColumns?.length ?? 0) > 0;
    if (!hasCalculatedColumns) {
      return allRecords;
    }
    const flatColKey = colKey.filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN).join(String.fromCharCode(0));
    // Collect all records for this column key across all row keys
    for (const rowKey in this.recordsTree) {
      const records = this.recordsTree[rowKey]?.[flatColKey];
      if (records) {
        allRecords.push(...records);
      }
    }
    return allRecords;
  }
  processRecord = (record) => {
    // this code is called in a tight loop
    const colKey = [];
    const rowKey = [];
    const measure = this.config.measure;
    const { getTextValue } = this.config;
    const colsLen = this.config.cols.length;
    for (let i = 0; i < colsLen; i++) {
      const x = this.config.cols[i];
      colKey.push(getTextValue(record, x));
    }
    const rowsLen = this.config.rows.length;
    for (let i = 0; i < rowsLen; i++) {
      const x = this.config.rows[i];
      rowKey.push(getTextValue(record, x));
    }
    let measureValue;
    if (measure != null) {
      measureValue = getTextValue(record, measure) || 'none';
      rowKey.push(measureValue);
    }
    const flatRowKey = rowKey.join(String.fromCharCode(0));
    const flatColKey = colKey.join(String.fromCharCode(0));
    this.allTotal.push(record);
    if (rowKey.length !== 0) {
      if (!this.rowTotals[flatRowKey]) {
        this.rowKeys.push(rowKey);
        this.rowTotals[flatRowKey] = this.aggregator();
        for (let i = 0; i < rowsLen - 1; i++) {
          const parentKeyArray = rowKey.slice(0, i + 1);
          let parentKey = parentKeyArray.join(String.fromCharCode(0));
          if (!this.rowTotals[parentKey]) {
            const totalRowKey = rowKey.slice(0, i + 1);
            for (let j = i + 1; j < rowKey.length; j++) {
              totalRowKey.push(COL_SPAN);
            }
            this.rowKeys.push(totalRowKey);
            this.rowTotals[parentKey] = this.aggregator();
          }
          if (measureValue != null) {
            // add totals for each parent key with measure value
            if (i < rowKey.length - 2) {
              parentKeyArray.push(measureValue);
            }
            parentKey = parentKeyArray.join(String.fromCharCode(0));
            if (!this.rowTotals[parentKey]) {
              const totalRowKey = rowKey.slice(0, i + 1);
              for (let j = i + 1; j < rowKey.length; j++) {
                if (measureValue && j === rowKey.length - 1) {
                  totalRowKey.push(measureValue);
                } else {
                  totalRowKey.push(BOTH_SPAN);
                }
              }
              this.rowKeys.push(totalRowKey);
              this.rowTotals[parentKey] = this.aggregator();
            }
          }
        }
      }
      if (this.config.showRowTotals || colsLen === 0) {
        for (let i = 0; i < rowsLen - 1; i++) {
          const parentKeyArray = rowKey.slice(0, i + 1);
          let parentKey = parentKeyArray.join(String.fromCharCode(0));
          // Always accumulate parent row totals. Row summary cells and
          // the "Total" column in the grid depend on these aggregates
          // even when column totals/footer rows are hidden.
          // Also needed when cols is empty: getAggregator(rowKey, [])
          // returns rowTotals, which is the only data source for body cells.
          const parentAggr = this.rowTotals[parentKey];
          if (parentAggr) {
            parentAggr.push(record);
          }
          if (measureValue != null) {
            parentKeyArray.push(measureValue);
            parentKey = parentKeyArray.join(String.fromCharCode(0));
            const measureAggr = this.rowTotals[parentKey];
            if (measureAggr) {
              measureAggr.push(record);
            }
          }
        }
        this.rowTotals[flatRowKey].push(record);
      }
    }
    if (colKey.length !== 0) {
      if (!this.colTotals[flatColKey]) {
        this.colKeys.push(colKey);
        this.colTotals[flatColKey] = this.aggregator();
        for (let j = 0; j < colKey.length - 1; j++) {
          const parentColKey = colKey.slice(0, j + 1).join(String.fromCharCode(0));
          if (!this.colTotals[parentColKey]) {
            const totalColKey = colKey.slice(0, j + 1);
            for (let k = j + 1; k < colKey.length; k++) {
              totalColKey.push(ROW_SPAN);
            }
            this.colKeys.push(totalColKey);
            this.colTotals[parentColKey] = this.aggregator();
          }
        }
      }
      if (this.config.showColumnTotals) {
        for (let j = 0; j < colKey.length - 1; j++) {
          const parentColKey = colKey.slice(0, j + 1).join(String.fromCharCode(0));
          this.colTotals[parentColKey].push(record);
        }
        this.colTotals[flatColKey].push(record);
      }
    }
    const hasCalculatedColumns = (this.config.calculatedColumns?.length ?? 0) > 0;
    // Initialize recordsTree for calculated columns when there are rows but no columns
    if (rowsLen !== 0 && hasCalculatedColumns && colKey.length === 0) {
      for (let i = 0; i < rowsLen; i++) {
        const parentKeyArray = rowKey.slice(0, i + 1);
        let parentRowKey = parentKeyArray.join(String.fromCharCode(0));
        if (!this.recordsTree[parentRowKey]) {
          this.recordsTree[parentRowKey] = {};
        }
        // Use empty string as colKey when there are no column dimensions
        if (!this.recordsTree[parentRowKey]['']) {
          this.recordsTree[parentRowKey][''] = [];
        }
        if (measureValue != null) {
          parentKeyArray.push(measureValue);
          parentRowKey = parentKeyArray.join(String.fromCharCode(0));
          if (!this.recordsTree[parentRowKey]) {
            this.recordsTree[parentRowKey] = {};
          }
          if (!this.recordsTree[parentRowKey]['']) {
            this.recordsTree[parentRowKey][''] = [];
          }
        }
      }
      // Populate records for row-only pivots
      for (let i = 0; i < rowsLen; i++) {
        const parentKeyArray = rowKey.slice(0, i + 1);
        let parentRowKey = parentKeyArray.join(String.fromCharCode(0));
        // Compare i against rowsLen - 1 (last row index) not rowKey.length - 1 (which includes measure)
        if (this.config.showColumnTotals || i === rowsLen - 1) {
          const records = this.recordsTree[parentRowKey]?.[''];
          if (records) {
            records.push(record);
          }
        }
        if (measureValue != null) {
          // Always add measure value for row-only pivots when iterating through row indices
          parentKeyArray.push(measureValue);
          parentRowKey = parentKeyArray.join(String.fromCharCode(0));
          const records = this.recordsTree[parentRowKey]?.[''];
          if (records) {
            records.push(record);
          }
        }
      }
    }
    if (colKey.length !== 0 && rowsLen !== 0) {
      for (let i = 0; i < rowsLen; i++) {
        const parentKeyArray = rowKey.slice(0, i + 1);
        let parentRowKey = parentKeyArray.join(String.fromCharCode(0));
        if (!this.tree[parentRowKey]) {
          this.tree[parentRowKey] = {};
        }
        if (hasCalculatedColumns && !this.recordsTree[parentRowKey]) {
          this.recordsTree[parentRowKey] = {};
        }
        for (let j = 0; j < colKey.length; j++) {
          const parentColKey = colKey.slice(0, j + 1).join(String.fromCharCode(0));
          if (!this.tree[parentRowKey][parentColKey]) {
            this.tree[parentRowKey][parentColKey] = this.aggregator();
          }
          if (hasCalculatedColumns && !this.recordsTree[parentRowKey][parentColKey]) {
            this.recordsTree[parentRowKey][parentColKey] = [];
          }
        }
        if (measureValue != null) {
          parentKeyArray.push(measureValue);
          parentRowKey = parentKeyArray.join(String.fromCharCode(0));
          if (!this.tree[parentRowKey]) {
            this.tree[parentRowKey] = {};
          }
          if (hasCalculatedColumns && !this.recordsTree[parentRowKey]) {
            this.recordsTree[parentRowKey] = {};
          }
          for (let j = 0; j < colKey.length; j++) {
            const parentColKey = colKey.slice(0, j + 1).join(String.fromCharCode(0));
            if (!this.tree[parentRowKey][parentColKey]) {
              this.tree[parentRowKey][parentColKey] = this.aggregator();
            }
            if (hasCalculatedColumns && !this.recordsTree[parentRowKey][parentColKey]) {
              this.recordsTree[parentRowKey][parentColKey] = [];
            }
          }
        }
      }
      for (let i = 0; i < rowsLen; i++) {
        const parentKeyArray = rowKey.slice(0, i + 1);
        let parentRowKey = parentKeyArray.join(String.fromCharCode(0));
        // Push to all parent levels: leaf (for data cells) and parents (for subtotal rows when showRowTotals).
        // Previously we only pushed when showColumnTotals or at leaf, causing blank subtotal rows.
        if (this.config.showColumnTotals || this.config.showRowTotals || i === rowKey.length - 1) {
          for (let j = 0; j < colKey.length; j++) {
            const parentColKey = colKey.slice(0, j + 1).join(String.fromCharCode(0));
            this.tree[parentRowKey][parentColKey].push(record);
            if (hasCalculatedColumns) {
              this.recordsTree[parentRowKey][parentColKey].push(record);
            }
          }
        }
        if (measureValue != null) {
          if (i < rowKey.length - 1) {
            parentKeyArray.push(measureValue);
          }
          parentRowKey = parentKeyArray.join(String.fromCharCode(0));
          for (let j = 0; j < colKey.length; j++) {
            const parentColKey = colKey.slice(0, j + 1).join(String.fromCharCode(0));
            this.tree[parentRowKey][parentColKey].push(record);
            if (hasCalculatedColumns) {
              this.recordsTree[parentRowKey][parentColKey].push(record);
            }
          }
        }
      }
    }
  };
  getAggregator = (rowKey, colKey) => {
    let agg;
    const flatRowKey = rowKey.filter((v) => !SPANS.includes(v)).join(String.fromCharCode(0));
    const flatColKey = colKey.filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN).join(String.fromCharCode(0));
    if (rowKey.length === 0 && colKey.length === 0) {
      agg = this.allTotal;
    } else if (rowKey.length === 0) {
      agg = this.colTotals[flatColKey];
    } else if (colKey.length === 0) {
      agg = this.rowTotals[flatRowKey];
    } else {
      agg = this.tree[flatRowKey]?.[flatColKey];
    }
    const config = this.config;
    return (
      agg || {
        values() {
          return config.values.map(() => 0);
        },
        format() {
          return '';
        },
        push() {},
      }
    );
  };
  // returns the header rows
  getHeader() {
    const colKeys = this.getColKeys();
    if (colKeys.length === 0) {
      colKeys.push([]);
    }
    const headerRows = [];
    const values = this.config.values;
    const calcCols = this.config.calculatedColumns ?? [];
    const valuesPosition = this.config.valuesPosition ?? 'columns';
    const valuesInRows = valuesPosition === 'rows' && values.length > 1;
    // When columnsBeforeValues is true: for each value, show column dimensions (values outermost)
    // When false: for each column dimension, show all values (cols outermost)
    const valuesBeforeCols =
      !valuesInRows &&
      this.config.columnsBeforeValues !== false &&
      colKeys.length > 0 &&
      (colKeys.length > 1 || colKeys[0].length > 0) &&
      (values.length > 1 || calcCols.length > 0);
    const len = Math.max(colKeys[0].length, 1);
    // When columnsBeforeValues is false, data columns are ordered by getDataColumnSequence()
    // (for each colKey, all values then calcs). Build header with the same sequence so
    // header column count and order match the data and body cells align correctly.
    const colsBeforeVals =
      !valuesInRows &&
      this.config.columnsBeforeValues === false &&
      colKeys.length > 0 &&
      (colKeys.length > 1 || colKeys[0].length > 0) &&
      (values.length > 1 || calcCols.length > 0);
    if (valuesBeforeCols) {
      return this.getHeaderValuesBeforeCols(colKeys, values, calcCols, len);
    }
    if (colsBeforeVals) {
      return this.getHeaderColsBeforeValues(colKeys, values, calcCols, len);
    }
    for (let i = 0; i < len; i++) {
      const headerRow = this.config.rows.map((r) => {
        if (i > 0) {
          return ROW_SPAN;
        }
        return r;
      });
      if (this.config.measure != null) {
        if (i > 0) {
          headerRow.push(ROW_SPAN);
        } else {
          headerRow.push(this.config.measure);
        }
      }
      // Add "Values" column header when values are positioned in rows
      if (valuesInRows) {
        headerRow.push(i === 0 ? 'Values' : ROW_SPAN);
      }
      if (colKeys.length === 1 && colKeys[0].length === 0) {
        if (values.length === 1) {
          const displayLabel = this.config.getValueLabel?.(values[0]) ?? values[0];
          const aggName = this.config.valueAggregators?.[values[0]] ?? this.config.aggregatorName ?? 'Count';
          headerRow.push(`${aggName} of ${displayLabel}`);
        } else {
          headerRow.push(this.config.aggregatorName ?? 'Count');
        }
      } else {
        colKeys.forEach((c, idx) => {
          let val = c[i];
          if (i === len - 1) {
            // last row value is always unique
            headerRow.push(val);
            return;
          }
          const prevC = colKeys[idx - 1];
          let span = !!prevC;
          for (let j = i; prevC && j >= 0; j--) {
            if (prevC[j] !== c[j]) {
              span = false;
              break;
            }
          }
          if (span) {
            val = COL_SPAN;
          }
          headerRow.push(val);
        });
      }
      if (this.config.showRowTotals && this.config.cols.length) {
        let label = totalLabel(this.config.aggregatorName);
        if (this.config.getTotalLabel) {
          label = this.config.getTotalLabel({
            aggregatorName: this.config.aggregatorName,
            defaultLabel: label,
            values: this.config.values,
            location: 'header',
          });
        }
        headerRow.push(i === 0 ? label : ROW_SPAN);
      }
      // Add calculated column headers.
      // When there are multiple value columns, we want the calculated column labels
      // to appear on the "value" header row (one level under the aggregator),
      // not repeated under each column dimension. To keep the column counts aligned
      // for the upper header rows, we just append ROW_SPAN placeholders here.
      // For the single-value case, we keep the previous behaviour so the label
      // still appears alongside the other column headers.
      // When valuesInRows is true, calculated columns become rows (like values), so we
      // do NOT add them as column headers here.
      if (this.config.calculatedColumns && this.config.calculatedColumns.length > 0 && !valuesInRows) {
        if (values.length > 1) {
          for (const _ of this.config.calculatedColumns) {
            // One placeholder per data column
            colKeys.forEach(() => {
              headerRow.push(ROW_SPAN);
            });
            // And one for the row totals column (if present)
            if (this.config.cols.length) {
              headerRow.push(ROW_SPAN);
            }
          }
        } else {
          for (const calcCol of this.config.calculatedColumns) {
            // One header per data column, same behaviour as before
            colKeys.forEach((c, idx) => {
              if (i === len - 1) {
                headerRow.push(calcCol.name);
              } else {
                const prevC = colKeys[idx - 1];
                let span = !!prevC;
                for (let j = i; prevC && j >= 0; j--) {
                  if (prevC[j] !== c[j]) {
                    span = false;
                    break;
                  }
                }
                headerRow.push(span ? COL_SPAN : calcCol.name);
              }
            });
            // Header for row totals column
            if (this.config.cols.length) {
              headerRow.push(i === 0 ? calcCol.name : ROW_SPAN);
            }
          }
        }
      }
      headerRows.push(headerRow);
    }
    // Only add the COL_VALUE_SPAN row when values are in columns (not in rows)
    if (values.length > 1 && !valuesInRows) {
      const headerRow = this.config.rows.map(() => ROW_SPAN);
      if (this.config.measure != null) {
        headerRow.push(ROW_SPAN);
      }
      colKeys.forEach(() => {
        headerRow.push(COL_VALUE_SPAN);
      });
      if (this.config.showRowTotals && this.config.cols.length) {
        headerRow.push(COL_VALUE_SPAN);
      }
      // Add headers for each calculated column: show the calculated column name
      // once, spanning all of its underlying data columns (and the total column,
      // when present) using COL_SPAN.
      if (this.config.calculatedColumns && this.config.calculatedColumns.length > 0) {
        for (const calcCol of this.config.calculatedColumns) {
          let isFirstCell = true;
          colKeys.forEach(() => {
            if (isFirstCell) {
              headerRow.push(calcCol.name);
              isFirstCell = false;
            } else {
              headerRow.push(COL_SPAN);
            }
          });
          if (this.config.cols.length) {
            headerRow.push(COL_SPAN);
          }
        }
      }
      headerRows.push(headerRow);
    }
    return headerRows;
  }
  getCellData(rowIndex, columnIndex) {
    const data = {};
    if (rowIndex !== -1) {
      const row = this.getRowKeys()[rowIndex];
      this.config.rows.forEach((r, index) => {
        if (!SPANS.includes(row[index])) {
          data[r] = row[index];
        }
      });
      if (this.config.measure != null) {
        data[this.config.measure] = row[this.config.rows.length];
      }
    }
    if (columnIndex < this.getColKeys().length) {
      const col = this.getColKeys()[columnIndex];
      this.config.cols.forEach((c, index) => {
        if (!SPANS.includes(col[index])) {
          data[c] = col[index];
        }
      });
    }
    return data;
  }
  formatCalcResult(calcResult, hideZeroValues, formula) {
    if (Number.isNaN(calcResult)) return SUPPRESSED_MARKER;
    if (calcResult === 0 && hideZeroValues) return '';
    if (formula.mathOperator === '%' || formula.multiplier === 100) return `${calcResult.toFixed(2)}%`;
    return calcResult.toFixed(2);
  }
  computeCalcForRecords(calcCol, records, hideZeroValues) {
    if (!calcCol || calcCol.formula.type !== 'aggregation' || records.length === 0) {
      return '';
    }
    const result = computeCalculatedColumn(
      calcCol.formula,
      records,
      this.config.getNumberValue,
      this.config.getTextValue,
    );
    return this.formatCalcResult(result, hideZeroValues, calcCol.formula);
  }
  resolvedTotalLabel() {
    let label = totalLabel(this.config.aggregatorName);
    if (this.config.getTotalLabel) {
      label = this.config.getTotalLabel({
        aggregatorName: this.config.aggregatorName,
        defaultLabel: label,
        values: this.config.values,
        location: 'footer',
      });
    }
    return label;
  }
  /**
   * Returns the footer row(s) that mirror what `SimplePivotTableFooterCell` renders.
   * Each row uses the same cell layout as `getTableData()`: row-dimension labels first,
   * then per-column data cells (single-element arrays when values are exploded into
   * individual columns, multi-element arrays for bundled cells), followed by row totals.
   *
   * - Returns an empty array when `showColumnTotals` is disabled.
   * - Returns N rows when `valuesPosition: 'rows'` with multiple metrics (one per metric).
   * - Returns 1 row otherwise.
   */
  getFooter() {
    if (this.config.showColumnTotals === false) return [];
    const colKeys = this.getColKeys();
    const effectiveColKeys = colKeys.length === 0 ? [[]] : colKeys;
    const values = this.config.values;
    const calcCols = this.config.calculatedColumns ?? [];
    const valuesPosition = this.config.valuesPosition ?? 'columns';
    const valuesInRows = valuesPosition === 'rows' && values.length > 1;
    const hideZeroValues = this.config.hideZeroValues;
    const showGrandTotal = this.config.showGrandTotal !== false;
    const hasCols = this.config.cols.length > 0;
    const showRowTotals = this.config.showRowTotals !== false && hasCols;
    const totalLabelText = this.resolvedTotalLabel();
    const hasMultiMetrics = values.length > 1 || calcCols.length > 0;
    const hasColDims = effectiveColKeys.length > 0 && (effectiveColKeys.length > 1 || effectiveColKeys[0].length > 0);
    const valuesBeforeCols =
      !valuesInRows && this.config.columnsBeforeValues !== false && hasColDims && hasMultiMetrics;
    const colsBeforeValues =
      !valuesInRows && this.config.columnsBeforeValues === false && hasColDims && hasMultiMetrics;
    const hasExpandedTotals = valuesBeforeCols || colsBeforeValues;
    const fmtAggValue = (vals, idx, agg) => {
      const v = vals[idx];
      return v === 0 && hideZeroValues ? '' : agg.format(v, idx);
    };
    if (valuesInRows) {
      const rows = [];
      const metricCount = values.length + calcCols.length;
      for (let m = 0; m < metricCount; m++) {
        const isValueMetric = m < values.length;
        const valueIdx = isValueMetric ? m : -1;
        const calcCol = !isValueMetric ? calcCols[m - values.length] : undefined;
        const row = [];
        for (let i = 0; i < this.config.rows.length; i++) {
          row.push(m === 0 && i === 0 ? totalLabelText : ROW_SPAN);
        }
        if (this.config.measure != null) {
          row.push(ROW_SPAN);
        }
        if (isValueMetric) {
          const valueKey = values[valueIdx];
          const aggName = this.config.valueAggregators?.[valueKey] ?? this.config.aggregatorName;
          const displayLabel = this.config.getValueLabel?.(valueKey) ?? valueKey;
          row.push(`${aggName} of ${displayLabel}`);
        } else {
          row.push(calcCol?.name ?? '');
        }
        for (let k = 0; k < effectiveColKeys.length; k++) {
          const c = effectiveColKeys[k];
          if (isValueMetric) {
            const aggregator = this.getAggregator([], c);
            row.push([fmtAggValue(aggregator.values(), valueIdx, aggregator)]);
          } else {
            const records = hasColDims ? this.getAllRecordsForColumnKey(c) : this.getAllRecordsForCalculatedColumn();
            row.push([this.computeCalcForRecords(calcCol, records, hideZeroValues)]);
          }
        }
        if (showRowTotals) {
          if (isValueMetric) {
            if (showGrandTotal) {
              const aggregator = this.getAggregator([], []);
              row.push([fmtAggValue(aggregator.values(), valueIdx, aggregator)]);
            } else {
              row.push(['']);
            }
          } else {
            const records = this.getAllRecordsForCalculatedColumn();
            row.push([this.computeCalcForRecords(calcCol, records, hideZeroValues)]);
          }
        }
        rows.push(row);
      }
      return rows;
    }
    const row = [];
    for (let i = 0; i < this.config.rows.length; i++) {
      row.push(i === 0 ? totalLabelText : ROW_SPAN);
    }
    if (this.config.measure != null) {
      row.push(ROW_SPAN);
    }
    const seq = this.getDataColumnSequence();
    if (seq.length > 0) {
      for (const { colKeyIdx, valueIdx, calcIdx } of seq) {
        const c = effectiveColKeys[colKeyIdx];
        if (valueIdx !== undefined) {
          const aggregator = this.getAggregator([], c);
          row.push([fmtAggValue(aggregator.values(), valueIdx, aggregator)]);
        } else if (calcIdx !== undefined) {
          const calcCol = calcCols[calcIdx];
          const records = hasColDims ? this.getAllRecordsForColumnKey(c) : this.getAllRecordsForCalculatedColumn();
          row.push([this.computeCalcForRecords(calcCol, records, hideZeroValues)]);
        }
      }
    } else if (!hasCols) {
      if (showGrandTotal) {
        const aggregator = this.getAggregator([], []);
        const vals = aggregator.values();
        row.push(vals.map((_, i) => fmtAggValue(vals, i, aggregator)));
      } else {
        row.push(values.map(() => ''));
      }
      if (calcCols.length > 0) {
        const records = this.getAllRecordsForCalculatedColumn();
        for (const calcCol of calcCols) {
          row.push([this.computeCalcForRecords(calcCol, records, hideZeroValues)]);
        }
      }
    } else {
      for (let k = 0; k < effectiveColKeys.length; k++) {
        const c = effectiveColKeys[k];
        const aggregator = this.getAggregator([], c);
        const vals = aggregator.values();
        row.push(vals.map((_, i) => fmtAggValue(vals, i, aggregator)));
      }
    }
    if (showRowTotals) {
      const grandAgg = this.getAggregator([], []);
      const grandVals = grandAgg.values();
      if (hasExpandedTotals) {
        for (let i = 0; i < values.length; i++) {
          row.push([showGrandTotal ? fmtAggValue(grandVals, i, grandAgg) : '']);
        }
        const records = this.getAllRecordsForCalculatedColumn();
        for (const calcCol of calcCols) {
          row.push([this.computeCalcForRecords(calcCol, records, hideZeroValues)]);
        }
      } else {
        if (showGrandTotal) {
          row.push(grandVals.map((_, i) => fmtAggValue(grandVals, i, grandAgg)));
        } else {
          row.push(values.map(() => ''));
        }
        if (calcCols.length > 0) {
          const records = this.getAllRecordsForCalculatedColumn();
          for (const calcCol of calcCols) {
            row.push([this.computeCalcForRecords(calcCol, records, hideZeroValues)]);
          }
        }
      }
    }
    return [row];
  }
  // returns the pivot body rows
  getTableData() {
    const rowKeys = this.getRowKeys();
    const colKeys = this.getColKeys();
    if (rowKeys.length === 0) {
      return [];
    }
    if (colKeys.length === 0) {
      colKeys.push([]);
    }
    const values = this.config.values;
    const valuesPosition = this.config.valuesPosition ?? 'columns';
    const valuesInRows = valuesPosition === 'rows' && values.length > 1;
    const result = [];
    let prevRow = [];
    const len = rowKeys.length;
    const flattenLayout = this.config.flattenLayout === true;
    for (let i = 0; i < len; i++) {
      const r = rowKeys[i];
      const hideZeroValues = this.config.hideZeroValues;
      if (valuesInRows) {
        // When values are in rows, create one row per value AND per calculated column.
        // Both values and calculated columns appear as rows, not columns.
        const calculatedCols = this.config.calculatedColumns ?? [];
        const rowMetricCount = values.length + calculatedCols.length;
        for (let metricIdx = 0; metricIdx < rowMetricCount; metricIdx++) {
          const isValueMetric = metricIdx < values.length;
          const valueIdx = isValueMetric ? metricIdx : -1;
          const calcColIdx = isValueMetric ? -1 : metricIdx - values.length;
          const calcCol = !isValueMetric ? calculatedCols[calcColIdx] : undefined;
          const thisRow = [];
          const row = [];
          // Add row dimension values
          for (let j = 0; j < r.length; j++) {
            let val = r[j];
            if (flattenLayout) {
              thisRow[j] = val;
              row.push(val);
              continue;
            }
            if (j === r.length - 1) {
              // For the last row dimension, only show value on first metric row
              if (metricIdx === 0) {
                row.push(val);
              } else {
                row.push(ROW_SPAN);
              }
              break;
            }
            // Check if this cell should span (same as previous row)
            let span = true;
            for (let k = j; k >= 0; k--) {
              if (!isEqual(prevRow[k], r[k])) {
                span = false;
                break;
              }
            }
            // Also span if we're not on the first metric row of this data row
            if (metricIdx > 0) {
              span = true;
            }
            if (span) {
              thisRow[j] = val;
              if (r.includes(BOTH_SPAN) && SPANS.includes(val)) {
                val = BOTH_SPAN;
              } else {
                val = ROW_SPAN;
              }
            } else {
              thisRow[j] = val;
            }
            row.push(val);
          }
          // Add the metric name column (value label or calculated column name)
          if (isValueMetric) {
            const valueKey = values[valueIdx];
            const aggName = this.config.valueAggregators?.[valueKey] ?? this.config.aggregatorName;
            const displayLabel = this.config.getValueLabel?.(valueKey) ?? valueKey;
            const valueLabel = `${aggName} of ${displayLabel}`;
            row.push(valueLabel);
          } else {
            row.push(calcCol?.name ?? '');
          }
          // Add data cells - one per colKey
          const flatRowKey = r.filter((v) => !SPANS.includes(v)).join(String.fromCharCode(0));
          if (isValueMetric) {
            for (let k = 0; k < colKeys.length; k++) {
              const c = colKeys[k];
              const aggregator = this.getAggregator(r, c);
              const vals = aggregator.values();
              const val = vals[valueIdx];
              const formattedVal = val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdx);
              row.push([formattedVal]);
            }
          } else {
            // Calculated column as row - one value per colKey
            if (colKeys.length === 0 || (colKeys.length === 1 && colKeys[0].length === 0)) {
              const records = this.recordsTree[flatRowKey]?.[''];
              let calculatedValue = '';
              if (records && records.length > 0 && calcCol?.formula.type === 'aggregation') {
                const calcResult = computeCalculatedColumn(
                  calcCol?.formula,
                  records,
                  this.config.getNumberValue,
                  this.config.getTextValue,
                );
                calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
              }
              row.push([calculatedValue]);
            } else {
              for (let k = 0; k < colKeys.length; k++) {
                const c = colKeys[k];
                const flatColKey = c
                  .filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN)
                  .join(String.fromCharCode(0));
                const records = this.recordsTree[flatRowKey]?.[flatColKey];
                let calculatedValue = '';
                if (records && records.length > 0 && calcCol?.formula.type === 'aggregation') {
                  const calcResult = computeCalculatedColumn(
                    calcCol?.formula,
                    records,
                    this.config.getNumberValue,
                    this.config.getTextValue,
                  );
                  calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
                }
                row.push([calculatedValue]);
              }
            }
          }
          // Add row totals
          if (this.config.cols.length) {
            if (isValueMetric) {
              const aggregator = this.getAggregator(r, []);
              const vals = aggregator.values();
              const val = vals[valueIdx];
              const formattedVal = val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdx);
              row.push([formattedVal]);
            } else {
              const allRecords = [];
              for (let k = 0; k < colKeys.length; k++) {
                const c = colKeys[k];
                const flatColKey = c
                  .filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN)
                  .join(String.fromCharCode(0));
                const records = this.recordsTree[flatRowKey]?.[flatColKey];
                if (records) allRecords.push(...records);
              }
              let calculatedValue = '';
              if (allRecords.length > 0 && calcCol?.formula.type === 'aggregation') {
                const calcResult = computeCalculatedColumn(
                  calcCol?.formula,
                  allRecords,
                  this.config.getNumberValue,
                  this.config.getTextValue,
                );
                calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
              }
              row.push([calculatedValue]);
            }
          }
          result.push(row);
          prevRow = thisRow;
        }
      } else {
        // Values as columns - use getDataColumnSequence() to support columns-before-values vs values-before-columns
        const thisRow = [];
        const row = [];
        for (let j = 0; j < r.length; j++) {
          let val = r[j];
          if (flattenLayout) {
            thisRow[j] = val;
            row.push(val);
            continue;
          }
          if (j === r.length - 1) {
            // last row value is always unique
            row.push(val);
            break;
          }
          let span = true;
          for (let k = j; k >= 0; k--) {
            if (!isEqual(prevRow[k], r[k])) {
              span = false;
              break;
            }
          }
          if (span) {
            thisRow[j] = val;
            if (r.includes(BOTH_SPAN) && SPANS.includes(val)) {
              val = BOTH_SPAN;
            } else {
              val = ROW_SPAN;
            }
          } else {
            thisRow[j] = val;
          }
          row.push(val);
        }
        const seq = this.getDataColumnSequence();
        const flatRowKey = r.filter((v) => !SPANS.includes(v)).join(String.fromCharCode(0));
        for (const { colKeyIdx, valueIdx, calcIdx } of seq) {
          const c = colKeys[colKeyIdx];
          if (valueIdx !== undefined) {
            const aggregator = this.getAggregator(r, c);
            const vals = aggregator.values();
            const val = vals[valueIdx];
            const formattedVal = val === 0 && hideZeroValues ? '' : aggregator.format(val, valueIdx);
            row.push([formattedVal]);
          } else if (calcIdx !== undefined) {
            const calcCol = this.config.calculatedColumns?.[calcIdx];
            if (!calcCol) {
              row.push(['']);
              continue;
            }
            const flatColKey =
              colKeys.length === 0 || (colKeys.length === 1 && colKeys[0].length === 0)
                ? ''
                : c.filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN).join(String.fromCharCode(0));
            const records = this.recordsTree[flatRowKey]?.[flatColKey];
            let calculatedValue = '';
            if (records && records.length > 0 && calcCol.formula.type === 'aggregation') {
              const calcResult = computeCalculatedColumn(
                calcCol.formula,
                records,
                this.config.getNumberValue,
                this.config.getTextValue,
              );
              calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
            }
            row.push([calculatedValue]);
          }
        }
        if (this.config.cols.length === 0 && seq.length === 0) {
          const aggregator = this.getAggregator(r, []);
          const vals = aggregator.values();
          const formattedValues = vals.map((val, idx) =>
            val === 0 && hideZeroValues ? '' : aggregator.format(val, idx),
          );
          row.push(formattedValues);
          if (this.config.calculatedColumns && this.config.calculatedColumns.length > 0) {
            for (const calcCol of this.config.calculatedColumns) {
              const records = this.recordsTree[flatRowKey]?.[''];
              let calculatedValue = '';
              if (records && records.length > 0 && calcCol.formula.type === 'aggregation') {
                const calcResult = computeCalculatedColumn(
                  calcCol.formula,
                  records,
                  this.config.getNumberValue,
                  this.config.getTextValue,
                );
                calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
              }
              row.push([calculatedValue]);
            }
          }
        }
        if (this.config.cols.length) {
          const calcCols = this.config.calculatedColumns ?? [];
          const hasCombinedTotalsBlock =
            !valuesInRows &&
            this.config.columnsBeforeValues === false &&
            this.config.cols.length > 0 &&
            (values.length > 1 || calcCols.length > 0);
          const aggregator = this.getAggregator(r, []);
          const vals = aggregator.values();
          const formattedValues = vals.map((value, i) =>
            value === 0 && hideZeroValues ? '' : aggregator.format(value, i),
          );
          if (hasCombinedTotalsBlock) {
            // Individual Total columns: one per value + one per calculated column
            for (const fv of formattedValues) {
              row.push([fv]);
            }
            if (calcCols.length > 0) {
              const allRecordsForTotals = [];
              for (let k = 0; k < colKeys.length; k++) {
                const c = colKeys[k];
                const flatColKey = c
                  .filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN)
                  .join(String.fromCharCode(0));
                const records = this.recordsTree[flatRowKey]?.[flatColKey];
                if (records) {
                  allRecordsForTotals.push(...records);
                }
              }
              for (const calcCol of calcCols) {
                let calculatedValue = '';
                if (allRecordsForTotals.length > 0 && calcCol.formula.type === 'aggregation') {
                  const calcResult = computeCalculatedColumn(
                    calcCol.formula,
                    allRecordsForTotals,
                    this.config.getNumberValue,
                    this.config.getTextValue,
                  );
                  calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
                }
                row.push([calculatedValue]);
              }
            }
          } else {
            const hasValuesBeforeColsTotals =
              !valuesInRows &&
              this.config.columnsBeforeValues !== false &&
              colKeys.length > 0 &&
              (colKeys.length > 1 || colKeys[0].length > 0) &&
              (values.length > 1 || calcCols.length > 0);
            if (hasValuesBeforeColsTotals) {
              // Individual Total columns: one per value
              for (const fv of formattedValues) {
                row.push([fv]);
              }
            } else {
              // Standard: combined value totals in one column
              row.push(formattedValues);
            }
            if (this.config.calculatedColumns && this.config.calculatedColumns.length > 0) {
              const allRecords = [];
              for (let k = 0; k < colKeys.length; k++) {
                const c = colKeys[k];
                const flatColKey = c
                  .filter((v) => !SPANS.includes(v) && v !== COL_VALUE_SPAN)
                  .join(String.fromCharCode(0));
                const records = this.recordsTree[flatRowKey]?.[flatColKey];
                if (records) {
                  allRecords.push(...records);
                }
              }
              for (const calcCol of this.config.calculatedColumns) {
                let calculatedValue = '';
                if (allRecords.length > 0 && calcCol.formula.type === 'aggregation') {
                  const calcResult = computeCalculatedColumn(
                    calcCol.formula,
                    allRecords,
                    this.config.getNumberValue,
                    this.config.getTextValue,
                  );
                  calculatedValue = this.formatCalcResult(calcResult, hideZeroValues, calcCol.formula);
                }
                row.push([calculatedValue]);
              }
            }
          }
        }
        result.push(row);
        prevRow = thisRow;
      }
    }
    return result;
  }
}
function forEachRecord(input, processRecord) {
  if (Array.isArray(input)) {
    const len = input.length;
    for (let i = 0; i < len; i++) {
      const row = input[i];
      processRecord(row);
    }
    return;
  }
  throw new Error('input data must be an array of records');
}
export { PivotData };
//# sourceMappingURL=PivotData.js.map
