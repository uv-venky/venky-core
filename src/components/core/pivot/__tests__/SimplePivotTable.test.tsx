import { emptyFunction } from '@/lib/core/common/isEmpty';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';
import * as Notification from '@/components/core/common/Notification';
import type { ShowMsgProps } from '@/components/core/common/Notification';
import { PivotContextProvider } from '@/components/core/pivot/PivotContext';
import type { CellProps, PivotSetting } from '@/components/core/pivot/PivotTypes';
import { SimplePivotTable, type SimplePivotTableProps } from '@/components/core/pivot/SimplePivotTable';
import {
  columns,
  getNumberValue,
  getTextValue,
  TEST_DATA,
  type ColumnKey,
  type Item,
} from '@/components/core/pivot/__tests__/test-data';
import PivotCsvDownloadButton from '@/components/core/pivot/PivotCsvDownloadButton';
import { TestAppProvider } from '@/test/test-utils';

vi.mock('@/components/core/common/Notification');

const initialSettings: PivotSetting<ColumnKey> = {
  rows: ['category', 'region'],
  cols: ['region'],
  aggregatorName: 'Sum',
  values: ['price'],
};

const valuesInRowsSettings: PivotSetting<ColumnKey> = {
  rows: ['category', 'region'],
  cols: ['region'],
  aggregatorName: 'Sum',
  values: ['price', 'qty'],
  valuesPosition: 'rows',
  showRowTotals: true,
  showColumnTotals: true,
};

