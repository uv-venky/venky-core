/* Copyright (c) 2024-present Venky Corp. */

import { describe, test, expect, beforeEach, vi, type MockedFunction, afterEach } from 'vitest';
import { StoreClass, storeMatchesIdentifier, invalidateStore, invalidateStores } from '@/lib/core/client/store';
import { globalPubSub } from '@/lib/core/client/pub-sub';
import type { Store, StoreIdentifier, StoreProps } from '@/lib/core/common/types/Store';
import { TestDS, type TestDataSourceType } from '@/lib/core/server/ds/__tests__/sample-ds';
import type { Query } from '@/lib/core/common/ds/types/filter';

function mockFetchJson<T>(data: T): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

describe('storeMatchesIdentifier', () => {
  let store: Store<TestDataSourceType>;

  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (input: string | URL | Request) => {
        if (input === '/api/attributes') {
          return mockFetchJson({ status: 'OK', attributes: TestDS.attributes });
        }
        return mockFetchJson({ status: 'OK', rows: [] });
      }),
    );

    store = StoreClass.createSync<TestDataSourceType>({
      datasourceId: 'TestDataSource',
      alias: 'test-alias',
      page: 'test-page',
      limit: 10,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    store.cleanup();
    vi.clearAllMocks();
  });

  test('matches string identifier by datasourceId', () => {
    expect(storeMatchesIdentifier(store, 'TestDataSource')).toBe(true);
    expect(storeMatchesIdentifier(store, 'OtherDataSource')).toBe(false);
  });

  test('matches object identifier with datasourceId only', () => {
    expect(storeMatchesIdentifier(store, { datasourceId: 'TestDataSource' })).toBe(true);
    expect(storeMatchesIdentifier(store, { datasourceId: 'OtherDataSource' })).toBe(false);
  });

  test('matches object identifier with datasourceId and alias', () => {
    expect(storeMatchesIdentifier(store, { datasourceId: 'TestDataSource', alias: 'test-alias' })).toBe(true);
    expect(storeMatchesIdentifier(store, { datasourceId: 'TestDataSource', alias: 'other-alias' })).toBe(false);
  });

  test('matches object identifier with datasourceId and page', () => {
    expect(storeMatchesIdentifier(store, { datasourceId: 'TestDataSource', page: 'test-page' })).toBe(true);
    expect(storeMatchesIdentifier(store, { datasourceId: 'TestDataSource', page: 'other-page' })).toBe(false);
  });

  test('matches object identifier with all fields', () => {
    expect(
      storeMatchesIdentifier(store, {
        datasourceId: 'TestDataSource',
        alias: 'test-alias',
        page: 'test-page',
      }),
    ).toBe(true);

    expect(
      storeMatchesIdentifier(store, {
        datasourceId: 'TestDataSource',
        alias: 'test-alias',
        page: 'wrong-page',
      }),
    ).toBe(false);

    expect(
      storeMatchesIdentifier(store, {
        datasourceId: 'TestDataSource',
        alias: 'wrong-alias',
        page: 'test-page',
      }),
    ).toBe(false);
  });
});

describe('invalidateStore and invalidateStores', () => {
  let pubSubSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pubSubSpy = vi.spyOn(globalPubSub, 'pub');
  });

  afterEach(() => {
    pubSubSpy.mockRestore();
  });

  test('invalidateStore publishes OnStoreInvalidate event with single identifier', () => {
    invalidateStore('TestDataSource');

    expect(pubSubSpy).toHaveBeenCalledWith('OnStoreInvalidate', {
      identifiers: ['TestDataSource'],
      sourceStoreKey: undefined,
    });
  });

  test('invalidateStore publishes with object identifier', () => {
    const identifier: StoreIdentifier = { datasourceId: 'TestDataSource', alias: 'test-alias' };
    invalidateStore(identifier);

    expect(pubSubSpy).toHaveBeenCalledWith('OnStoreInvalidate', {
      identifiers: [identifier],
      sourceStoreKey: undefined,
    });
  });

  test('invalidateStore includes sourceStoreKey when provided', () => {
    invalidateStore('TestDataSource', 'source-store-key');

    expect(pubSubSpy).toHaveBeenCalledWith('OnStoreInvalidate', {
      identifiers: ['TestDataSource'],
      sourceStoreKey: 'source-store-key',
    });
  });

  test('invalidateStores publishes OnStoreInvalidate event with multiple identifiers', () => {
    const identifiers: StoreIdentifier[] = ['DataSource1', { datasourceId: 'DataSource2', page: 'page1' }];
    invalidateStores(identifiers);

    expect(pubSubSpy).toHaveBeenCalledWith('OnStoreInvalidate', {
      identifiers,
      sourceStoreKey: undefined,
    });
  });

  test('invalidateStores does not publish when identifiers array is empty', () => {
    invalidateStores([]);

    expect(pubSubSpy).not.toHaveBeenCalled();
  });
});

