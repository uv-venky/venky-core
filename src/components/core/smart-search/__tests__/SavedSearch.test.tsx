import type { SavedSearch } from '@/lib/common/ds/types/core/SavedSearch';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import SavedSearchComponent from '@/components/core/smart-search/SavedSearch';
import type { Roles } from '@/lib/common/ds/types/core/Roles';
import SmartSearch from '@/components/core/smart-search/SmartSearch';
import { emptyFunction } from '@/lib/core/common/isEmpty';
import userEvent from '@testing-library/user-event';
import { columns } from '@/components/core/smart-search/__tests__/test-data';
import { TestAppProvider } from '@/test/test-utils';

describe('SavedSearch', () => {
  const renderSmartSearch = (savedSearch: React.ReactNode) => {
    return render(
      <TestAppProvider>
        <SmartSearch
          border="full"
          roundedCorners={true}
          columns={columns}
          filters={[]}
          onSearch={emptyFunction}
          searchOnBlur={false}
          savedSearch={savedSearch}
        />
      </TestAppProvider>,
    );
  };
  test('should render', async () => {
    render(
      <TestAppProvider>
        <SavedSearchComponent
          savedSearches={[]}
          isLoading={false}
          onDeleteView={() => Promise.resolve({} as SavedSearch<object>)}
          onUpdateView={() => Promise.resolve({} as SavedSearch<object>)}
          onCreateView={() => Promise.resolve({} as SavedSearch<object>)}
        />
      </TestAppProvider>,
    );
    const button = await screen.findByTestId('saved-search-button');
    expect(button).toBeDefined();
  });

  test('should render saved searches', async () => {
    const onCreateView = vi.fn();
    renderSmartSearch(
      <SavedSearchComponent
        savedSearches={[]}
        isLoading={false}
        onDeleteView={() => Promise.resolve({} as SavedSearch<Roles>)}
        onUpdateView={() => Promise.resolve({} as SavedSearch<Roles>)}
        onCreateView={onCreateView}
      />,
    );
    const button = await screen.findByTestId('saved-search-button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    const dropdownMenu = await screen.findByTestId('saved-search-dropdown-menu');
    expect(dropdownMenu).toBeDefined();
    // create-new-view
    const createNewView = await screen.findByTestId('create-new-view');
    expect(createNewView).toBeDefined();
    fireEvent.click(createNewView);
    const input = await screen.findByTestId('saved-search-name-input');
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: 'testing' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('saved-search-save-button'));
    });
    expect(onCreateView).toHaveBeenCalledWith({
      description: '',
      isDefault: false,
      isPublic: false,
      name: 'testing',
      owner: '',
      payload: {
        filters: undefined,
      },
    });
  });

  test('should delete saved search', async () => {
    const onCreateView = vi.fn();
    const onDeleteView = vi.fn();
    const savedSearches: SavedSearch<Roles>[] = [
      {
        appId: 'test',
        description: 'description',
        isDefault: false,
        isPublic: true,
        createdAt: new Date().toISOString(),
        createdBy: '',
        id: '1',
        itemId: '',
        payload: {},
        updatedAt: new Date().toISOString(),
        name: 'test',
        owner: 'guest',
        pageId: '',
        updatedBy: '',
      },
    ];
    renderSmartSearch(
      <SavedSearchComponent
        savedSearches={savedSearches}
        isLoading={false}
        onDeleteView={onDeleteView}
        onUpdateView={() => Promise.resolve({} as SavedSearch<Roles>)}
        onCreateView={onCreateView}
      />,
    );
    const button = await screen.findByTestId('saved-search-button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    const dropdownMenu = await screen.findByTestId('saved-search-dropdown-menu');
    expect(dropdownMenu).toBeDefined();
    const item = await screen.findByTestId('saved-view-item-1');
    expect(item).toBeDefined();
    await act(async () => {
      await userEvent.hover(item);
      const deleteButton = await screen.findByTestId('delete-saved-view-1');
      expect(deleteButton).toBeDefined();
      fireEvent.click(deleteButton);
    });
    expect(onDeleteView).toHaveBeenCalledWith('1');
  });
});