describe('SimplePivotTable', () => {
  let mockShowError: Mock<(title: string | Error, props?: Omit<ShowMsgProps, 'title' | 'type'>) => string | number>;

  beforeEach(() => {
    mockShowError = vi.fn();
    vi.mocked(Notification.showError).mockImplementation(mockShowError);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPivotTable = (
    props: Partial<SimplePivotTableProps<Item, ColumnKey>>,
    settings: PivotSetting<keyof Item> = initialSettings,
  ) => {
    return render(
      <TestAppProvider>
        <PivotContextProvider columns={columns} initialSettings={settings} onSettingsChange={emptyFunction}>
          <SimplePivotTable
            hideBorders
            data={TEST_DATA}
            getNumberValue={getNumberValue}
            getTextValue={getTextValue}
            initialCollapsed={false}
            {...props}
          />
        </PivotContextProvider>
      </TestAppProvider>,
    );
  };

  test('should render', async () => {
    renderPivotTable({});
    const el = await screen.findByTestId('header');
    expect(el).toBeInTheDocument();
  });

  test('should render header', async () => {
    renderPivotTable({});
    const el = await screen.findByTestId('header');
    expect(el.textContent).toBe('CategoryRegionUKUSTotal');
  });

  test('should render body', async () => {
    renderPivotTable({});
    const el = await screen.findByTestId('body');
    expect(el.textContent).toBe('AUKUSBUKUS10.0010.0020.0010.0010.0010.0010.0026.0026.0052.0026.0026.0026.0026.00');
  });

  test('should render footer', async () => {
    renderPivotTable({});
    const el = await screen.findByTestId('footer');
    expect(el.textContent).toBe('Total36.0036.0072.00');
  });

  test('should render header with total label', async () => {
    renderPivotTable({
      getTotalLabel: () => {
        return 'Custom Total';
      },
    });
    const el = await screen.findByTestId('header');
    expect(el.textContent).toBe('CategoryRegionUKUSCustom Total');
  });

  test('should render footer with total label', async () => {
    renderPivotTable({
      getTotalLabel: () => {
        return 'Custom Total';
      },
    });
    const el = await screen.findByTestId('footer');
    expect(el.textContent).toBe('Custom Total36.0036.0072.00');
  });

  test('should call onValueCellClick', async () => {
    const onValueCellClick = vi.fn();
    renderPivotTable({
      onValueCellClick,
    });
    const el = await screen.findByText('52.00');
    userEvent.click(el);
    await waitFor(() => {
      expect(onValueCellClick).toHaveBeenCalledWith('52.00', {
        category: 'B',
      });
    });
  });

  test('should render body with initial collapsed', async () => {
    renderPivotTable({
      initialCollapsed: true,
    });
    const el = await screen.findByTestId('body');
    expect(el.textContent).toBe('AB10.0010.0020.0026.0026.0052.00');
    const expandCollapseIcon = await screen.findByTestId('ec-0-0');
    userEvent.click(expandCollapseIcon);
    await waitFor(() => {
      expect(el.textContent).toBe('AUKUSB10.0010.0020.0010.0010.0010.0010.0026.0026.0052.00');
    });
    userEvent.click(expandCollapseIcon);
    await waitFor(() => {
      expect(el.textContent).toBe('AB10.0010.0020.0026.0026.0052.00');
    });
  });

  test('should collapse and expand a group when values are rendered as rows', async () => {
    renderPivotTable(
      {
        initialCollapsed: false,
      },
      valuesInRowsSettings,
    );

    const bodyEl = await screen.findByTestId('body');
    // Find any expand/collapse icon in the body.
    const expandCollapseIcon = await screen.findByTestId('ec-0-0');

    // Initially, the icon should be in expanded state.
    expect(expandCollapseIcon).toHaveAttribute('data-tip', 'Collapse');

    // Collapse the group.
    userEvent.click(expandCollapseIcon);

    await waitFor(() => {
      expect(expandCollapseIcon).toHaveAttribute('data-tip', 'Expand');
    });

    // Expand the group again.
    userEvent.click(expandCollapseIcon);

    await waitFor(() => {
      expect(expandCollapseIcon).toHaveAttribute('data-tip', 'Collapse');
    });

    expect(bodyEl).toBeInTheDocument();
  });

  test('should expand all and collapse all', async () => {
    renderPivotTable({
      initialCollapsed: true,
    });
    const bodyEl = await screen.findByTestId('body');
    expect(bodyEl.textContent).toBe('AB10.0010.0020.0026.0026.0052.00');
    const expandCollapseIcon = await screen.findByTestId('expand-all');
    userEvent.click(expandCollapseIcon);
    await waitFor(() => {
      expect(bodyEl.textContent).toBe(
        'AUKUSBUKUS10.0010.0020.0010.0010.0010.0010.0026.0026.0052.0026.0026.0026.0026.00',
      );
    });
    const collapseAll = await screen.findByTestId('collapse-all');
    userEvent.click(collapseAll);
    await waitFor(() => {
      expect(bodyEl.textContent).toBe('AB10.0010.0020.0026.0026.0052.00');
    });
  });

  test('should render empty state when no data is provided', async () => {
    renderPivotTable({
      data: [],
      emptyStateTitle: 'Custom Empty Title',
      emptyStateSubtitle: 'Custom Empty Subtitle',
    });
    expect(await screen.findByText('Custom Empty Title')).toBeInTheDocument();
    expect(await screen.findByText('Custom Empty Subtitle')).toBeInTheDocument();
  });

  test('should render custom cell renderer', async () => {
    const CustomCell = ({ formattedValue }: CellProps<Item, ColumnKey>) => (
      <div data-testid="custom-cell">{formattedValue}</div>
    );
    renderPivotTable({
      CellRenderer: CustomCell,
    });
    const customCells = await screen.findAllByTestId('custom-cell');
    expect(customCells.length).toBeGreaterThan(0);
  });

  test('should apply custom cell styles', async () => {
    const getCellStyle = () => 'bg-red-500';
    renderPivotTable({
      getCellStyle,
    });
    const cells = await screen.findAllByRole('gridcell');
    expect(cells[0]).toHaveClass('bg-red-500');
  });

  test('should handle footer cell click', async () => {
    const onFooterCellClick = vi.fn();
    renderPivotTable({
      onFooterCellClick,
    });
    const footerCell = await screen.findByText('72.00');
    userEvent.click(footerCell);
    await waitFor(() => {
      expect(onFooterCellClick).toHaveBeenCalledWith(['72.00'], {});
    });
  });

  test('should hide zero values', async () => {
    const testData = [...TEST_DATA, { category: 'A', region: 'UK', price: 0, item: 'Test', qty: 1 }];
    renderPivotTable({
      data: testData,
      hideZeroValues: true,
    });
    const body = await screen.findByTestId('body');
    expect(body.textContent).toBe('AUKUSBUKUS10.0010.0020.0010.0010.0010.0010.0026.0026.0052.0026.0026.0026.0026.00');
  });

  test('should show zero values when hideZeroValues is false', async () => {
    const testData = [...TEST_DATA, { category: 'A', region: 'UK', price: 0, item: 'Test', qty: 1 }];
    renderPivotTable({
      data: testData,
      hideZeroValues: false,
    });
    const body = await screen.findByTestId('body');
    expect(body.textContent).toContain('0.00');
  });

  test('should apply custom row height', async () => {
    const customRowHeight = () => 100;
    renderPivotTable({
      rowHeight: customRowHeight,
    });
    const rows = await screen.findAllByRole('gridcell');
    expect(rows[0]).toHaveStyle({ height: '100px' });
  });

  test('should render sort icon', async () => {
    renderPivotTable({});
    const bodyEl = await screen.findByTestId('body');
    expect(bodyEl.textContent).toBe('AUKUSBUKUS10.0010.0020.0010.0010.0010.0010.0026.0026.0052.0026.0026.0026.0026.00');
    const elList = await screen.findAllByTestId('sort-trigger');
    // We no longer show a sort icon on the total column header, so there should
    // only be sort triggers for the non-total columns.
    expect(elList.length).toBe(2);
    expect(elList[0]).toBeVisible();
    userEvent.click(elList[0]);
    const dropdownContent = await screen.findByTestId('sort-ascending');
    userEvent.click(dropdownContent);
    await waitFor(() => {
      expect(bodyEl.textContent).toBe(
        'AUSUKBUSUK10.0010.0020.0010.0010.0010.0010.0026.0026.0052.0026.0026.0026.0026.00',
      );
    });
    const elList2 = await screen.findAllByTestId('sort-trigger');
    expect(elList2.length).toBe(2);
    expect(elList2[0]).toBeVisible();
    userEvent.click(elList2[0]);
    const dropdownContent2 = await screen.findByTestId('sort-descending');
    userEvent.click(dropdownContent2);
    await waitFor(() => {
      expect(bodyEl.textContent).toBe(
        'BUKUSAUKUS26.0026.0052.0026.0026.0026.0026.0010.0010.0020.0010.0010.0010.0010.00',
      );
    });
  });

  test('should handle disabled sort', async () => {
    renderPivotTable({
      disableSort: true,
    });
    // Verify that sort menu doesn't appear or sort doesn't change
    expect(screen.queryByTestId('sort-icon')).not.toBeInTheDocument();
  });

  test('should remove column and row lines', async () => {
    renderPivotTable({
      removeColumnLines: true,
      removeRowLines: true,
    });
    const table = await screen.findByTestId('pivot-cell-2-1');
    expect(table).toHaveClass('border-l-0');
    expect(table).toHaveClass('border-t-0');
  });

  test('should hide expand/collapse icons', async () => {
    renderPivotTable({
      hideExpandCollapseIcons: true,
    });
    expect(screen.queryByTestId('ec-0-0')).not.toBeInTheDocument();
  });

  test('should handle grayed out summary cells', async () => {
    renderPivotTable({
      grayedOutSummaryCells: true,
    });
    const summaryCells = await screen.findAllByTestId(/pivot-cell-s-/);
    expect(summaryCells[0]).toHaveClass('bg-hover-overlay');
  });

  test('should hide filters', async () => {
    renderPivotTable({
      hideFilters: true,
    });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('should handle too many columns error', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      category: `Category${i}`,
      region: `Region${i}`,
      price: i,
      item: `Item${i}`,
      qty: 1,
    }));

    const initialSettings: PivotSetting<ColumnKey> = {
      rows: ['category'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price'],
    };

    renderPivotTable(
      {
        data: largeData,
      },
      initialSettings,
    );

    expect(mockShowError).toHaveBeenCalledWith(expect.stringContaining('too many to render'));
  });

  test('should render with multiple values', async () => {
    const initialSettings: PivotSetting<ColumnKey> = {
      rows: ['category', 'region'],
      cols: ['region'],
      aggregatorName: 'Sum',
      values: ['price', 'qty'],
    };

    renderPivotTable({}, initialSettings);
    const el = await screen.findByTestId('body');
    // columnsBeforeValues default true: for each value (price, qty), show column dimensions (UK, US)
    expect(el.textContent).toBe(
      'AUKUSBUKUS10.0010.004.004.0020.008.0010.004.0010.004.0010.004.0010.004.0026.0026.004.004.0052.008.0026.004.0026.004.0026.004.0026.004.00',
    );
  });

  test('should expand and collapse column', async () => {
    const initialSettings: PivotSetting<ColumnKey> = {
      rows: ['category'],
      cols: ['category', 'region'],
      aggregatorName: 'Sum',
      values: ['price'],
    };

    renderPivotTable({}, initialSettings);
    const headerEl = await screen.findByTestId('header');
    expect(headerEl.textContent).toBe('CategoryABTotalUKUSUKUS');
    let el = await screen.findAllByTestId(/ech-/);
    expect(el[0]).toBeInTheDocument();
    fireEvent.click(el[0]);
    await waitFor(() => {
      expect(headerEl.textContent).toBe('CategoryABTotalUKUS');
    });
    el = await screen.findAllByTestId(/ech-/);
    expect(el[1]).toBeInTheDocument();
    userEvent.click(el[1]);
    await waitFor(() => {
      expect(headerEl.textContent).toBe('CategoryABTotal');
    });

    el = await screen.findAllByTestId(/ech-/);
    expect(el[0]).toBeInTheDocument();
    userEvent.click(el[0]);
    await waitFor(() => {
      expect(headerEl.textContent).toBe('CategoryABTotalUKUS');
    });
    el = await screen.findAllByTestId(/ech-/);
    expect(el[1]).toBeInTheDocument();
    userEvent.click(el[1]);
    await waitFor(() => {
      expect(headerEl.textContent).toBe('CategoryABTotalUKUSUKUS');
    });
  });

  test('should render csv download button', async () => {
    render(
      <TestAppProvider>
        <PivotContextProvider columns={columns} initialSettings={initialSettings} onSettingsChange={emptyFunction}>
          <PivotCsvDownloadButton />
        </PivotContextProvider>
      </TestAppProvider>,
    );
    const el = await screen.findByTestId('csv-download');
    expect(el).toBeInTheDocument();
  });
});
