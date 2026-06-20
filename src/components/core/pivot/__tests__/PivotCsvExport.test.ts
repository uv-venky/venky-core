/* Copyright (c) 2024-present VENKY Corp. */

import { describe, expect, test } from 'vitest';
import { PivotData } from '@/components/core/pivot/PivotData';
import { PivotIntervalTree } from '@/components/core/pivot/PivotIntervalTree';
import { buildPivotCsv } from '@/components/core/pivot/PivotCsvExport';
import type { CalculatedColumn, PivotColumn } from '@/components/core/pivot/PivotTypes';
import {
  type ColumnKey,
  columns,
  getNumberValue,
  getTextValue,
  type Item,
  TEST_DATA,
} from '@/components/core/pivot/__tests__/test-data';

function makeTrees(pivot: PivotData<ColumnKey, Item>) {
  const headerRows = pivot.getHeader().length;
  const bodyRows = pivot.getTableData().length;
  const colCount = pivot.getHeader()[0]?.length ?? 0;
  const rowTree = new PivotIntervalTree(bodyRows);
  const columnTree = new PivotIntervalTree(colCount);
  return { rowTree, columnTree, headerRows };
}

function toRows(csv: string): Array<Array<string>> {
  // Simple CSV split — values in our tests do not contain commas/quotes.
  return csv
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(','));
}

describe('buildPivotCsv', () => {
  test('every row has the same column count as the header (no over-padding of single-value cells)', () => {
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
      showGrandTotal: true,
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
      ] as Array<CalculatedColumn<ColumnKey>>,
    });
    pivot.doSort();

    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    const rows = toRows(csv);

    // Header is 2 rows + body 2 rows + footer 1 row = 5 rows
    expect(rows.length).toBe(5);
    const headerColCount = rows[0].length;
    for (const row of rows) {
      expect(row.length).toBe(headerColCount);
    }
  });

  test('includes footer row with column totals and grand total', () => {
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
      showGrandTotal: true,
      hideZeroValues: true,
    });
    pivot.doSort();

    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    const rows = toRows(csv);

    // Header (1 row) + body (2 rows: A, B) + footer (1 row) = 4 rows
    expect(rows.length).toBe(4);
    expect(rows[3]).toEqual(['Total', '36.00', '36.00', '72.00']);
  });

  test('omits footer when showColumnTotals is false', () => {
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

    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    const rows = toRows(csv);

    // Header (1) + body (2). No footer.
    expect(rows.length).toBe(3);
    expect(rows[0]).toEqual(['Category', 'UK', 'US', 'Total']);
  });

  test('omits row-total column when showRowTotals is false', () => {
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

    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    const rows = toRows(csv);

    // No "Total" column on the right
    expect(rows[0]).toEqual(['Category', 'UK', 'US']);
    // Footer is still rendered but without the grand-total column
    expect(rows[rows.length - 1]).toEqual(['Total', '36.00', '36.00']);
  });

  test('blanks out the grand total cell when showGrandTotal is false', () => {
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

    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    const rows = toRows(csv);

    const footer = rows[rows.length - 1];
    expect(footer[0]).toBe('Total');
    expect(footer[footer.length - 1]).toBe('');
  });

  test('produces one footer row per metric when valuesPosition is rows', () => {
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
      showGrandTotal: true,
      hideZeroValues: true,
      valuesPosition: 'rows',
    });
    pivot.doSort();

    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    const rows = toRows(csv);

    // Footer occupies the last 2 rows (one per metric).
    const priceFooter = rows[rows.length - 2];
    const qtyFooter = rows[rows.length - 1];
    expect(priceFooter).toEqual(['Total', 'Sum of price', '36.00', '36.00', '72.00']);
    expect(qtyFooter).toEqual(['', 'Sum of qty', '8.00', '8.00', '16.00']);
  });

  test('uses column labels for row dimension headers (not raw keys)', () => {
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
    });
    pivot.doSort();

    const customColumns: Array<PivotColumn<ColumnKey>> = columns.map((c) =>
      c.key === 'category' ? { ...c, label: 'Custom Cat Label' } : c,
    );
    const { rowTree, columnTree } = makeTrees(pivot);
    const csv = buildPivotCsv({ pivot, columns: customColumns, rowTree, columnTree });
    const rows = toRows(csv);
    expect(rows[0][0]).toBe('Custom Cat Label');
  });

  test('honours row collapse state (e.g. only first dimension visible)', () => {
    const pivot = new PivotData<ColumnKey, Item>({
      data: TEST_DATA,
      rows: ['category', 'region'],
      cols: [],
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

    const headerRows = pivot.getHeader().length;
    const body = pivot.getTableData();
    const colCount = pivot.getHeader()[0].length;
    const rowTree = new PivotIntervalTree(body.length);
    const columnTree = new PivotIntervalTree(colCount);

    const csvAll = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    expect(toRows(csvAll).length).toBe(headerRows + body.length);

    // Hide the second category's rows; the result should drop those body rows
    // while keeping the header intact.
    rowTree.removeRange(body.length - 1, body.length - 1);
    const csvCollapsed = buildPivotCsv({ pivot, columns, rowTree, columnTree });
    expect(toRows(csvCollapsed).length).toBe(headerRows + body.length - 1);
  });
});
