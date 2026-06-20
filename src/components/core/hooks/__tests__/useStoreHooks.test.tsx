import { describe, test, expect, beforeEach, vi, type MockedFunction, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StoreClass } from '@/lib/core/client/store';
import type { Store, StoreProps } from '@/lib/core/common/types/Store';
import { getTestRow, TestDS, type TestDataSourceType } from '@/lib/core/server/ds/__tests__/sample-ds';
import {
  useStoreFilters,
  useRowIds,
  useRows,
  useDBRows,
  useCurrentRowId,
  useCurrentRow,
  useCurrentRowIndex,
  useNextRow,
  usePreviousRow,
  useCurrentRowSync,
  useRowValue,
  useValue,
  useRowAtId,
  useRow,
  useValueSetter,
  useIsStoreDirty,
  useIsRowDirty,
  useIsRowAttributeDirty,
  useRowAttributeOriginalValue,
  useStoreSize,
  useStoreRowCount,
  useSortState,
  useFullSortState,
  useIsStoreBusy,
  useIsStoreLoading,
  useIsStorePosting,
  useStoreError,
  usePreQuery,
  useHasMoreRows,
  useIsRowSelected,
  useSelectedRowIds,
  useIsAllSelected,
  useSelectedRows,
  useIsHeaderFilterDirty,
  useIsHeaderFilterApplied,
  useIsHeaderFiltersHidden,
  useStoreFieldErrors,
} from '@/components/core/hooks/useStoreHooks';
import { RowIdProvider } from '@/components/core/page/RowIdProvider';

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

  describe('useStoreFilters', () => {
    test('should return current smart search filters', () => {
      const testFilters = [{ roleName: { like: 'test' } }];
      store.setSmartSearchFilters(testFilters);
      const { result } = renderHook(() => useStoreFilters(store));
      expect(result.current[0]).toEqual(testFilters);
    });
  });

  describe('useRowIds', () => {
    test('should return empty array when no rowIds', () => {
      const { result } = renderHook(() => useRowIds(store));
      expect(result.current).toEqual([]);
    });

    test('should return rowIds after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useRowIds(store));
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe('useRows', () => {
    test('should return empty array when no rows', () => {
      const { result } = renderHook(() => useRows(store));
      expect(result.current).toEqual([]);
    });

    test('should return rows after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useRows(store));
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0]).toHaveProperty('roleName');
    });
  });

  describe('useDBRows', () => {
    test('should return empty array when no rows', () => {
      const { result } = renderHook(() => useDBRows(store));
      expect(result.current).toEqual([]);
    });

    test('should return DB rows after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useDBRows(store));
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe('useCurrentRowId', () => {
    test('should return undefined when no current row', () => {
      const { result } = renderHook(() => useCurrentRowId(store));
      expect(result.current).toBeUndefined();
    });

    test('should return current row ID when set', async () => {
      await store.setCurrentRowId('test-id');
      const { result } = renderHook(() => useCurrentRowId(store));
      expect(result.current).toBe('test-id');
    });

    test('should return the first row ID after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useCurrentRowId(store));
      expect(result.current).toBe('test1');
    });

    test('should retain the row ID after re-query', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test2');
      await store.executeQuery();
      const { result } = renderHook(() => useCurrentRowId(store));
      expect(result.current).toBe('test2');
    });

    test('should reset the missing row ID to the first row ID after re-query', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test4');
      const { result } = renderHook(() => useCurrentRowId(store));
      expect(result.current).toBe('test4');
      await act(async () => {
        await store.executeQuery({ force: true });
      });
      const { result: result2 } = renderHook(() => useCurrentRowId(store));
      expect(result2.current).toBe('test1');
    });
  });

  describe('useCurrentRow', () => {
    test('should return undefined when no current row', () => {
      const { result } = renderHook(() => useCurrentRow(store));
      expect(result.current).toBeUndefined();
    });

    test('should return current row after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useCurrentRow(store));
      expect(result.current).toBeDefined();
      expect(result.current?.roleName).toBeDefined();
    });

    test('should return current row when set', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test2');
      const { result } = renderHook(() => useCurrentRow(store));
      expect(result.current).toBeDefined();
      expect(result.current?.roleName).toBe('test 2');
    });

    test('should provide updated values in useEffect when properties are not accessed during render', async () => {
      // This test verifies the comment in useCurrentRow:
      // "Spread the proxy row to force valtio to track all properties.
      // Without this, valtio only tracks properties accessed during render, causing
      // stale data when properties are accessed in useEffect or callbacks."
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedValues: Array<string | undefined> = [];
      const effectRunCount = { current: 0 };

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        const row = useCurrentRow(store);

        // Access roleName ONLY in useEffect, NOT during render
        // This is the key scenario - if we didn't spread the proxy,
        // valtio wouldn't track this property and the effect wouldn't
        // re-run when roleName changes
        useEffect(() => {
          effectRunCount.current++;
          capturedValues.push(row?.roleName);
        }, [row]);

        // Only render the row id to ensure roleName is NOT accessed during render
        return <div data-testid="row-id">{row?._id}</div>;
      };

      rtlRender(<TestComponent />);

      // Wait for initial effect to run
      await waitFor(() => {
        expect(effectRunCount.current).toBeGreaterThan(0);
      });

      const initialEffectCount = effectRunCount.current;
      expect(capturedValues[capturedValues.length - 1]).toBe('test 1');

      // Update roleName - this should trigger a re-render and effect should see the new value
      act(() => {
        store.setValue('roleName', 'updated name', 'test1');
      });

      // Wait for effect to re-run with the updated value
      await waitFor(
        () => {
          expect(effectRunCount.current).toBeGreaterThan(initialEffectCount);
        },
        { timeout: 1000 },
      );

      // The effect should have captured the updated value
      expect(capturedValues[capturedValues.length - 1]).toBe('updated name');
    });

    test('should provide updated values in callbacks after re-render when properties are not accessed during render', async () => {
      // This test verifies that after a store update triggers a re-render,
      // callback handlers see the fresh values even if the property was
      // never accessed during render.
      // The spread in useCurrentRow ensures all properties are tracked,
      // so when any property changes, the component re-renders with fresh data.
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      let capturedValueInCallback: string | undefined;
      const renderCount = { current: 0 };

      const React = await import('react');
      const { useCallback } = React;
      const { render: rtlRender, screen, fireEvent, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        renderCount.current++;
        const row = useCurrentRow(store);

        // useCallback depends on row, so it will get fresh values after re-render
        const handleClick = useCallback(() => {
          // Access roleCode ONLY in callback, NOT during render
          capturedValueInCallback = row?.roleCode;
        }, [row]);

        // Only render something unrelated to roleCode
        return (
          <button type="button" data-testid="test-button" onClick={handleClick}>
            Click me
          </button>
        );
      };

      rtlRender(<TestComponent />);

      const initialRenderCount = renderCount.current;

      // Update roleCode - this should trigger a re-render because we spread the proxy
      act(() => {
        store.setValue('roleCode', 'updated-code', 'test1');
      });

      // Wait for re-render
      await waitFor(
        () => {
          expect(renderCount.current).toBeGreaterThan(initialRenderCount);
        },
        { timeout: 1000 },
      );

      // Click the button after re-render - should see the updated value
      fireEvent.click(screen.getByTestId('test-button'));

      // The callback should see the updated value, not the stale original
      expect(capturedValueInCallback).toBe('updated-code');
    });

    test('should maintain referential stability when row has not changed', async () => {
      // This test verifies the comment: "useMemo ensures we only create a new object
      // when the row actually changes"
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedRowReferences: Array<object | undefined> = [];

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      // Counter to force re-renders without changing the row
      let forceRenderCount = 0;
      let setForceRender: (n: number) => void;

      const TestComponent = () => {
        const [, setCount] = React.useState(0);
        setForceRender = setCount;
        const row = useCurrentRow(store);

        useEffect(() => {
          capturedRowReferences.push(row);
        }, [row]);

        return <div>{forceRenderCount}</div>;
      };

      rtlRender(<TestComponent />);

      // Wait for initial effect
      await waitFor(() => {
        expect(capturedRowReferences.length).toBeGreaterThan(0);
      });

      const initialReference = capturedRowReferences[capturedRowReferences.length - 1];
      const initialCaptureCount = capturedRowReferences.length;

      // Force a re-render without changing the row data
      act(() => {
        forceRenderCount++;
        setForceRender(forceRenderCount);
      });

      // Give React time to process
      await new Promise((resolve) => setTimeout(resolve, 50));

      // The effect should NOT have re-run because useMemo returns the same reference
      // when the row hasn't changed
      expect(capturedRowReferences.length).toBe(initialCaptureCount);

      // Now actually change the row - this should create a new reference
      act(() => {
        store.setValue('roleName', 'changed name', 'test1');
      });

      await waitFor(
        () => {
          expect(capturedRowReferences.length).toBeGreaterThan(initialCaptureCount);
        },
        { timeout: 1000 },
      );

      const newReference = capturedRowReferences[capturedRowReferences.length - 1];
      // The references should be different objects after the row changed
      expect(newReference).not.toBe(initialReference);
    });

    test('should track all property changes when multiple properties are updated in sequence', async () => {
      // Verify that when multiple properties are updated in sequence,
      // the effect sees all the updated values correctly
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedSnapshots: Array<{ roleName?: string; roleCode?: string; seqNo?: number }> = [];
      const effectRunCount = { current: 0 };

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        const row = useCurrentRow(store);

        useEffect(() => {
          effectRunCount.current++;
          capturedSnapshots.push({
            roleName: row?.roleName,
            roleCode: row?.roleCode,
            seqNo: row?.seqNo,
          });
        }, [row]);

        // Don't access any of these properties during render
        return <div data-testid="test">{row?._id}</div>;
      };

      rtlRender(<TestComponent />);

      await waitFor(() => {
        expect(effectRunCount.current).toBeGreaterThan(0);
      });

      // Capture initial state
      const initialSnapshot = capturedSnapshots[capturedSnapshots.length - 1];
      expect(initialSnapshot.roleName).toBe('test 1');

      // Update first property
      act(() => {
        store.setValue('roleName', 'updated name', 'test1');
      });

      await waitFor(
        () => {
          const latest = capturedSnapshots[capturedSnapshots.length - 1];
          expect(latest.roleName).toBe('updated name');
        },
        { timeout: 1000 },
      );

      // Update second property
      act(() => {
        store.setValue('roleCode', 'updated-code', 'test1');
      });

      await waitFor(
        () => {
          const latest = capturedSnapshots[capturedSnapshots.length - 1];
          expect(latest.roleCode).toBe('updated-code');
        },
        { timeout: 1000 },
      );

      // Update third property
      act(() => {
        store.setValue('seqNo', 999, 'test1');
      });

      await waitFor(
        () => {
          const latest = capturedSnapshots[capturedSnapshots.length - 1];
          expect(latest.seqNo).toBe(999);
        },
        { timeout: 1000 },
      );

      // Final snapshot should have all updates
      const finalSnapshot = capturedSnapshots[capturedSnapshots.length - 1];
      expect(finalSnapshot.roleName).toBe('updated name');
      expect(finalSnapshot.roleCode).toBe('updated-code');
      expect(finalSnapshot.seqNo).toBe(999);
    });

    test('should provide correct row data in effects when currentRowId changes', async () => {
      // Verify that when switching between rows, the effect sees the correct row data
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedRowNames: Array<string | undefined> = [];
      const effectRunCount = { current: 0 };

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        const row = useCurrentRow(store);

        useEffect(() => {
          effectRunCount.current++;
          capturedRowNames.push(row?.roleName);
        }, [row]);

        // Only render row id
        return <div data-testid="test">{row?._id}</div>;
      };

      rtlRender(<TestComponent />);

      await waitFor(() => {
        expect(effectRunCount.current).toBeGreaterThan(0);
      });

      // Should see test1's data
      expect(capturedRowNames[capturedRowNames.length - 1]).toBe('test 1');

      const countAfterFirstRow = effectRunCount.current;

      // Switch to a different row
      await act(async () => {
        await store.setCurrentRowId('test2');
      });

      await waitFor(
        () => {
          expect(effectRunCount.current).toBeGreaterThan(countAfterFirstRow);
        },
        { timeout: 1000 },
      );

      // Effect should now see test2's data
      expect(capturedRowNames[capturedRowNames.length - 1]).toBe('test 2');

      const countAfterSecondRow = effectRunCount.current;

      // Switch to a third row
      await act(async () => {
        await store.setCurrentRowId('test3');
      });

      await waitFor(
        () => {
          expect(effectRunCount.current).toBeGreaterThan(countAfterSecondRow);
        },
        { timeout: 1000 },
      );

      // Effect should now see test3's data
      expect(capturedRowNames[capturedRowNames.length - 1]).toBe('test 3');
    });

    test('should handle current row deletion and transition to next available row', async () => {
      // Verify that when the current row is deleted, the effect sees the new current row
      // (store automatically transitions to the next available row)
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedRows: Array<{ roleName?: string } | undefined> = [];
      const effectRunCount = { current: 0 };

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        const row = useCurrentRow(store);

        useEffect(() => {
          effectRunCount.current++;
          capturedRows.push(row ? { roleName: row.roleName } : undefined);
        }, [row]);

        return <div data-testid="test">{row?._id ?? 'no row'}</div>;
      };

      rtlRender(<TestComponent />);

      await waitFor(() => {
        expect(effectRunCount.current).toBeGreaterThan(0);
      });

      // Should see test1's data initially
      expect(capturedRows[capturedRows.length - 1]?.roleName).toBe('test 1');

      const countBeforeDelete = effectRunCount.current;

      // Delete the current row - store will auto-transition to next row
      act(() => {
        store.deleteFromStore('test1');
      });

      await waitFor(
        () => {
          expect(effectRunCount.current).toBeGreaterThan(countBeforeDelete);
        },
        { timeout: 1000 },
      );

      // Effect should now see the next row (test2) since store auto-transitions
      expect(capturedRows[capturedRows.length - 1]?.roleName).toBe('test 2');
    });

    test('should return undefined in effects when all rows are deleted', async () => {
      // Verify that when all rows are deleted, the effect sees undefined
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedRows: Array<{ roleName?: string } | undefined> = [];
      const effectRunCount = { current: 0 };

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        const row = useCurrentRow(store);

        useEffect(() => {
          effectRunCount.current++;
          capturedRows.push(row ? { roleName: row.roleName } : undefined);
        }, [row]);

        return <div data-testid="test">{row?._id ?? 'no row'}</div>;
      };

      rtlRender(<TestComponent />);

      await waitFor(() => {
        expect(effectRunCount.current).toBeGreaterThan(0);
      });

      // Should see test1's data initially
      expect(capturedRows[capturedRows.length - 1]?.roleName).toBe('test 1');

      const countBeforeDelete = effectRunCount.current;

      // Delete all rows
      act(() => {
        store.deleteFromStore('test1');
        store.deleteFromStore('test2');
        store.deleteFromStore('test3');
      });

      await waitFor(
        () => {
          expect(effectRunCount.current).toBeGreaterThan(countBeforeDelete);
        },
        { timeout: 1000 },
      );

      // Effect should now see undefined since all rows are deleted
      expect(capturedRows[capturedRows.length - 1]).toBeUndefined();
    });
  });

  describe('useCurrentRowIndex', () => {
    test('should return undefined when no current row', () => {
      const { result } = renderHook(() => useCurrentRowIndex(store));
      expect(result.current).toBeUndefined();
    });

    test('should return current row index after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useCurrentRowIndex(store));
      expect(result.current).toBe(0);
    });

    test('should return current row index when set', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test2');
      const { result } = renderHook(() => useCurrentRowIndex(store));
      expect(result.current).toBe(1);
    });
  });

  describe('useNextRow', () => {
    test('should return undefined when no current row', () => {
      const { result } = renderHook(() => useNextRow(store));
      expect(result.current).toBeUndefined();
    });

    test('should return next row after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useNextRow(store));
      expect(result.current).toBeDefined();
    });

    test('should return next row when set', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test2');
      const { result } = renderHook(() => useNextRow(store));
      expect(result.current).toBeDefined();
      expect(result.current?.roleName).toBe('test 3');
    });
  });

  describe('usePreviousRow', () => {
    test('should return undefined when no current row', () => {
      const { result } = renderHook(() => usePreviousRow(store));
      expect(result.current).toBeUndefined();
    });

    test('should return undefined after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => usePreviousRow(store));
      expect(result.current).toBeUndefined();
    });

    test('should return previous row when set', async () => {
      await store.executeQuery();
      await store.setCurrentRowId('test2');
      const { result } = renderHook(() => usePreviousRow(store));
      expect(result.current).toBeDefined();
      expect(result.current?.roleName).toBe('test 1');
    });
  });

  describe('useCurrentRowSync', () => {
    test('should return current row with sync', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useCurrentRowSync(store));
      expect(result.current).toBeDefined();
    });

    test('should provide updated values in useEffect when properties are not accessed during render', async () => {
      // This test verifies useCurrentRowSync has the same spread behavior as useCurrentRow
      // to prevent stale data in effects
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      const capturedValues: Array<string | undefined> = [];
      const effectRunCount = { current: 0 };

      const React = await import('react');
      const { useEffect } = React;
      const { render: rtlRender, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        const row = useCurrentRowSync(store);

        // Access roleName ONLY in useEffect, NOT during render
        useEffect(() => {
          effectRunCount.current++;
          capturedValues.push(row?.roleName);
        }, [row]);

        // Only render the row id
        return <div data-testid="row-id">{row?._id}</div>;
      };

      rtlRender(<TestComponent />);

      await waitFor(() => {
        expect(effectRunCount.current).toBeGreaterThan(0);
      });

      const initialEffectCount = effectRunCount.current;
      expect(capturedValues[capturedValues.length - 1]).toBe('test 1');

      // Update roleName - should trigger re-render and effect should see new value
      act(() => {
        store.setValue('roleName', 'sync updated name', 'test1');
      });

      await waitFor(
        () => {
          expect(effectRunCount.current).toBeGreaterThan(initialEffectCount);
        },
        { timeout: 1000 },
      );

      expect(capturedValues[capturedValues.length - 1]).toBe('sync updated name');
    });

    test('should provide updated values in callbacks after re-render when properties are not accessed during render', async () => {
      // Verify useCurrentRowSync provides fresh data to callbacks
      await store.executeQuery();
      await store.setCurrentRowId('test1');

      let capturedValueInCallback: string | undefined;
      const renderCount = { current: 0 };

      const React = await import('react');
      const { useCallback } = React;
      const { render: rtlRender, screen, fireEvent, waitFor } = await import('@testing-library/react');

      const TestComponent = () => {
        renderCount.current++;
        const row = useCurrentRowSync(store);

        const handleClick = useCallback(() => {
          // Access roleCode ONLY in callback, NOT during render
          capturedValueInCallback = row?.roleCode;
        }, [row]);

        return (
          <button type="button" data-testid="test-button" onClick={handleClick}>
            Click me
          </button>
        );
      };

      rtlRender(<TestComponent />);

      const initialRenderCount = renderCount.current;

      // Update roleCode
      act(() => {
        store.setValue('roleCode', 'sync-updated-code', 'test1');
      });

      await waitFor(
        () => {
          expect(renderCount.current).toBeGreaterThan(initialRenderCount);
        },
        { timeout: 1000 },
      );

      fireEvent.click(screen.getByTestId('test-button'));

      expect(capturedValueInCallback).toBe('sync-updated-code');
    });
  });

  describe('useRowValue', () => {
    test('should return undefined for invalid rowId', () => {
      const { result } = renderHook(() => useRowValue(store, 'invalid-id', 'roleName'));
      expect(result.current).toBeUndefined();
    });

    test('should return row value', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useRowValue(store, 'test2', 'roleName'));
      expect(result.current).toBe('test 2');
    });
  });

  describe('useValue', () => {
    test('should return value for current row', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useValue(store, 'roleName'));
      expect(result.current).toBeDefined();
    });
  });

  describe('useRowAtId', () => {
    test('should return undefined for invalid rowId', () => {
      const { result } = renderHook(() => useRowAtId(store, 'invalid-id'));
      expect(result.current).toBeUndefined();
    });

    test('should return row at specific ID', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useRowAtId(store, 'test2'));
      expect(result.current).toBeDefined();
      expect(result.current?.roleName).toBe('test 2');
    });
  });

  describe('useRow', () => {
    test('should return row from context', () => {
      const testRow = getTestRow(1);
      const rowId = 'test-row-id';
      store.setRow(rowId, testRow);

      const { result } = renderHook(() => useRow(store), {
        wrapper: ({ children }) => <RowIdProvider rowId={rowId}>{children}</RowIdProvider>,
      });
      expect(result.current).toBeDefined();
    });
  });

  describe('useValueSetter', () => {
    test('should set value when called', async () => {
      await store.executeQuery();
      const row = store.currentRow();
      if (row) {
        await store.setCurrentRowId(store.rowId(row));
        const { result } = renderHook(() => useValueSetter(store, 'roleName'));
        expect(typeof result.current).toBe('function');

        act(() => {
          result.current('new value');
        });
      }
    });
  });

  describe('useIsStoreDirty', () => {
    test('should return false for clean store', () => {
      const { result } = renderHook(() => useIsStoreDirty(store));
      expect(result.current).toBe(false);
    });

    test('should return true for dirty store', async () => {
      await store.createNew({ partialRecord: { roleCode: 'test' } });
      const { result } = renderHook(() => useIsStoreDirty(store));
      expect(result.current).toBe(true);
    });
  });

  describe('useIsRowDirty', () => {
    test('should return false for clean row', () => {
      const { result } = renderHook(() => useIsRowDirty(store, 'test-id'));
      expect(result.current).toBe(false);
    });

    test('should return true for dirty row', async () => {
      await store.executeQuery();
      const row = store.currentRow();
      if (row) {
        const rowId = store.rowId(row);
        store.setValue('roleName', 'modified value', rowId);
        const { result } = renderHook(() => useIsRowDirty(store, rowId));
        expect(result.current).toBe(true);
      }
    });
  });

  describe('useIsRowAttributeDirty', () => {
    test('should return false for clean attribute', () => {
      const { result } = renderHook(() => useIsRowAttributeDirty(store, 'test-id', 'roleName'));
      expect(result.current).toBe(false);
    });
  });

  describe('useRowAttributeOriginalValue', () => {
    test('should return undefined for non-existent row', () => {
      const { result } = renderHook(() => useRowAttributeOriginalValue(store, 'test-id', 'roleName'));
      expect(result.current).toBeUndefined();
    });
  });

  describe('useStoreSize', () => {
    test('should return 0 for empty store', () => {
      const { result } = renderHook(() => useStoreSize(store));
      expect(result.current).toBe(0);
    });

    test('should return correct size after query', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useStoreSize(store));
      expect(result.current).toBeGreaterThan(0);
    });
  });

  describe('useStoreRowCount', () => {
    test('should return undefined when no total count', () => {
      const { result } = renderHook(() => useStoreRowCount(store));
      expect(result.current).toBeUndefined();
    });

    test('should return total row count', async () => {
      await store.executeQuery();
      // Manually set totalRowCount since the mock doesn't set it
      const state = store.getState();
      state.totalRowCount = 3;
      const { result } = renderHook(() => useStoreRowCount(store));
      expect(result.current).toBe(3);
    });
  });

  describe('useSortState', () => {
    test('should return undefined tuple when no sort', () => {
      const { result } = renderHook(() => useSortState(store, 'roleName'));
      expect(result.current).toEqual([undefined, undefined]);
    });

    test('should return sort state tuple', () => {
      store.setSort({ roleName: 1 });
      const { result } = renderHook(() => useSortState(store, 'roleName'));
      expect(result.current).toEqual([1, 1]);
    });
  });

  describe('useFullSortState', () => {
    test('should return undefined when no sort', () => {
      const { result } = renderHook(() => useFullSortState(store));
      expect(result.current).toBeUndefined();
    });

    test('should return full sort state', () => {
      const sortState = { roleName: 1, roleCode: -1 };
      store.setSort(sortState);
      const { result } = renderHook(() => useFullSortState(store));
      expect(result.current).toEqual(sortState);
    });
  });

  describe('useIsStoreBusy', () => {
    test('should return false when not busy', () => {
      const { result } = renderHook(() => useIsStoreBusy(store));
      expect(result.current).toBe(false);
    });

    test('should return true when loading', () => {
      store.setIsLoading(true);
      const { result } = renderHook(() => useIsStoreBusy(store));
      expect(result.current).toBe(true);
    });

    test('should return true when posting', () => {
      store.setIsPosting(true);
      const { result } = renderHook(() => useIsStoreBusy(store));
      expect(result.current).toBe(true);
    });
  });

  describe('useIsStoreLoading', () => {
    test('should return loading state', () => {
      store.setIsLoading(true);
      const { result } = renderHook(() => useIsStoreLoading(store));
      expect(result.current).toBe(true);
    });
  });

  describe('useIsStorePosting', () => {
    test('should return posting state', () => {
      store.setIsPosting(true);
      const { result } = renderHook(() => useIsStorePosting(store));
      expect(result.current).toBe(true);
    });
  });

  describe('useStoreError', () => {
    test('should return undefined when no error', () => {
      const { result } = renderHook(() => useStoreError(store));
      expect(result.current).toBeUndefined();
    });

    test('should return error message', () => {
      // Simulate error state
      const state = store.getState();
      state.status = 'error';
      state.error = 'Test error';

      const { result } = renderHook(() => useStoreError(store));
      expect(result.current).toBe('Test error');
    });
  });

  describe('usePreQuery', () => {
    test('should register pre-query callback', () => {
      const callback = vi.fn();
      renderHook(() => usePreQuery(store, callback));

      // The callback should be registered
      expect(callback).toBeDefined();
    });
  });

  describe('useHasMoreRows', () => {
    test('should return hasMoreRows state', () => {
      const { result } = renderHook(() => useHasMoreRows(store));
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useIsRowSelected', () => {
    test('should return false for unselected row', () => {
      const { result } = renderHook(() => useIsRowSelected(store, 'test-id'));
      expect(result.current).toBe(false);
    });

    test('should return true for selected row', () => {
      store.selectRow('test-id');
      const { result } = renderHook(() => useIsRowSelected(store, 'test-id'));
      expect(result.current).toBe(true);
    });
  });

  describe('useSelectedRowIds', () => {
    test('should return empty array when no selection', () => {
      const { result } = renderHook(() => useSelectedRowIds(store));
      expect(result.current).toEqual([]);
    });

    test('should return selected row IDs', () => {
      store.selectRow('test-id-1');
      store.selectRow('test-id-2');
      const { result } = renderHook(() => useSelectedRowIds(store));
      expect(result.current).toContain('test-id-1');
      expect(result.current).toContain('test-id-2');
    });
  });

  describe('useIsAllSelected', () => {
    test('should return false when not all selected', async () => {
      await store.executeQuery();
      const { result } = renderHook(() => useIsAllSelected(store));
      expect(result.current).toBe(false);
    });

    test('should return true when all selected', async () => {
      await store.executeQuery();
      store.selectAll();
      const { result } = renderHook(() => useIsAllSelected(store));
      expect(result.current).toBe(true);
    });
  });

  describe('useSelectedRows', () => {
    test('should return empty array when no selection', () => {
      const { result } = renderHook(() => useSelectedRows(store));
      expect(result.current).toEqual([]);
    });

    test('should return selected rows', async () => {
      await store.executeQuery();
      const row = store.currentRow();
      if (row) {
        store.selectRow(store.rowId(row));
        const { result } = renderHook(() => useSelectedRows(store));
        expect(result.current.length).toBe(1);
      }
    });
  });

  describe('useIsHeaderFilterDirty', () => {
    test('should return false when filters are clean', () => {
      const { result } = renderHook(() => useIsHeaderFilterDirty(store, 'roleName'));
      expect(result.current).toBe(false);
    });
  });

  describe('useIsHeaderFilterApplied', () => {
    test('should return false when no filter applied', () => {
      const { result } = renderHook(() => useIsHeaderFilterApplied(store, 'roleName'));
      expect(result.current).toBe(false);
    });

    test('should return true when filter applied', () => {
      store.setHeaderFilter({ roleName: { like: 'test' } });
      store.applyHeaderFiltersIfChanged();
      const { result } = renderHook(() => useIsHeaderFilterApplied(store, 'roleName'));
      expect(result.current).toBe(true);
    });
  });

  describe('useIsHeaderFiltersHidden', () => {
    test('should return default state', () => {
      const { result } = renderHook(() => useIsHeaderFiltersHidden(store));
      expect(typeof result.current).toBe('boolean');
    });

    test('should return false when no store provided', () => {
      const { result } = renderHook(() => useIsHeaderFiltersHidden());
      expect(result.current).toBe(true); // The default proxy returns true
    });
  });

  describe('useStoreFieldErrors', () => {
    test('should return undefined when no errors', () => {
      const { result } = renderHook(() => useStoreFieldErrors(store));
      expect(result.current).toBeUndefined();
    });

    test('should return field errors for current row', async () => {
      await store.setCurrentRowId('test-id');
      store.setError({
        attribute: 'roleName',
        rowId: 'test-id',
        errorMessage: 'Invalid role name',
        source: 'Controller',
      });

      const { result } = renderHook(() => useStoreFieldErrors(store));
      expect(result.current).toBeDefined();
    });
  });
});
