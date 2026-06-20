import { describe, test, expect, beforeEach, vi, type MockedFunction, afterEach } from 'vitest';
import { StoreClass } from '@/lib/core/client/store';
import type { Store, StoreProps } from '@/lib/core/common/types/Store';
import { getTestRow, TestDS, type TestDataSourceType } from '@/lib/core/server/ds/__tests__/sample-ds';
import type { Query } from '@/lib/core/common/ds/types/filter';

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
  onInitialized: async (store) => {
    store.setIsLoading(false);
  },
};

const baseRequest = {
  debug: false,
  ds: 'test',
  rows: [
    {
      roleCode: 'test',
      _status: 'I',
      _cid: 'test',
    },
  ],
};
describe('store', () => {
  let store: Store<TestDataSourceType>;
  let requestSent: {
    debug: boolean;
    ds: string;
    rows?: TestDataSourceType[];
    query?: Query<TestDataSourceType>;
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

  test('should be dirty after createNew', async () => {
    expect(store.isStoreDirty()).toBe(false);
    await store.createNew({ partialRecord: { roleCode: 'test' }, status: 'I' });
    expect(store.isStoreDirty()).toBe(true);
  });

  test('should not be dirty after save', async () => {
    await store.createNew({ partialRecord: { roleCode: 'test' }, status: 'I' });
    expect(store.isStoreDirty()).toBe(true);
    await store.save();
    expect(store.isStoreDirty()).toBe(false);
  });

  test('should post new record', async () => {
    await store.createNew({ partialRecord: { roleCode: 'test' }, status: 'I' });
    await store.save();
    expect(requestSent).toEqual(baseRequest);
  });

  test('should post new record with multiple values', async () => {
    await store.createNew({
      partialRecord: { roleCode: 'test1' },
      status: 'I',
    });
    await store.createNew({
      partialRecord: { roleCode: 'test2' },
      status: 'I',
    });
    await store.save();
    expect(requestSent.rows?.length).toEqual(2);
  });

  test('should update record', async () => {
    await store.executeQuery();
    const row = store.currentRow();
    if (!row) {
      throw new Error('No row found');
    }
    expect(row.roleName).toEqual('test 1');
    store.setValue('roleName', 'test 1 updated');
    await store.save();
    expect(requestSent.rows?.length).toEqual(1);
    expect(requestSent.rows?.[0].roleName).toEqual('test 1 updated');
  });

  test('should decrement totalRowCount after delete save when includeCount is true', async () => {
    const countStore = StoreClass.createSync<TestDataSourceType>({
      ...props,
      alias: 'test-count',
      includeCount: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await countStore.executeQuery();

    countStore.getState().totalRowCount = 2;
    const rowId = countStore.rowIds()[0];
    if (!rowId) {
      throw new Error('No row found');
    }

    await countStore.deleteRow(rowId);
    await countStore.save({ feedback: 'NONE' });

    expect(countStore.getState().totalRowCount).toBe(1);
    countStore.cleanup();
  });

  test('should increment totalRowCount after insert save when includeCount is true', async () => {
    const countStore = StoreClass.createSync<TestDataSourceType>({
      ...props,
      alias: 'test-count-insert',
      includeCount: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await countStore.executeQuery();

    countStore.getState().totalRowCount = 2;
    await countStore.createNew({ partialRecord: { roleCode: 'test-new' }, status: 'I' });
    await countStore.save({ feedback: 'NONE' });

    expect(countStore.getState().totalRowCount).toBe(3);
    countStore.cleanup();
  });
});