describe('store save invalidation', () => {
  let store: Store<TestDataSourceType>;
  let pubSubSpy: ReturnType<typeof vi.spyOn>;
  let requestSent: {
    debug: boolean;
    ds: string;
    rows?: TestDataSourceType[];
    query?: Query<TestDataSourceType>;
  };

  const props: StoreProps<TestDataSourceType> = {
    datasourceId: 'test',
    alias: 'test',
    limit: 10,
    includeCount: false,
    autoQuery: false,
    page: 'test',
    invalidateOnSave: ['getTestData', 'getOtherData'],
    invalidateStoresOnSave: ['OtherDataSource', { datasourceId: 'ThirdDataSource', page: 'specific-page' }],
    onInitialized: async (s) => {
      s.setIsLoading(false);
    },
  };

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn());
    (fetch as MockedFunction<typeof fetch>).mockImplementation(
      async (input: string | URL | Request, init?: RequestInit) => {
        requestSent = JSON.parse((init?.body as string) ?? '{}') as {
          ds: string;
          rows?: TestDataSourceType[];
          query?: Query<TestDataSourceType>;
          debug: boolean;
        };
        if (input === '/api/attributes') {
          return mockFetchJson({ status: 'OK', attributes: TestDS.attributes });
        }
        if (input === '/api/ds') {
          if (requestSent.rows) {
            return mockFetchJson({
              status: 'OK',
              rows: requestSent.rows.map((r) => ({ ...r, _status: 'Q' })),
            });
          }
          return mockFetchJson({ status: 'OK', rows: [] });
        }
        return mockFetchJson({ status: 'ERROR', message: 'Not found' });
      },
    );

    pubSubSpy = vi.spyOn(globalPubSub, 'pub');

    store = StoreClass.createSync<TestDataSourceType>(props);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    store.cleanup();
    pubSubSpy.mockRestore();
    vi.clearAllMocks();
  });

  test('save publishes OnStoreInvalidate when invalidateStoresOnSave is configured', async () => {
    // Create a new record with roleCode (primary key)
    await store.createNew({ partialRecord: { roleCode: 'test-role' }, status: 'I' });

    // Verify dirty rows exist
    expect(store.dirtyRows().length).toBe(1);

    // Clear spy before save to only capture save-related calls
    pubSubSpy.mockClear();

    // Save the store
    const saveResult = await store.save({ silent: true });

    // Verify save succeeded
    expect(saveResult).toBe(true);

    // Check that OnStoreInvalidate was published
    const invalidateCalls = pubSubSpy.mock.calls.filter((call: unknown[]) => call[0] === 'OnStoreInvalidate');

    expect(invalidateCalls.length).toBe(1);
    expect(invalidateCalls[0][1]).toEqual({
      identifiers: ['OtherDataSource', { datasourceId: 'ThirdDataSource', page: 'specific-page' }],
      sourceStoreKey: store.key,
    });
  });

  test('save does not publish OnStoreInvalidate when invalidateStoresOnSave is not configured', async () => {
    // Create a store without invalidateStoresOnSave
    const propsNoInvalidation: StoreProps<TestDataSourceType> = {
      datasourceId: 'test2',
      alias: 'test2',
      limit: 10,
      page: 'test',
      onInitialized: async (s) => {
        s.setIsLoading(false);
      },
    };

    const storeWithoutInvalidation = StoreClass.createSync<TestDataSourceType>(propsNoInvalidation);
    await new Promise((resolve) => setTimeout(resolve, 0));

    pubSubSpy.mockClear();

    // Create a new record
    await storeWithoutInvalidation.createNew({ partialRecord: { roleCode: 'test-role-2' }, status: 'I' });

    // Save the store
    const saveResult = await storeWithoutInvalidation.save({ silent: true });
    expect(saveResult).toBe(true);

    // Check that OnStoreInvalidate was NOT published
    const invalidateCalls = pubSubSpy.mock.calls.filter((call: unknown[]) => call[0] === 'OnStoreInvalidate');

    expect(invalidateCalls.length).toBe(0);

    storeWithoutInvalidation.cleanup();
  });

  test('save publishes OnDataSourceChange for same-datasource autoRefresh', async () => {
    await store.createNew({ partialRecord: { roleCode: 'test-role' }, status: 'I' });

    pubSubSpy.mockClear();

    await store.save({ silent: true });

    // Check that OnDataSourceChange was published (for autoRefresh)
    const dataSourceChangeCalls = pubSubSpy.mock.calls.filter((call: unknown[]) => call[0] === 'OnDataSourceChange');

    expect(dataSourceChangeCalls.length).toBe(1);
    expect(dataSourceChangeCalls[0][1]).toEqual({
      datasourceId: 'test',
      sourceStoreKey: store.key,
      action: 'insert',
    });
  });
});
