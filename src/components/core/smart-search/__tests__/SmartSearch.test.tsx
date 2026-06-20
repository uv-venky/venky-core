import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartSearch } from '@/components/core/smart-search';
import type { OnSearchCallback } from '@/components/core/smart-search/SmartSearch';
import type { Filters } from '@/lib/core/common/ds/types/filter';
import { parse } from 'date-fns';
import userEvent from '@testing-library/user-event';
import { columns, type TestRoles } from '@/components/core/smart-search/__tests__/test-data';
import CONSTANTS from '@/lib/core/client/constants';
import { TestAppProvider } from '@/test/test-utils';

const { IGNORE_CASE_DEFAULT } = CONSTANTS;

describe('SmartSearch', () => {
  let onSearch: ReturnType<typeof vi.fn> & OnSearchCallback<TestRoles>;

  beforeEach(() => {
    onSearch = vi.fn() as ReturnType<typeof vi.fn> & OnSearchCallback<TestRoles>;
  });

  function getFilters(roleCode = 'admin', startDate = '2025-01-01T00:00:00.000Z'): Filters<TestRoles> {
    return [{ roleCode: { is: roleCode } }, { startDate: { on: startDate } }];
  }

  const renderSmartSearch = (filters: Filters<TestRoles>) => {
    return render(
      <TestAppProvider>
        <SmartSearch
          border="full"
          roundedCorners={true}
          columns={columns}
          filters={filters}
          onSearch={onSearch}
          searchOnBlur={false}
          savedSearch={undefined}
        />
      </TestAppProvider>,
    );
  };

  test('should render and trigger search', async () => {
    renderSmartSearch([]);
    const button = screen.getByTestId('search-button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  test('should render and trigger search with correct parameters', async () => {
    renderSmartSearch(getFilters());
    const button = screen.getByTestId('search-button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: getFilters() }, 'search-click');
    });
  });

  test('should update the filter value', async () => {
    renderSmartSearch(getFilters());
    const displayValue = screen.getByTestId('filter-value-0-roleCode');
    expect(displayValue).toBeDefined();
    fireEvent.click(displayValue);
    const input = screen.getByTestId('text-input');
    expect(input).toBeDefined();
    fireEvent.input(input, { target: { value: 'testing' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);
    await waitFor(() => {
      const filters = getFilters('testing');
      expect(onSearch).toHaveBeenCalledWith({ filters }, 'search-click');
    });
  });

  test('should update the date filter value', async () => {
    renderSmartSearch(getFilters());
    const displayValue = screen.getByTestId('filter-value-1-startDate');
    expect(displayValue).toBeDefined();
    fireEvent.click(displayValue);
    const input = screen.getByTestId('date-input');
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: '2025-01-02' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);
    await waitFor(() => {
      const filters = getFilters('admin', '2025-01-02');
      expect(onSearch).toHaveBeenCalledWith({ filters }, 'search-click');
    });
  });

  test('should update the between date filter value', async () => {
    renderSmartSearch([{ startDate: { on: '2025-01-01T00:00:00.000Z' } }]);
    const operator = screen.getByTestId('filter-operator-0-startDate');
    expect(operator).toBeDefined();
    fireEvent.click(operator);
    const bn = await screen.findByTestId('dropdown-menu-item-bn');
    fireEvent.click(bn);
    const inputFrom = await screen.findByTestId('date-input-from');
    expect(inputFrom).toBeDefined();
    fireEvent.change(inputFrom, { target: { value: '2025-01-02' } });
    const inputTo = screen.getByTestId('date-input-to');
    expect(inputTo).toBeDefined();
    fireEvent.change(inputTo, { target: { value: '2025-01-03' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);
    const from = '2025-01-02';
    const to = '2025-01-03';
    const filters = [{ startDate: { bn: [from, to] } }];
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters }, 'search-click');
    });
  });

  test('should update the between date time filter value', async () => {
    renderSmartSearch([{ updatedAt: { on: '2025-01-01T00:00:00.000Z' } }]);
    const operator = screen.getByTestId('filter-operator-0-updatedAt');
    expect(operator).toBeDefined();
    fireEvent.click(operator);
    const bn = await screen.findByTestId('dropdown-menu-item-bn');
    fireEvent.click(bn);
    const inputFrom = await screen.findByTestId('date-time-input-from');
    expect(inputFrom).toBeDefined();
    fireEvent.change(inputFrom, { target: { value: '2025-01-02T12:00' } });
    const inputTo = screen.getByTestId('date-time-input-to');
    expect(inputTo).toBeDefined();
    fireEvent.change(inputTo, { target: { value: '2025-01-03T12:00' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);
    const from = parse('2025-01-02T12:00', `yyyy-MM-dd'T'HH:mm`, new Date());
    const to = parse('2025-01-03T12:00', `yyyy-MM-dd'T'HH:mm`, new Date());
    const filters = [{ updatedAt: { bn: [from.toISOString(), to.toISOString()] } }];
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters }, 'search-click');
    });
  });

  test('should render nested filter', async () => {
    const filters = [{ anyof: [{ roleCode: { is: 'admin' } }, { roleCode: { is: 'user' } }] }];
    renderSmartSearch(filters);
    const button = screen.getByTestId('search-button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters }, 'search-click');
    });
    onSearch.mockClear();
    const anyof = screen.getByTestId('nested-entry-0-anyof');
    expect(anyof).toBeDefined();
    fireEvent.click(anyof);
    const dropdownMenu = screen.getByTestId('nested-entry-dropdown-menu');
    expect(dropdownMenu).toBeDefined();
    userEvent.click(dropdownMenu);
    const dropdownMenuItem = await screen.findByTestId('dropdown-menu-item-noneof');
    expect(dropdownMenuItem).toBeDefined();
    fireEvent.click(dropdownMenuItem);
    const btn = screen.getByTestId('search-button');
    fireEvent.click(btn);
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(
        {
          filters: [
            {
              noneof: [{ roleCode: { is: 'admin' } }, { roleCode: { is: 'user' } }],
            },
          ],
        },
        'search-click',
      );
    });
  });

  test('should clear filter', async () => {
    const filters = [{ anyof: [{ roleCode: { is: 'admin' } }, { roleCode: { is: 'user' } }] }];
    renderSmartSearch(filters);
    const clearBtn = screen.getByTestId('clear-button');
    fireEvent.click(clearBtn);
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [] }, 'clear-filters');
    });
  });

  test('should add a new filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-roleCode');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    // Enter a value
    const valueInput = screen.getByTestId('text-input');
    expect(valueInput).toBeDefined();
    fireEvent.input(valueInput, { target: { value: 'admin' } });

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const expectedFilters = IGNORE_CASE_DEFAULT
      ? { filters: [{ roleCode: { is: 'admin', ignoreCase: true } }] }
      : { filters: [{ roleCode: { is: 'admin' } }] };

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(expectedFilters, 'search-click');
    });
    onSearch.mockClear();

    const valueElement = screen.getByTestId('filter-value-0-roleCode');
    expect(valueElement).toBeDefined();
    fireEvent.click(valueElement);

    const matchCaseButton = screen.getByTestId('match-case-button');
    expect(matchCaseButton).toBeDefined();
    fireEvent.click(matchCaseButton);
    fireEvent.click(button);

    const expectedFilters2 = IGNORE_CASE_DEFAULT
      ? { filters: [{ roleCode: { is: 'admin' } }] }
      : { filters: [{ roleCode: { is: 'admin', ignoreCase: true } }] };

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(expectedFilters2, 'search-click');
    });
  });

  test('should remove a filter', async () => {
    renderSmartSearch(getFilters());

    // Find and click the remove button for the startDate filter
    const removeButton = screen.getByTestId('filter-remove-1-startDate');
    expect(removeButton).toBeDefined();
    fireEvent.click(removeButton);

    // Search after removing the filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [getFilters()[0]] }, 'search-click');
    });
  });

  test('should change filter operator', async () => {
    renderSmartSearch([getFilters()[0]]);

    // Click on the operator to change it
    const operatorElement = screen.getByTestId('filter-operator-0-roleCode');
    expect(operatorElement).toBeDefined();
    fireEvent.click(operatorElement);

    // Select a different operator
    const operatorOption = await screen.findByTestId('dropdown-menu-item-like');
    expect(operatorOption).toBeDefined();
    fireEvent.click(operatorOption);

    // Search with the updated operator
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      const expectedFilters = IGNORE_CASE_DEFAULT
        ? [{ roleCode: { like: 'admin', ignoreCase: true } }]
        : [{ roleCode: { like: 'admin' } }];
      expect(onSearch).toHaveBeenCalledWith({ filters: expectedFilters }, 'search-click');
    });
  });

  test('should change filter column', async () => {
    renderSmartSearch([getFilters()[0]]);

    // Click on the column to change it
    const columnElement = screen.getByTestId('filter-field-0-roleCode');
    expect(columnElement).toBeDefined();
    fireEvent.click(columnElement);

    // Select a different column
    const columnOption = await screen.findByTestId('field-selector-item-roleName');
    expect(columnOption).toBeDefined();
    fireEvent.click(columnOption);

    const input = screen.getByTestId('text-input');
    expect(input).toBeDefined();
    fireEvent.input(input, { target: { value: 'testing' } });

    // Search with the updated column
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const expectedFilters = IGNORE_CASE_DEFAULT
      ? [{ roleName: { is: 'testing', ignoreCase: true } }]
      : [{ roleName: { is: 'testing' } }];

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: expectedFilters }, 'search-click');
    });
  });

  test('should add a nested filter group', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('combiner-anyof');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    const columnOption = await screen.findByTestId('field-selector-item-roleName');
    expect(columnOption).toBeDefined();
    fireEvent.click(columnOption);

    // Enter a value
    const valueInput = screen.getByTestId('text-input');
    expect(valueInput).toBeDefined();
    fireEvent.input(valueInput, { target: { value: 'admin' } });

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const expectedFilters = IGNORE_CASE_DEFAULT
      ? {
          filters: [{ anyof: [{ roleName: { is: 'admin', ignoreCase: true } }] }],
        }
      : { filters: [{ anyof: [{ roleName: { is: 'admin' } }] }] };

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(expectedFilters, 'search-click');
    });
    onSearch.mockClear();

    const nestedEntry = screen.getByTestId('nested-entry-0-anyof');
    expect(nestedEntry).toBeDefined();
    fireEvent.click(nestedEntry);

    // Add a nested filter
    const addNestedFilterButton = screen.getByTestId('add-nested-filter-0-anyof');
    expect(addNestedFilterButton).toBeDefined();
    fireEvent.click(addNestedFilterButton);

    const columnOption2 = await screen.findByTestId('field-selector-item-roleCode');
    expect(columnOption2).toBeDefined();
    fireEvent.click(columnOption2);

    // Enter a value
    const valueInput2 = screen.getByTestId('text-input');
    expect(valueInput2).toBeDefined();
    fireEvent.input(valueInput2, { target: { value: 'user' } });

    // Search with the new nested filter
    fireEvent.click(button);

    const expectedFilters2 = IGNORE_CASE_DEFAULT
      ? {
          filters: [
            {
              anyof: [{ roleName: { is: 'admin', ignoreCase: true } }, { roleCode: { is: 'user', ignoreCase: true } }],
            },
          ],
        }
      : {
          filters: [
            {
              anyof: [{ roleName: { is: 'admin' } }, { roleCode: { is: 'user' } }],
            },
          ],
        };

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(expectedFilters2, 'search-click');
    });
  });

  test('should remove a nested group', async () => {
    const filters = [{ anyof: [{ roleCode: { is: 'admin' } }, { roleCode: { is: 'user' } }] }];
    renderSmartSearch(filters);

    const nestedEntry = screen.getByTestId('nested-entry-0-anyof');
    expect(nestedEntry).toBeDefined();
    fireEvent.click(nestedEntry);

    // Remove the first filter from the nested group
    const removeNestedFilterButton = screen.getByTestId('remove-nested-filter-0-anyof');
    expect(removeNestedFilterButton).toBeDefined();
    fireEvent.click(removeNestedFilterButton);
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [] }, 'search-click');
    });
  });

  test('should remove a filter from a nested group', async () => {
    const filters = [{ anyof: [{ roleCode: { is: 'admin' } }, { roleCode: { is: 'user' } }] }];
    renderSmartSearch(filters);

    // Remove the first filter from the nested group
    const nestedEntry = screen.getByTestId('filter-remove-0-anyof-0-roleCode');
    expect(nestedEntry).toBeDefined();
    fireEvent.click(nestedEntry);

    // Search after removing the nested filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ anyof: [{ roleCode: { is: 'user' } }] }] }, 'search-click');
    });
  });

  test('should add a new multi-text filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-roleCode');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    // Select a multi-text input
    const multiTextInput = screen.getByTestId('operator-dropdown-menu');
    expect(multiTextInput).toBeDefined();
    userEvent.click(multiTextInput);

    const multiTextInputOption = await screen.findByTestId('dropdown-menu-item-hasany');
    expect(multiTextInputOption).toBeDefined();
    fireEvent.click(multiTextInputOption);

    // Enter a value
    const valueInput = screen.getByTestId('multi-text-input');
    expect(valueInput).toBeDefined();
    fireEvent.input(valueInput, { target: { value: 'admin1' } });
    fireEvent.keyDown(valueInput, { key: 'Tab' });
    await waitFor(() => {
      const values = screen.getAllByTestId('multi-text-value');
      expect(values).toHaveLength(1);
    });
    fireEvent.input(valueInput, { target: { value: 'admin2' } });
    fireEvent.keyDown(valueInput, { key: 'Tab' });
    const showAllButton = screen.getByTestId('multi-text-show-all');
    expect(showAllButton).toBeDefined();
    fireEvent.click(showAllButton);
    await waitFor(() => {
      const values2 = screen.getAllByTestId('multi-text-value');
      expect(values2).toHaveLength(2);
    });

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    const expectedFilters = IGNORE_CASE_DEFAULT
      ? {
          filters: [{ roleCode: { hasany: ['admin1', 'admin2'], ignoreCase: true } }],
        }
      : { filters: [{ roleCode: { hasany: ['admin1', 'admin2'] } }] };

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(expectedFilters, 'search-click');
    });
  });

  test('should add a new multi-number filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-seqNo');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    // Select a multi-text input
    const multiTextInput = screen.getByTestId('operator-dropdown-menu');
    expect(multiTextInput).toBeDefined();
    userEvent.click(multiTextInput);

    const multiTextInputOption = await screen.findByTestId('dropdown-menu-item-in');
    expect(multiTextInputOption).toBeDefined();
    fireEvent.click(multiTextInputOption);

    // Enter a value
    const valueInput = screen.getByTestId('multi-number-input');
    expect(valueInput).toBeDefined();
    fireEvent.input(valueInput, { target: { value: '1' } });
    fireEvent.keyDown(valueInput, { key: 'Tab' });
    await waitFor(() => {
      const values = screen.getAllByTestId('multi-number-value');
      expect(values).toHaveLength(1);
    });
    fireEvent.input(valueInput, { target: { value: '2' } });
    fireEvent.keyDown(valueInput, { key: 'Tab' });
    const showAllButton = screen.getByTestId('multi-number-show-all');
    expect(showAllButton).toBeDefined();
    fireEvent.click(showAllButton);
    await waitFor(() => {
      const values2 = screen.getAllByTestId('multi-number-value');
      expect(values2).toHaveLength(2);
    });

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ seqNo: { in: [1, 2] } }] }, 'search-click');
    });
  });

  test('should add a new number between filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-seqNo');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    // Select a multi-text input
    const multiTextInput = screen.getByTestId('operator-dropdown-menu');
    expect(multiTextInput).toBeDefined();
    userEvent.click(multiTextInput);

    const multiTextInputOption = await screen.findByTestId('dropdown-menu-item-bn');
    expect(multiTextInputOption).toBeDefined();
    fireEvent.click(multiTextInputOption);

    // Enter a value
    const valueInput = screen.getByTestId('number-range-input-from');
    expect(valueInput).toBeDefined();
    fireEvent.input(valueInput, { target: { value: '1' } });
    const valueInput2 = screen.getByTestId('number-range-input-to');
    expect(valueInput2).toBeDefined();
    fireEvent.input(valueInput2, { target: { value: '2' } });

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ seqNo: { bn: [1, 2] } }] }, 'search-click');
    });
  });

  test('should add a new multi-select filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-description');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    // Select a multi-text input
    const multiTextInput = screen.getByTestId('operator-dropdown-menu');
    expect(multiTextInput).toBeDefined();
    userEvent.click(multiTextInput);

    const multiTextInputOption = await screen.findByTestId('dropdown-menu-item-in');
    expect(multiTextInputOption).toBeDefined();
    fireEvent.click(multiTextInputOption);

    // Enter a value
    const valueInput = screen.getByTestId('multi-select-input-trigger');
    expect(valueInput).toBeDefined();
    userEvent.click(valueInput);

    const option1 = await screen.findByTestId('multi-select-input-item-option1');
    expect(option1).toBeDefined();
    fireEvent.click(option1);
    await waitFor(() => {
      const values = screen.getAllByTestId('multi-select-value');
      expect(values).toHaveLength(1);
    });

    const option2 = await screen.findByTestId('multi-select-input-item-option2');
    expect(option2).toBeDefined();
    fireEvent.click(option2);

    const showAllButton = screen.getByTestId('multi-select-show-all');
    expect(showAllButton).toBeDefined();
    fireEvent.click(showAllButton);
    await waitFor(() => {
      const values2 = screen.getAllByTestId('multi-select-value');
      expect(values2).toHaveLength(2);
    });

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(
        { filters: [{ description: { in: ['option1', 'option2'] } }] },
        'search-click',
      );
    });
  });

  test('should add a new single select filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-description');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    const option1 = await screen.findByTestId('select-input-item-option1');
    expect(option1).toBeDefined();
    fireEvent.click(option1);

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ description: { is: 'option1' } }] }, 'search-click');
    });
  });

  test('should add a new single YN filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-ynFlag');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    const option1 = await screen.findByTestId('select-item-Y');
    expect(option1).toBeDefined();
    fireEvent.click(option1);

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ ynFlag: { is: 'Y' } }] }, 'search-click');
    });
  });

  test('should add a new single TF filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-tfFlag');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    const option1 = await screen.findByTestId('select-item-F');
    expect(option1).toBeDefined();
    fireEvent.click(option1);

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ tfFlag: { is: 'F' } }] }, 'search-click');
    });
  });

  test('should add a new single boolean filter', async () => {
    renderSmartSearch([]);
    const addFilterButton = screen.getByTestId('search-input');
    expect(addFilterButton).toBeDefined();
    fireEvent.click(addFilterButton);

    // Select a column
    const columnSelector = screen.getByTestId('field-selector-item-boolFlag');
    expect(columnSelector).toBeDefined();
    fireEvent.click(columnSelector);

    const option1 = await screen.findByTestId('select-item-true');
    expect(option1).toBeDefined();
    fireEvent.click(option1);

    // Search with the new filter
    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ filters: [{ boolFlag: { istrue: true } }] }, 'search-click');
    });
  });

  test('keeps savedSearch mounted but hidden in natural-language input mode', () => {
    render(
      <TestAppProvider
        value={{
          naturalLanguageSearchEnabled: true,
          DEFAULT_SEARCH_INPUT_MODE: 'nl',
        }}
      >
        <SmartSearch
          border="full"
          columns={columns}
          filters={[]}
          onSearch={onSearch}
          searchOnBlur={false}
          enableNaturalLanguageSearch
          savedSearch={<span data-testid="saved-search-mount-marker">saved</span>}
        />
      </TestAppProvider>,
    );

    const marker = screen.getByTestId('saved-search-mount-marker');
    expect(marker).toBeInTheDocument();
    expect(marker.parentElement).toHaveClass('hidden');
    expect(screen.getByTestId('nl-search-input')).toBeInTheDocument();
  });
});
