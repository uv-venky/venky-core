import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockedFunction } from 'vitest';
import { useValue, useRowIds, useRows, useDBRows } from '@/components/core/hooks/useStoreHooks';
import { StoreClass } from '@/lib/core/client/store';
import type { Store, StoreProps } from '@/lib/core/common/types/Store';
import { getTestRow, TestDS, type TestDataSourceType } from '@/lib/core/server/ds/__tests__/sample-ds';

// Mock fetch for API calls
function mockFetchJson<T>(data: T): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
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

describe('useStoreHooks', () => {
  let store: Store<TestDataSourceType>;

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn());
    (fetch as MockedFunction<typeof fetch>).mockImplementation(async (input: string | URL | Request) => {
      if (input === '/api/attributes') {
        return mockFetchJson({ status: 'OK', attributes: TestDS.attributes });
      }
      if (input === '/api/ds') {
        return mockFetchJson({
          status: 'OK',
          rows: [getTestRow(1), getTestRow(2), getTestRow(3)],
          totalRowCount: 3,
        });
      }
      return mockFetchJson({ status: 'ERROR', message: 'Not found' });
    });
    store = StoreClass.createSync<TestDataSourceType>(props);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    store.cleanup();
    vi.clearAllMocks();
  });

  describe('useValue', () => {
    test('should only rerender component when its specific attribute changes', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      // Use refs to track render counts that persist across renders
      const roleNameRenderCount = { current: 0 };
      const roleCodeRenderCount = { current: 0 };

      const RoleNameComponent = () => {
        roleNameRenderCount.current++;
        const value = useValue(store, 'roleName');
        return <div data-testid="role-name">{value}</div>;
      };

      const RoleCodeComponent = () => {
        roleCodeRenderCount.current++;
        const value = useValue(store, 'roleCode');
        return <div data-testid="role-code">{value}</div>;
      };

      render(
        <>
          <RoleNameComponent />
          <RoleCodeComponent />
        </>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(roleNameRenderCount.current).toBeGreaterThan(0);
        expect(roleCodeRenderCount.current).toBeGreaterThan(0);
      });

      const initialRoleNameCount = roleNameRenderCount.current;
      const initialRoleCodeCount = roleCodeRenderCount.current;

      // Change roleName - only RoleNameComponent should rerender
      act(() => {
        const row = store.currentRow();
        if (row) {
          store.setValue('roleName', 'updated name', store.rowId(row));
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          expect(roleNameRenderCount.current).toBeGreaterThan(initialRoleNameCount);
        },
        { timeout: 1000 },
      );

      // Only roleName component should have rerendered
      expect(roleNameRenderCount.current).toBeGreaterThan(initialRoleNameCount);
      expect(roleCodeRenderCount.current).toBe(initialRoleCodeCount);

      const roleNameCountBeforeRoleCodeChange = roleNameRenderCount.current;
      const roleCodeCountBeforeRoleCodeChange = roleCodeRenderCount.current;

      // Change roleCode - only RoleCodeComponent should rerender
      act(() => {
        const row = store.currentRow();
        if (row) {
          store.setValue('roleCode', 'updated-code', store.rowId(row));
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          expect(roleCodeRenderCount.current).toBeGreaterThan(roleCodeCountBeforeRoleCodeChange);
        },
        { timeout: 1000 },
      );

      // Only roleCode component should have rerendered
      expect(roleNameRenderCount.current).toBe(roleNameCountBeforeRoleCodeChange);
      expect(roleCodeRenderCount.current).toBeGreaterThan(roleCodeCountBeforeRoleCodeChange);
    });
  });

  describe('useRowIds, useRows, useDBRows', () => {
    test('only useRowIds should not rerender when a row attribute is changed', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      // Use refs to track render counts that persist across renders
      const rowIdsRenderCount = { current: 0 };
      const rowsRenderCount = { current: 0 };
      const dbRowsRenderCount = { current: 0 };

      const RowIdsComponent = () => {
        rowIdsRenderCount.current++;
        const rowIds = useRowIds(store);
        return <div data-testid="row-ids">{rowIds.length}</div>;
      };

      const RowsComponent = () => {
        rowsRenderCount.current++;
        const rows = useRows(store);
        return <div data-testid="rows">{rows.length}</div>;
      };

      const DBRowsComponent = () => {
        dbRowsRenderCount.current++;
        const dbRows = useDBRows(store);
        return <div data-testid="db-rows">{dbRows.length}</div>;
      };

      render(
        <>
          <RowIdsComponent />
          <RowsComponent />
          <DBRowsComponent />
        </>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(rowIdsRenderCount.current).toBeGreaterThan(0);
        expect(rowsRenderCount.current).toBeGreaterThan(0);
        expect(dbRowsRenderCount.current).toBeGreaterThan(0);
      });

      const initialRowIdsCount = rowIdsRenderCount.current;
      const initialRowsCount = rowsRenderCount.current;
      const initialDBRowsCount = dbRowsRenderCount.current;

      // Change an attribute in a row
      act(() => {
        const row = store.currentRow();
        if (row) {
          store.setValue('roleName', 'updated name', store.rowId(row));
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          // useRows and useDBRows should rerender to reflect updated row data
          expect(rowsRenderCount.current).toBeGreaterThan(initialRowsCount);
          expect(dbRowsRenderCount.current).toBeGreaterThan(initialDBRowsCount);
        },
        { timeout: 1000 },
      );

      // useRowIds should NOT rerender since the list of IDs hasn't changed
      expect(rowIdsRenderCount.current).toBe(initialRowIdsCount);
      // useRows and useDBRows SHOULD rerender since the row data has changed
      expect(rowsRenderCount.current).toBeGreaterThan(initialRowsCount);
      expect(dbRowsRenderCount.current).toBeGreaterThan(initialDBRowsCount);

      const rowsCountBeforeSecondChange = rowsRenderCount.current;
      const dbRowsCountBeforeSecondChange = dbRowsRenderCount.current;

      // Change another attribute to be thorough
      act(() => {
        const row = store.currentRow();
        if (row) {
          store.setValue('roleCode', 'updated-code', store.rowId(row));
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          expect(rowsRenderCount.current).toBeGreaterThan(rowsCountBeforeSecondChange);
          expect(dbRowsRenderCount.current).toBeGreaterThan(dbRowsCountBeforeSecondChange);
        },
        { timeout: 1000 },
      );

      // useRowIds should still NOT rerender
      expect(rowIdsRenderCount.current).toBe(initialRowIdsCount);
      // useRows and useDBRows should rerender again
      expect(rowsRenderCount.current).toBeGreaterThan(rowsCountBeforeSecondChange);
      expect(dbRowsRenderCount.current).toBeGreaterThan(dbRowsCountBeforeSecondChange);
    });

    test('all three hooks should rerender when a new row is added and when a row is deleted', async () => {
      await store.executeQuery();

      // Use refs to track render counts that persist across renders
      const rowIdsRenderCount = { current: 0 };
      const rowsRenderCount = { current: 0 };
      const dbRowsRenderCount = { current: 0 };

      const RowIdsComponent = () => {
        rowIdsRenderCount.current++;
        const rowIds = useRowIds(store);
        return <div data-testid="row-ids">{rowIds.length}</div>;
      };

      const RowsComponent = () => {
        rowsRenderCount.current++;
        const rows = useRows(store);
        return <div data-testid="rows">{rows.length}</div>;
      };

      const DBRowsComponent = () => {
        dbRowsRenderCount.current++;
        const dbRows = useDBRows(store);
        return <div data-testid="db-rows">{dbRows.length}</div>;
      };

      render(
        <>
          <RowIdsComponent />
          <RowsComponent />
          <DBRowsComponent />
        </>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(rowIdsRenderCount.current).toBeGreaterThan(0);
        expect(rowsRenderCount.current).toBeGreaterThan(0);
        expect(dbRowsRenderCount.current).toBeGreaterThan(0);
      });

      const initialRowIdsCount = rowIdsRenderCount.current;
      const initialRowsCount = rowsRenderCount.current;
      const initialDBRowsCount = dbRowsRenderCount.current;

      // Add a new row - all three hooks should rerender
      await act(async () => {
        await store.createNew({
          partialRecord: {
            roleCode: 'new-row',
            roleName: 'New Row',
            seqNo: 999,
            startDate: '2021-01-01T00:00:00.000Z',
            createdAt: '2021-01-01T00:00:00.000Z',
            createdBy: 'test',
            updatedAt: '2021-01-01T00:00:00.000Z',
            updatedBy: 'test',
            calcField: 0,
            isActive: true,
            ynFlag: 'Y',
            tfFlag: 'T',
          },
        });
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          // All three hooks should rerender when a new row is added
          expect(rowIdsRenderCount.current).toBeGreaterThan(initialRowIdsCount);
          expect(rowsRenderCount.current).toBeGreaterThan(initialRowsCount);
          expect(dbRowsRenderCount.current).toBeGreaterThan(initialDBRowsCount);
        },
        { timeout: 1000 },
      );

      // All three hooks should have rerendered
      expect(rowIdsRenderCount.current).toBeGreaterThan(initialRowIdsCount);
      expect(rowsRenderCount.current).toBeGreaterThan(initialRowsCount);
      expect(dbRowsRenderCount.current).toBeGreaterThan(initialDBRowsCount);

      const rowIdsCountBeforeDelete = rowIdsRenderCount.current;
      const rowsCountBeforeDelete = rowsRenderCount.current;
      const dbRowsCountBeforeDelete = dbRowsRenderCount.current;

      // Delete a row - all three hooks should rerender
      act(() => {
        const rowIds = store.rowIds();
        if (rowIds.length > 0) {
          // Delete the first row
          store.deleteFromStore(rowIds[0]);
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          // All three hooks should rerender when a row is deleted
          expect(rowIdsRenderCount.current).toBeGreaterThan(rowIdsCountBeforeDelete);
          expect(rowsRenderCount.current).toBeGreaterThan(rowsCountBeforeDelete);
          expect(dbRowsRenderCount.current).toBeGreaterThan(dbRowsCountBeforeDelete);
        },
        { timeout: 1000 },
      );

      // All three hooks should have rerendered again
      expect(rowIdsRenderCount.current).toBeGreaterThan(rowIdsCountBeforeDelete);
      expect(rowsRenderCount.current).toBeGreaterThan(rowsCountBeforeDelete);
      expect(dbRowsRenderCount.current).toBeGreaterThan(dbRowsCountBeforeDelete);
    });

    test('useRows and useDBRows should rerender when a boolean attribute is updated (true to false and false to true)', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      // Use refs to track render counts that persist across renders
      const rowIdsRenderCount = { current: 0 };
      const rowsRenderCount = { current: 0 };
      const dbRowsRenderCount = { current: 0 };

      const RowIdsComponent = () => {
        rowIdsRenderCount.current++;
        const rowIds = useRowIds(store);
        return <div data-testid="row-ids">{rowIds.length}</div>;
      };

      const RowsComponent = () => {
        rowsRenderCount.current++;
        const rows = useRows(store);
        return <div data-testid="rows">{rows.length}</div>;
      };

      const DBRowsComponent = () => {
        dbRowsRenderCount.current++;
        const dbRows = useDBRows(store);
        return <div data-testid="db-rows">{dbRows.length}</div>;
      };

      render(
        <>
          <RowIdsComponent />
          <RowsComponent />
          <DBRowsComponent />
        </>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(rowIdsRenderCount.current).toBeGreaterThan(0);
        expect(rowsRenderCount.current).toBeGreaterThan(0);
        expect(dbRowsRenderCount.current).toBeGreaterThan(0);
      });

      const initialRowIdsCount = rowIdsRenderCount.current;
      const initialRowsCount = rowsRenderCount.current;
      const initialDBRowsCount = dbRowsRenderCount.current;

      // Get the initial value of isActive (should be true based on getTestRow)
      const initialRow = store.currentRow();
      const initialIsActive = initialRow?.isActive;
      expect(initialIsActive).toBe(true);

      // Change isActive from true to false - useRows and useDBRows should rerender
      act(() => {
        const row = store.currentRow();
        if (row) {
          store.setValue('isActive', false, store.rowId(row));
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          // useRows and useDBRows should rerender to reflect updated row data
          expect(rowsRenderCount.current).toBeGreaterThan(initialRowsCount);
          expect(dbRowsRenderCount.current).toBeGreaterThan(initialDBRowsCount);
        },
        { timeout: 1000 },
      );

      // useRowIds should NOT rerender since the list of IDs hasn't changed
      expect(rowIdsRenderCount.current).toBe(initialRowIdsCount);
      // useRows and useDBRows SHOULD rerender since the row data has changed
      expect(rowsRenderCount.current).toBeGreaterThan(initialRowsCount);
      expect(dbRowsRenderCount.current).toBeGreaterThan(initialDBRowsCount);

      // Verify the value was actually changed
      const rowAfterFirstChange = store.currentRow();
      expect(rowAfterFirstChange?.isActive).toBe(false);

      const rowsCountBeforeSecondChange = rowsRenderCount.current;
      const dbRowsCountBeforeSecondChange = dbRowsRenderCount.current;

      // Change isActive from false to true - useRows and useDBRows should rerender again
      act(() => {
        const row = store.currentRow();
        if (row) {
          store.setValue('isActive', true, store.rowId(row));
        }
      });

      // Wait for React to process the update and rerender
      await waitFor(
        () => {
          expect(rowsRenderCount.current).toBeGreaterThan(rowsCountBeforeSecondChange);
          expect(dbRowsRenderCount.current).toBeGreaterThan(dbRowsCountBeforeSecondChange);
        },
        { timeout: 1000 },
      );

      // useRowIds should still NOT rerender
      expect(rowIdsRenderCount.current).toBe(initialRowIdsCount);
      // useRows and useDBRows should rerender again
      expect(rowsRenderCount.current).toBeGreaterThan(rowsCountBeforeSecondChange);
      expect(dbRowsRenderCount.current).toBeGreaterThan(dbRowsCountBeforeSecondChange);

      // Verify the value was actually changed back
      const rowAfterSecondChange = store.currentRow();
      expect(rowAfterSecondChange?.isActive).toBe(true);
    });
  });
});
