/* Copyright (c) 2024-present VENKY Corp. */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useWindowSize from '@/components/core/hooks/useWindowSize';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock global window
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('useWindowSize', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return initial window size', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toEqual({
      width: 1024,
      height: 768,
    });
  });

  it('should return custom initial size when provided', () => {
    const initialSize = { width: 1920, height: 1080 };
    const { result } = renderHook(() => useWindowSize({ initialSize }));

    expect(result.current).toEqual(initialSize);
  });

  it('should update size when window resizes', () => {
    const { result } = renderHook(() => useWindowSize({ debounceMs: 100 }));

    // Simulate window resize
    mockWindow.innerWidth = 1440;
    mockWindow.innerHeight = 900;

    // Get the event listener that was registered
    const addEventListenerCall = mockWindow.addEventListener.mock.calls.find((call) => call[0] === 'resize');
    const resizeHandler = addEventListenerCall?.[1];

    // Trigger the resize handler
    act(() => {
      resizeHandler?.();
    });

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({
      width: 1440,
      height: 900,
    });
  });

  it('should use default debounce of 150ms', () => {
    const { result } = renderHook(() => useWindowSize());

    mockWindow.innerWidth = 800;
    mockWindow.innerHeight = 600;

    const addEventListenerCall = mockWindow.addEventListener.mock.calls.find((call) => call[0] === 'resize');
    const resizeHandler = addEventListenerCall?.[1];

    act(() => {
      resizeHandler?.();
    });

    // Should not update immediately
    expect(result.current).toEqual({
      width: 1024,
      height: 768,
    });

    // Should update after 150ms
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('should not debounce when debounceMs is 0', () => {
    const { result } = renderHook(() => useWindowSize({ debounceMs: 0 }));

    mockWindow.innerWidth = 1200;
    mockWindow.innerHeight = 800;

    const addEventListenerCall = mockWindow.addEventListener.mock.calls.find((call) => call[0] === 'resize');
    const resizeHandler = addEventListenerCall?.[1];

    act(() => {
      resizeHandler?.();
    });

    // Should update immediately
    expect(result.current).toEqual({
      width: 1200,
      height: 800,
    });
  });
});
