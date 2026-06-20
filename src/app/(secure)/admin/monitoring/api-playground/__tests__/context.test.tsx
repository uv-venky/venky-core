import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApiTesterProvider, useApiTester } from '../context';
import type { DataSource } from '../types';
import { registerHeaderModifier, clearHeaderModifiers } from '@/lib/core/client/header-plugin';

// Mock dependencies
vi.mock('@/components/core/hooks/useURLBase64State', () => ({
  useURLBase64State: () => [null, vi.fn()],
}));

vi.mock('@/components/core/hooks/useURLStringState', () => ({
  useURLStringState: () => ['Query', vi.fn()],
}));

vi.mock('@/components/core/common/Notification', () => ({
  showError: vi.fn(),
}));

vi.mock('@/lib/core/client/state', () => ({
  getTrackId: vi.fn(() => 'test-track-id'),
  resetTrackId: vi.fn(),
}));

vi.mock('@/components/core/hooks/useLatest', () => ({
  useLatest: (value: any) => ({ current: value }),
}));

vi.mock('@/components/core/session-context', () => ({
  useClientSession: () => ({
    userName: 'testuser',
    roles: ['admin', 'user'],
    settings: {
      customerName: 'test-customer',
    },
  }),
}));

// Mock fetch
global.fetch = vi.fn();

const mockDataSource: DataSource = {
  id: 'test-ds',
  type: 'table',
  description: 'Test Data Source',
  readOnly: false,
  attributes: [
    {
      code: 'id',
      name: 'ID',
      type: 'Number',
      primary: true,
      select: true,
      insert: true,
    },
    { code: 'name', name: 'Name', type: 'Text', select: true, insert: true },
  ],
  access: [
    {
      roleCode: 'admin',
      query: true,
      insert: true,
      update: true,
      delete: true,
    },
  ],
};

// Test component to access context
function TestComponent() {
  const context = useApiTester();
  return (
    <div>
      <div data-testid="data-sources-count">{context.state.dataSources.length}</div>
      <div data-testid="selected-ds">{context.state.selectedDS?.id || 'none'}</div>
      <div data-testid="query-mode">{context.state.queryMode}</div>
      <div data-testid="loading">{context.state.loading.toString()}</div>
      <button
        type="button"
        data-testid="set-selected-ds"
        onClick={() => context.dispatch.setSelectedDS(mockDataSource)}
      >
        Set Data Source
      </button>
      <button type="button" data-testid="execute-query" onClick={() => context.executeQuery()}>
        Execute Query
      </button>
    </div>
  );
}

describe('ApiTesterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearHeaderModifiers();
    // Register header modifier for tests
    registerHeaderModifier((headers) => {
      headers['X-Customer-Name'] = 'test-customer';
    });
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ status: 'OK', dataSources: [mockDataSource] }),
      ok: true,
      headers: new Headers(),
    });
  });

  afterEach(() => {
    clearHeaderModifiers();
  });

  it('provides initial state', async () => {
    render(
      <ApiTesterProvider>
        <TestComponent />
      </ApiTesterProvider>,
    );

    // Wait for the useEffect to complete by checking for the expected state
    await waitFor(() => {
      expect(screen.getByTestId('data-sources-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('selected-ds')).toHaveTextContent('test-ds'); // First DS should be selected
    expect(screen.getByTestId('query-mode')).toHaveTextContent('Query');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('loads data sources on mount', async () => {
    render(
      <ApiTesterProvider>
        <TestComponent />
      </ApiTesterProvider>,
    );

    // Just verify that fetch was called, don't wait for the full async operation
    expect(global.fetch).toHaveBeenCalledWith('/api/ds/list', {
      method: 'GET',
      credentials: 'include',
    });
  });

  it('allows setting selected data source', async () => {
    render(
      <ApiTesterProvider>
        <TestComponent />
      </ApiTesterProvider>,
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('data-sources-count')).toHaveTextContent('1');
    });

    const setButton = screen.getByTestId('set-selected-ds');
    fireEvent.click(setButton);

    expect(screen.getByTestId('selected-ds')).toHaveTextContent('test-ds');
  });

  it('provides executeQuery function', async () => {
    // Mock fetch to return different responses for different calls
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'OK', dataSources: [mockDataSource] }),
        ok: true,
        headers: new Headers(),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'OK', rows: [{ id: 1, name: 'Test' }] }),
        headers: new Headers({ 'content-type': 'application/json' }),
        ok: true,
      });
    (global.fetch as any) = mockFetch;

    render(
      <ApiTesterProvider>
        <TestComponent />
      </ApiTesterProvider>,
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('data-sources-count')).toHaveTextContent('1');
    });

    // Set a data source first
    const setButton = screen.getByTestId('set-selected-ds');
    fireEvent.click(setButton);

    // Execute query
    const executeButton = screen.getByTestId('execute-query');
    fireEvent.click(executeButton);

    // Check that fetch was called with the correct parameters for the query execution
    expect(global.fetch).toHaveBeenCalledWith('/api/ds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Track-Id': 'test-track-id',
        'X-Customer-Name': 'test-customer',
      },
      body: expect.any(String),
    });
  });

  it('handles query execution errors', async () => {
    // Mock fetch to return success for initial load, then error for query
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'OK', dataSources: [mockDataSource] }),
        ok: true,
        headers: new Headers(),
      })
      .mockRejectedValueOnce(new Error('Network error'));
    (global.fetch as any) = mockFetch;

    render(
      <ApiTesterProvider>
        <TestComponent />
      </ApiTesterProvider>,
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('data-sources-count')).toHaveTextContent('1');
    });

    // Set a data source first
    const setButton = screen.getByTestId('set-selected-ds');
    fireEvent.click(setButton);

    // Execute query
    const executeButton = screen.getByTestId('execute-query');
    fireEvent.click(executeButton);

    // Should handle the error gracefully
    expect(global.fetch).toHaveBeenCalled();
  });
});
