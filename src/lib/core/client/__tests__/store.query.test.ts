import { describe, test, expect, beforeEach, vi, type MockedFunction, afterEach } from 'vitest';
import { StoreClass } from '@/lib/core/client/store';
import type { Store, StoreProps } from '@/lib/core/common/types/Store';
import { getTestRow, TestDS, type TestDataSourceType } from '@/lib/core/server/ds/__tests__/sample-ds';
import type { Query } from '../../common/ds/types/filter';

function mockFetchJson<T>(data: T): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
    // You can stub other Response methods/properties if needed
  } as unknown as Response;
}

const props: StoreProps<TestDataSourceType> = {
  datasourceId: 'test',
  alias: 'test',
  limit: 10,
  includeCount: false,
  autoQuery: false,
  page: 'test',
};

const baseRequest = {
  debug: false,
  ds: 'test',
  query: {
    limit: 10,
    offset: 0,
  },
};

interface TestRequest {
  debug: boolean;
  ds: string;
  query: Query<TestDataSourceType>;
}

describe('store', () => {
  let store: Store<TestDataSourceType>;
  let requestSent: TestRequest;

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn());
    (fetch as MockedFunction<typeof fetch>).mockImplementation(
      async (input: string | URL | Request, init?: RequestInit) => {
        requestSent = JSON.parse((init?.body as string) ?? '{}');
        if (input === '/api/attributes') {
          return mockFetchJson({ status: 'OK', attributes: TestDS.attributes });
        }
        if (input === '/api/ds') {
          return mockFetchJson({
            status: 'OK',
            rows: [getTestRow(1), getTestRow(2)],
          });
        }
        return mockFetchJson({ status: 'ERROR', message: 'Not found' });
      },
    );
    store = StoreClass.createSync<TestDataSourceType>(props);
    // wait for store to be initialized
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    store.cleanup();
    vi.clearAllMocks();
  });

  test('should create a store', () => {
    expect(store).toBeInstanceOf(StoreClass);
    expect(requestSent).toEqual({ ds: 'test' });
  });
  test('should execute query', async () => {
    await store.executeQuery();
    expect(requestSent).toEqual(baseRequest);
    expect(store.dbList().length).toBe(2);
  });

  test('should execute query with offset', async () => {
    await store.executeQuery({ query: { offset: 10 } });
    expect(requestSent).toEqual({
      ...baseRequest,
      query: { ...baseRequest.query, offset: 10 },
    });
  });

  test('should execute query with limit', async () => {
    await store.executeQuery({ query: { limit: 20 } });
    expect(requestSent).toEqual({
      ...baseRequest,
      query: { ...baseRequest.query, limit: 20 },
    });
  });

  test('should execute query with offset and limit', async () => {
    await store.executeQuery({ query: { offset: 10, limit: 20 } });
    expect(requestSent).toEqual({
      ...baseRequest,
      query: { ...baseRequest.query, offset: 10, limit: 20 },
    });
  });

  test('should include smart filters', async () => {
    const filter = [{ roleCode: { is: 'admin' } }];
    store.setSmartSearchFilters(filter);
    await store.executeQuery();
    expect(requestSent.query.filters).toEqual(filter);
  });

  test('should include header filters', async () => {
    const filter = { roleCode: { is: 'header' } };
    store.setHeaderFilter(filter);
    await store.executeQuery();
    expect(requestSent.query.filters).toEqual([filter]);
  });

  test('should include header filters with multiple values', async () => {
    const filter1 = { roleCode: { is: 'header1' } };
    store.setHeaderFilter(filter1);
    const filter2 = { roleName: { is: 'header2' } };
    store.setHeaderFilter(filter2);
    await store.executeQuery();
    expect(requestSent.query.filters).toEqual([filter1, filter2]);
  });

  test('should skip pre-query callbacks when refreshOrPagination is true', async () => {
    const preQueryCallback = vi.fn((query) => {
      query.filters = [...(query.filters || []), { roleCode: { is: 'preQuery' } }];
      return query;
    });

    store.addPreQueryCallback(preQueryCallback);

    // First query should apply pre-query callbacks
    await store.executeQuery({
      query: { filters: [{ roleCode: { is: 'original' } }] },
    });
    expect(requestSent.query.filters).toContainEqual({
      roleCode: { is: 'preQuery' },
    });
    expect(preQueryCallback).toHaveBeenCalledTimes(1);

    // Reset mock
    vi.clearAllMocks();

    // Query with refreshOrPagination should skip pre-query callbacks
    await store.executeQuery({
      query: { filters: [{ roleCode: { is: 'pagination' } }] },
      refreshOrPagination: true,
    } as any);
    expect(requestSent.query.filters).not.toContainEqual({
      roleCode: { is: 'preQuery' },
    });
    expect(preQueryCallback).toHaveBeenCalledTimes(0);
  });

  test('should apply refreshOrPagination to sort operations', async () => {
    const preQueryCallback = vi.fn((query) => {
      query.filters = [...(query.filters || []), { roleCode: { is: 'preQuery' } }];
      return query;
    });

    store.addPreQueryCallback(preQueryCallback);

    // Initial query to set up previousQuery
    await store.executeQuery({
      query: { filters: [{ roleCode: { is: 'original' } }] },
    });
    expect(preQueryCallback).toHaveBeenCalledTimes(1);

    // Reset mock
    vi.clearAllMocks();

    // Sort operation should skip pre-query callbacks
    await store.sort({ roleName: 1 });
    expect(preQueryCallback).toHaveBeenCalledTimes(0);
  });

  test('should apply refreshOrPagination to pagination operations', async () => {
    const preQueryCallback = vi.fn((query) => {
      query.filters = [...(query.filters || []), { roleCode: { is: 'preQuery' } }];
      return query;
    });

    store.addPreQueryCallback(preQueryCallback);

    // Initial query to set up previousQuery
    await store.executeQuery({
      query: { filters: [{ roleCode: { is: 'original' } }] },
    });
    expect(preQueryCallback).toHaveBeenCalledTimes(1);

    // Reset mock
    vi.clearAllMocks();

    // Next page operation should skip pre-query callbacks
    await store.next();
    expect(preQueryCallback).toHaveBeenCalledTimes(0);
  });

  test('should not duplicate defaultFilters on refresh', async () => {
    const defaultFilters = [{ roleCode: { is: 'admin' } }];
    const storeWithDefaults = StoreClass.createSync<TestDataSourceType>({
      ...props,
      alias: 'test-default-filters',
      filters: defaultFilters,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await storeWithDefaults.executeQuery();
    expect(requestSent.query.filters).toEqual(defaultFilters);

    await storeWithDefaults.refresh();
    expect(requestSent.query.filters).toEqual(defaultFilters);

    await storeWithDefaults.refresh();
    expect(requestSent.query.filters).toEqual(defaultFilters);

    storeWithDefaults.cleanup();
  });

  test('should not duplicate defaultFilters combined with user filters on refresh', async () => {
    const defaultFilters = [{ roleCode: { is: 'admin' } }];
    const userFilters = [{ roleName: { is: 'User' } }];
    const storeWithDefaults = StoreClass.createSync<TestDataSourceType>({
      ...props,
      alias: 'test-default-and-user-filters',
      filters: defaultFilters,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await storeWithDefaults.executeQuery({ query: { filters: userFilters } });
    expect(requestSent.query.filters).toEqual([...defaultFilters, ...userFilters]);

    await storeWithDefaults.refresh();
    expect(requestSent.query.filters).toEqual([...defaultFilters, ...userFilters]);

    await storeWithDefaults.refresh();
    expect(requestSent.query.filters).toEqual([...defaultFilters, ...userFilters]);

    storeWithDefaults.cleanup();
  });

  test('should apply refreshOrPagination to refresh operations', async () => {
    const preQueryCallback = vi.fn((query) => {
      query.filters = [...(query.filters || []), { roleCode: { is: 'preQuery' } }];
      return query;
    });

    store.addPreQueryCallback(preQueryCallback);

    // Initial query to set up previousQuery
    await store.executeQuery({
      query: { filters: [{ roleCode: { is: 'original' } }] },
    });
    expect(preQueryCallback).toHaveBeenCalledTimes(1);

    // Reset mock
    vi.clearAllMocks();

    // Refresh operation should skip pre-query callbacks
    await store.refresh();
    expect(preQueryCallback).toHaveBeenCalledTimes(0);
  });

  test('should refetch totalRowCount on forced executeQuery', async () => {
    let countFetchCount = 0;
    (fetch as MockedFunction<typeof fetch>).mockImplementation(
      async (input: string | URL | Request, init?: RequestInit) => {
        requestSent = JSON.parse((init?.body as string) ?? '{}');
        if (input === '/api/attributes') {
          return mockFetchJson({ status: 'OK', attributes: TestDS.attributes });
        }
        if (input === '/api/ds') {
          if (requestSent.query?.countOnly) {
            countFetchCount += 1;
            return mockFetchJson({ status: 'OK', rows: [], count: countFetchCount === 1 ? 2 : 3 });
          }
          return mockFetchJson({ status: 'OK', rows: [getTestRow(1), getTestRow(2)] });
        }
        return mockFetchJson({ status: 'ERROR', message: 'Not found' });
      },
    );

    const countStore = StoreClass.createSync<TestDataSourceType>({
      ...props,
      alias: 'test-count-force',
      includeCount: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await countStore.executeQuery();
    expect(countStore.getState().totalRowCount).toBe(2);
    expect(countFetchCount).toBe(1);

    await countStore.executeQuery({ force: true });
    expect(countStore.getState().totalRowCount).toBe(3);
    expect(countFetchCount).toBe(2);

    countStore.cleanup();
  });
});
