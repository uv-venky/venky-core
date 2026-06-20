import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLatest } from '@/components/core/hooks/useLatest';

describe('useLatest', () => {
  it('should return a ref with the current value', () => {
    const { result } = renderHook(() => useLatest('initial-value'));

    expect(result.current.current).toBe('initial-value');
  });

  it('should update the ref when the value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'initial-value' },
    });

    expect(result.current.current).toBe('initial-value');

    act(() => {
      rerender({ value: 'updated-value' });
    });

    expect(result.current.current).toBe('updated-value');
  });

  it('should handle primitive values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 42 },
    });

    expect(result.current.current).toBe(42);

    act(() => {
      rerender({ value: 100 });
    });

    expect(result.current.current).toBe(100);
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: true },
    });

    expect(result.current.current).toBe(true);

    act(() => {
      rerender({ value: false });
    });

    expect(result.current.current).toBe(false);
  });

  it('should handle object values', () => {
    const initialObject = { name: 'test', count: 0 };
    const updatedObject = { name: 'updated', count: 1 };

    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: initialObject },
    });

    expect(result.current.current).toBe(initialObject);

    act(() => {
      rerender({ value: updatedObject });
    });

    expect(result.current.current).toBe(updatedObject);
  });

  it('should handle array values', () => {
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];

    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: initialArray },
    });

    expect(result.current.current).toBe(initialArray);

    act(() => {
      rerender({ value: updatedArray });
    });

    expect(result.current.current).toBe(updatedArray);
  });

  it('should handle null values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: null as any },
    });

    expect(result.current.current).toBe(null);

    act(() => {
      rerender({ value: 'not null' as any });
    });

    expect(result.current.current).toBe('not null');
  });

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: undefined as any },
    });

    expect(result.current.current).toBe(undefined);

    act(() => {
      rerender({ value: 'defined' as any });
    });

    expect(result.current.current).toBe('defined');
  });

  it('should handle function values', () => {
    const initialFunction = () => 'initial';
    const updatedFunction = () => 'updated';

    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: initialFunction },
    });

    expect(result.current.current).toBe(initialFunction);

    act(() => {
      rerender({ value: updatedFunction });
    });

    expect(result.current.current).toBe(updatedFunction);
  });

  it('should maintain the same ref object across renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'initial' },
    });

    const initialRef = result.current;

    act(() => {
      rerender({ value: 'updated' });
    });

    // The ref object should be the same, but its current value should be updated
    expect(result.current).toBe(initialRef);
    expect(result.current.current).toBe('updated');
  });

  it('should handle multiple rapid updates', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 0 },
    });

    // Simulate rapid updates
    act(() => {
      rerender({ value: 1 });
      rerender({ value: 2 });
      rerender({ value: 3 });
    });

    expect(result.current.current).toBe(3);
  });

  it('should work with complex nested objects', () => {
    const initialObject = {
      user: {
        name: 'John',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      metadata: {
        createdAt: new Date('2023-01-01'),
        tags: ['tag1', 'tag2'],
      },
    };

    const updatedObject = {
      user: {
        name: 'Jane',
        settings: {
          theme: 'light',
          notifications: false,
        },
      },
      metadata: {
        createdAt: new Date('2023-01-02'),
        tags: ['tag3', 'tag4'],
      },
    };

    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: initialObject },
    });

    expect(result.current.current).toBe(initialObject);

    act(() => {
      rerender({ value: updatedObject });
    });

    expect(result.current.current).toBe(updatedObject);
  });

  it('should handle empty values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: '' },
    });

    expect(result.current.current).toBe('');

    act(() => {
      rerender({ value: [] as any });
    });

    expect(result.current.current).toEqual([]);
  });

  it('should handle zero values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 0 },
    });

    expect(result.current.current).toBe(0);

    act(() => {
      rerender({ value: 1 });
    });

    expect(result.current.current).toBe(1);
  });

  it('should handle false values', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: false },
    });

    expect(result.current.current).toBe(false);

    act(() => {
      rerender({ value: true });
    });

    expect(result.current.current).toBe(true);
  });
});
