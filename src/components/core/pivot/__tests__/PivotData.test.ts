import { describe, expect, test } from 'vitest';
import { PivotData } from '@/components/core/pivot/PivotData';
import { PivotIntervalTree } from '@/components/core/pivot/PivotIntervalTree';
import { collapseColumn } from '@/components/core/pivot/PivotStateUtils';
import { COL_SPAN, type CollapsedRange } from '@/components/core/pivot/PivotTypes';
import {
  type Item,
  TEST_DATA,
  type ColumnKey,
  getTextValue,
  getNumberValue,
} from '@/components/core/pivot/__tests__/test-data';

function makePivot(multi = false, data: Array<Item> = TEST_DATA) {
  const pivot = new PivotData<ColumnKey, Item>({
    data,
    rows: ['category'],
    cols: ['region'],
    aggregatorName: 'Sum',
    values: multi ? ['price', 'qty'] : ['price'],
    getTextValue,
    getNumberValue,
    sorters: {},
    showRowTotals: true,
    showColumnTotals: true,
    hideZeroValues: true,
  });
  pivot.doSort();
  return pivot;
}

describe('DemandHubPivotData', () => {
  test('PivotData no data', () => {
    const p = makePivot(false, []);
    expect(p.getColKeys()).toEqual([]);
    expect(p.getRowKeys()).toEqual([]);
    expect(p.getHeader()).toEqual([['category', 'Sum of price', 'Total']]);
    expect(p.getTableData()).toEqual([]);
  });

  test('col & row keys', () => {
    const p = makePivot();
    expect(p.getColKeys()).toEqual([['UK'], ['US']]);
    expect(p.getRowKeys()).toEqual([['A'], ['B']]);
  });

  test('header', () => {
    const p = makePivot();
    expect(p.getHeader()).toEqual([['category', 'UK', 'US', 'Total']]);
  });

  test('header multi-value', () => {
    const p = makePivot(true);
    // columnsBeforeValues default true: for each value, show column dimensions (UK, US)
    expect(p.getHeader()).toEqual([
      ['category', 'Sum of price', '$col-span$', 'Sum of qty', '$col-span$', 'Total', '$col-span$'],
      ['$row-span$', 'UK', 'US', 'UK', 'US', 'Sum of price', 'Sum of qty'],
    ]);
  });

  test('header with valueAggregators uses per-value labels', () => {
    const p = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      valueAggregators: { price: 'Sum', qty: 'Count' },
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
    });
    p.doSort();
    // Count of qty (not Sum of qty) when valueAggregators specifies Count
    expect(p.getHeader()).toEqual([
      ['category', 'Sum of price', '$col-span$', 'Count of qty', '$col-span$', 'Total', '$col-span$'],
      ['$row-span$', 'UK', 'US', 'UK', 'US', 'Sum of price', 'Count of qty'],
    ]);
  });

  test('valueAggregators applies different aggregation and formatting per value', () => {
    const p = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      valueAggregators: { price: 'Sum', qty: 'Count' },
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
    });
    p.doSort();
    // price: Sum formats with decimals (10.00), qty: Count formats as integer (4)
    const table = p.getTableData();
    expect(table[0]).toEqual(['A', ['10.00'], ['10.00'], ['4'], ['4'], ['20.00'], ['8']]);
    expect(table[1]).toEqual(['B', ['26.00'], ['26.00'], ['4'], ['4'], ['52.00'], ['8']]);
  });

  test('table data', () => {
    const p = makePivot();
    expect(p.getTableData()).toEqual([
      ['A', ['10.00'], ['10.00'], ['20.00']],
      ['B', ['26.00'], ['26.00'], ['52.00']],
    ]);
  });

  test('table data multi-value', () => {
    const p = makePivot(true);
    // Order: price|UK, price|US, qty|UK, qty|US, then row totals
    expect(p.getTableData()).toEqual([
      ['A', ['10.00'], ['10.00'], ['4.00'], ['4.00'], ['20.00'], ['8.00']],
      ['B', ['26.00'], ['26.00'], ['4.00'], ['4.00'], ['52.00'], ['8.00']],
    ]);
  });

  test('allowDecimals=false formats aggregated values without decimals', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      getAllowDecimals: (field) => field !== 'qty',
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
    });
    pivot.doSort();

    const table = pivot.getTableData();
    // qty columns should show integers ("4", "8") not "4.00"/"8.00"
    expect(table[0]).toEqual(['A', ['10.00'], ['10.00'], ['4'], ['4'], ['20.00'], ['8']]);
    expect(table[1]).toEqual(['B', ['26.00'], ['26.00'], ['4'], ['4'], ['52.00'], ['8']]);
  });

  test('table data flattened rows', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      aggregatorName: 'Sum',
      cols: [],
      rows: ['category', 'region'],
      values: ['price'],
      sorters: {},
      getNumberValue,
      getTextValue,
      showRowTotals: false,
      showColumnTotals: false,
      data: TEST_DATA,
      hideZeroValues: true,
      flattenLayout: true,
    });

    const table = pivot.getTableData();

    expect(table.every((row) => row[0] !== '$row-span$' && row[1] !== '$row-span$')).toBe(true);
    expect(table.filter((row) => row[0] === 'A').length).toBeGreaterThan(1);
    expect(table.filter((row) => row[0] === 'B').length).toBeGreaterThan(1);
  });

  test('col total', () => {
    const p = makePivot();
    const aggregator = p.getAggregator([], ['US']);
    const total = aggregator.format(aggregator.values()[0]);
    expect(total).toEqual('36.00');
  });

  test('col total multi-value', () => {
    const p = makePivot(true);
    const aggregator = p.getAggregator([], ['US']);
    const total = aggregator.values();
    expect(total).toEqual([36, 8]);
  });

  test('row total', () => {
    const p = makePivot();
    const aggregator = p.getAggregator(['A'], []);
    const total = aggregator.format(aggregator.values()[0]);
    expect(total).toEqual('20.00');
  });

  test('row total multi-value', () => {
    const p = makePivot(true);
    const aggregator = p.getAggregator(['A'], []);
    const total = aggregator.values();
    expect(total).toEqual([20, 8]);
  });

  test('grand total', () => {
    const p = makePivot();
    const aggregator = p.getAggregator([], []);
    const grantTotal = aggregator.format(aggregator.values()[0]);
    expect(grantTotal).toEqual('72.00');
  });

  test('grand total multi-value', () => {
    const p = makePivot(true);
    const aggregator = p.getAggregator([], []);
    const grantTotal = aggregator.values();
    expect(grantTotal).toEqual([72, 16]);
  });

  test('header with valuesPosition rows', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      valuesPosition: 'rows',
    });
    pivot.doSort();
    // When valuesPosition is 'rows', there should be a 'Values' column in the header
    // and no COL_VALUE_SPAN row
    const header = pivot.getHeader();
    expect(header).toEqual([['category', 'Values', 'UK', 'US', 'Total']]);
  });

  test('table data with valuesPosition rows', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      valuesPosition: 'rows',
    });
    pivot.doSort();
    const tableData = pivot.getTableData();
    // With valuesPosition: 'rows', each category should have 2 rows (one per value)
    // Each row should have: category, value name, UK value, US value, Total value
    expect(tableData.length).toBe(4); // 2 categories * 2 values
    // Check first category 'A' has two rows
    expect(tableData[0][0]).toBe('A');
    expect(tableData[0][1]).toBe('Sum of price');
    expect(tableData[0][2]).toEqual(['10.00']);
    expect(tableData[0][3]).toEqual(['10.00']);
    expect(tableData[0][4]).toEqual(['20.00']);

    expect(tableData[1][0]).toBe('$row-span$');
    expect(tableData[1][1]).toBe('Sum of qty');
    expect(tableData[1][2]).toEqual(['4.00']);
    expect(tableData[1][3]).toEqual(['4.00']);
    expect(tableData[1][4]).toEqual(['8.00']);

    // Check second category 'B'
    expect(tableData[2][0]).toBe('B');
    expect(tableData[2][1]).toBe('Sum of price');
    expect(tableData[3][0]).toBe('$row-span$');
    expect(tableData[3][1]).toBe('Sum of qty');
  });

  test('valuesPosition rows with single value falls back to columns', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price'], // Single value
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      valuesPosition: 'rows',
    });
    pivot.doSort();
    // With only 1 value, valuesPosition: 'rows' should not add the Values column
    const header = pivot.getHeader();
    expect(header).toEqual([['category', 'UK', 'US', 'Total']]);
    const tableData = pivot.getTableData();
    expect(tableData.length).toBe(2); // Still 2 rows (one per category)
  });

  test('valuesPosition rows with calculated columns - calc cols shown as rows', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      valuesPosition: 'rows',
      calculatedColumns: [
        {
          id: 'avg-price',
          width: 120,
          name: 'Avg Price',
          formula: {
            type: 'aggregation',
            numerator: { operation: 'sum', column: 'price' },
            denominator: { operation: 'count', column: 'price' },
            mathOperator: '/',
          },
        },
      ],
    });
    pivot.doSort();
    const header = pivot.getHeader();
    // When valuesInRows with calculated columns, calc columns are NOT added as column headers
    expect(header).toEqual([['category', 'Values', 'UK', 'US', 'Total']]);
    const tableData = pivot.getTableData();
    // 2 categories * (2 values + 1 calc col) = 6 rows
    expect(tableData.length).toBe(6);
    // First category: price, qty, Avg Price
    expect(tableData[0][1]).toBe('Sum of price');
    expect(tableData[1][1]).toBe('Sum of qty');
    expect(tableData[2][1]).toBe('Avg Price');
    // Second category
    expect(tableData[3][1]).toBe('Sum of price');
    expect(tableData[4][1]).toBe('Sum of qty');
    expect(tableData[5][1]).toBe('Avg Price');
    // Avg Price row for A: (10+10)/8 = 2.5 for UK and US
    expect(tableData[2][2]).toEqual(['2.50']);
    expect(tableData[2][3]).toEqual(['2.50']);
    expect(tableData[2][4]).toEqual(['2.50']);
  });

  test('columnsBeforeValues false: header column count matches table data', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
      columnsBeforeValues: false,
    });
    pivot.doSort();
    const header = pivot.getHeader();
    const tableData = pivot.getTableData();
    expect(tableData.length).toBeGreaterThan(0);
    // Header and each data row must have the same number of columns so body cells align
    expect(header[0].length).toBe(tableData[0].length);
    // First data row: category, then one cell per (colKey, value), then per-value totals = 1 + 2*2 + 2 = 7
    expect(tableData[0].length).toBe(7);
    // Row: category (index 0), then data columns (1 per seq entry), then row total. First data column (index 1) = UK price.
    expect(tableData[0][1]).toEqual(['10.00']);
    expect(tableData[0][2]).toEqual(['4.00']);
  });

  test('getIndicesToCollapseAllColumns with multi-level columns', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['item'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
    });
    pivot.doSort();
    const header = pivot.getHeader();
    // Row 0 should have A and B groups with COL_SPANs
    expect(header.length).toBe(2);
    expect(header[0][0]).toBe('item');
    expect(header[0][header[0].length - 1]).toBe('Total');

    const indices = pivot.getIndicesToCollapseAllColumns();
    // Should find the A and B group headers (cells followed by COL_SPAN)
    expect(indices.length).toBe(2);
    // First group (A) is at row 0
    expect(indices[0][0]).toBe(0);
    expect(header[0][indices[0][1]]).toBe('A');
    expect(header[0][indices[0][1] + 1]).toBe('$col-span$');
    // Second group (B) is at row 0
    expect(indices[1][0]).toBe(0);
    expect(header[0][indices[1][1]]).toBe('B');
    expect(header[0][indices[1][1] + 1]).toBe('$col-span$');
  });

  test('getIndicesToCollapseAllColumns returns empty for single column dimension', () => {
    const pivot = makePivot();
    const indices = pivot.getIndicesToCollapseAllColumns();
    expect(indices).toEqual([]);
  });

  test('getIndicesToCollapseAllColumns with valuesBeforeCols scans column dimension row', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['item'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
      columnsBeforeValues: true,
    });
    pivot.doSort();
    const header = pivot.getHeader();
    // Row 0 has value names ("Sum of price", "Sum of qty"), row 1 has column dimensions
    expect(header.length).toBe(3);

    const indices = pivot.getIndicesToCollapseAllColumns();
    // All indices should target row 1 (the first column dimension row), not row 0 (value names)
    expect(indices.length).toBeGreaterThan(0);
    for (const [row, col] of indices) {
      expect(row).toBe(1);
      // The cell at the index should be a column dimension value (A or B), not a value name
      const cellValue = header[1][col];
      expect(cellValue).not.toBe('$col-span$');
      expect(cellValue).not.toBe('$row-span$');
      expect(header[1][col + 1]).toBe('$col-span$');
    }
  });

  test('getIndicesToCollapseAllColumns with colsBeforeVals scans top row', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['item'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
      columnsBeforeValues: false,
    });
    pivot.doSort();
    const header = pivot.getHeader();
    // Row 0 has column dimensions (A, B), last row has value labels
    expect(header.length).toBe(3);

    const indices = pivot.getIndicesToCollapseAllColumns();
    // All indices should target row 0 (the top column dimension row)
    expect(indices.length).toBeGreaterThan(0);
    for (const [row, col] of indices) {
      expect(row).toBe(0);
      const cellValue = header[0][col];
      expect(cellValue).not.toBe('$col-span$');
      expect(cellValue).not.toBe('$row-span$');
      expect(header[0][col + 1]).toBe('$col-span$');
    }
  });

  test('collapseColumn in colsBeforeVals keeps all value columns for each group', () => {
    const valueCount = 2; // price + qty
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['item'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
      columnsBeforeValues: false,
    });
    pivot.doSort();
    const header = pivot.getHeader();
    const totalCols = header[0].length;
    const columnTree = new PivotIntervalTree(totalCols);

    const indices = pivot.getIndicesToCollapseAllColumns();
    expect(indices.length).toBeGreaterThan(0);

    const headerCollapseState: Record<string, CollapsedRange> = {};
    for (const [r, c] of indices) {
      collapseColumn({
        header,
        rowIndex: r,
        columnIndex: c,
        columnTree,
        headerCollapseState,
        pivot: pivot as unknown as PivotData<string, unknown>,
      });
    }

    // For each collapsed group, the hidden range should start at columnIndex + valueCount,
    // preserving all measure columns for the first sub-group.
    for (const key of Object.keys(headerCollapseState)) {
      const range = headerCollapseState[key];
      // The start of hidden range should be valueCount away from the group header,
      // not just 1 column away
      const colIndex = indices.find(([, c]) => range.start > c && range.start <= c + valueCount)?.[1];
      if (colIndex !== undefined) {
        expect(range.start).toBe(colIndex + valueCount);
      }
    }

    // After collapse, check that value label columns are still visible for each group.
    // The value labels row is the last header row.
    const valueRow = header[header.length - 1];
    const _fixedCount = 1; // 'item' row dimension
    for (const [, colIndex] of indices) {
      // All valueCount columns from colIndex should be visible
      for (let v = 0; v < valueCount; v++) {
        const col = colIndex + v;
        expect(columnTree.actualIndex(columnTree.totalVisible())).toBeDefined();
        // Verify the value label is a real label, not a span marker
        if (v === 0) {
          expect(valueRow[col]).not.toBe(COL_SPAN);
        }
      }
    }
  });

  test('collapseColumn without pivot uses standard behavior (keepCount=1)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['item'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
      columnsBeforeValues: false,
    });
    pivot.doSort();
    const header = pivot.getHeader();
    const totalCols = header[0].length;

    // With pivot: keeps valueCount columns
    const tree1 = new PivotIntervalTree(totalCols);
    const state1: Record<string, CollapsedRange> = {};
    const indices = pivot.getIndicesToCollapseAllColumns();
    for (const [r, c] of indices) {
      collapseColumn({
        header,
        rowIndex: r,
        columnIndex: c,
        columnTree: tree1,
        headerCollapseState: state1,
        pivot: pivot as unknown as PivotData<string, unknown>,
      });
    }

    // Without pivot: hides all but 1 column per group
    const tree2 = new PivotIntervalTree(totalCols);
    const state2: Record<string, CollapsedRange> = {};
    for (const [r, c] of indices) {
      collapseColumn({
        header,
        rowIndex: r,
        columnIndex: c,
        columnTree: tree2,
        headerCollapseState: state2,
      });
    }

    // With pivot should keep more columns visible than without
    expect(tree1.totalVisible()).toBeGreaterThan(tree2.totalVisible());
  });

  test('getTableData with empty cols and multi-value produces bundled values per row', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: [],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
    });
    pivot.doSort();

    const header = pivot.getHeader();
    const tableData = pivot.getTableData();

    expect(header[0]).toEqual(['category', 'Sum']);
    expect(header[1]).toEqual(['$row-span$', '$col-value-span$']);

    expect(tableData.length).toBe(2);
    // Bundled values: [Sum(price), Sum(qty)] in a single multi-value cell
    expect(tableData[0][0]).toBe('A');
    expect(tableData[0][1]).toEqual(['20.00', '8.00']);
    expect(tableData[0]).toHaveLength(2);
    expect(tableData[1][0]).toBe('B');
    expect(tableData[1][1]).toEqual(['52.00', '8.00']);
    expect(tableData[1]).toHaveLength(2);
  });

  test('getTableData with empty cols and calc columns produces separate cells', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: [],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
      calculatedColumns: [
        {
          id: 'avg-price',
          name: 'Avg Price',
          formula: {
            type: 'aggregation',
            numerator: { operation: 'sum', column: 'price' as ColumnKey },
            denominator: { operation: 'sum', column: 'qty' as ColumnKey },
            mathOperator: '/',
          },
        },
      ],
    });
    pivot.doSort();

    const header = pivot.getHeader();
    const tableData = pivot.getTableData();

    // Header: bundled column "Sum" + separate calc column "Avg Price"
    expect(header[0]).toEqual(['category', 'Sum', '$row-span$']);
    expect(header[1]).toEqual(['$row-span$', '$col-value-span$', 'Avg Price']);

    expect(tableData.length).toBe(2);
    // Row A: bundled [Sum(price)=20, Sum(qty)=8] + calc [20/8=2.50]
    expect(tableData[0][0]).toBe('A');
    expect(tableData[0][1]).toEqual(['20.00', '8.00']);
    expect(tableData[0][2]).toEqual(['2.50']);
    expect(tableData[0]).toHaveLength(3);

    // Row B: bundled [Sum(price)=52, Sum(qty)=8] + calc [52/8=6.50]
    expect(tableData[1][0]).toBe('B');
    expect(tableData[1][1]).toEqual(['52.00', '8.00']);
    expect(tableData[1][2]).toEqual(['6.50']);
    expect(tableData[1]).toHaveLength(3);
  });

  test('getFooter: single value, single col dim', () => {
    const p = makePivot();
    // [TotalLabel, UK total, US total, GrandTotal]
    expect(p.getFooter()).toEqual([['Total', ['36.00'], ['36.00'], ['72.00']]]);
  });

  test('getFooter: single value with getTotalLabel override', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      getTotalLabel: ({ location, defaultLabel }) => (location === 'footer' ? 'Footer Total' : defaultLabel),
    });
    pivot.doSort();
    expect(pivot.getFooter()).toEqual([['Footer Total', ['36.00'], ['36.00'], ['72.00']]]);
  });

  test('getFooter: respects showColumnTotals=false (returns no rows)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: false,
      hideZeroValues: true,
    });
    pivot.doSort();
    expect(pivot.getFooter()).toEqual([]);
  });

  test('getFooter: respects showRowTotals=false (omits grand total cell)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: false,
      showColumnTotals: true,
      hideZeroValues: true,
    });
    pivot.doSort();
    expect(pivot.getFooter()).toEqual([['Total', ['36.00'], ['36.00']]]);
  });

  test('getFooter: respects showGrandTotal=false (blank grand total cell)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      showGrandTotal: false,
      hideZeroValues: true,
    });
    pivot.doSort();
    expect(pivot.getFooter()).toEqual([['Total', ['36.00'], ['36.00'], ['']]]);
  });

  test('getFooter: multiple values, columnsBeforeValues default true (individual row totals)', () => {
    const p = makePivot(true);
    // Body data order: price|UK, price|US, qty|UK, qty|US, then totals: price total, qty total
    expect(p.getFooter()).toEqual([['Total', ['36.00'], ['36.00'], ['8.00'], ['8.00'], ['72.00'], ['16.00']]]);
  });

  test('getFooter: multiple values, columnsBeforeValues=false', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      columnsBeforeValues: false,
    });
    pivot.doSort();
    // Body order: UK|price, UK|qty, US|price, US|qty, then totals price, qty
    expect(pivot.getFooter()).toEqual([['Total', ['36.00'], ['8.00'], ['36.00'], ['8.00'], ['72.00'], ['16.00']]]);
  });

  test('getFooter: valuesPosition rows produces N rows', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      valuesPosition: 'rows',
    });
    pivot.doSort();
    const footer = pivot.getFooter();
    expect(footer.length).toBe(2);
    // Row 0: Total label, price metric label, UK price, US price, grand price
    expect(footer[0]).toEqual(['Total', 'Sum of price', ['36.00'], ['36.00'], ['72.00']]);
    // Row 1: ROW_SPAN (cells under Total), qty metric label, UK qty (8), US qty (8), grand qty (16)
    expect(footer[1]).toEqual(['$row-span$', 'Sum of qty', ['8.00'], ['8.00'], ['16.00']]);
  });

  test('getFooter: no column dimensions (bundled values)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: [],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
    });
    pivot.doSort();
    // No cols → grand totals bundled in one cell, no row-total column
    expect(pivot.getFooter()).toEqual([['Total', ['72.00', '16.00']]]);
  });

  test('getFooter: with calculated column (columnsBeforeValues=false)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price'],
      getTextValue,
      getNumberValue,
      sorters: {},
      showRowTotals: true,
      showColumnTotals: true,
      hideZeroValues: true,
      columnsBeforeValues: false,
      calculatedColumns: [
        {
          id: 'avg-price',
          name: 'Avg Price',
          formula: {
            type: 'aggregation',
            numerator: { operation: 'sum', column: 'price' as ColumnKey },
            denominator: { operation: 'sum', column: 'qty' as ColumnKey },
            mathOperator: '/',
          },
        },
      ],
    });
    pivot.doSort();
    // Body order (colsBeforeValues): UK|price, UK|avg, US|price, US|avg, then totals price, avg
    const footer = pivot.getFooter();
    expect(footer.length).toBe(1);
    expect(footer[0][0]).toBe('Total');
    // UK price=36, UK avg=36/8=4.50
    expect(footer[0][1]).toEqual(['36.00']);
    expect(footer[0][2]).toEqual(['4.50']);
    // US price=36, US avg=36/8=4.50
    expect(footer[0][3]).toEqual(['36.00']);
    expect(footer[0][4]).toEqual(['4.50']);
    // Grand totals: price=72, avg=72/16=4.50
    expect(footer[0][5]).toEqual(['72.00']);
    expect(footer[0][6]).toEqual(['4.50']);
  });
});
