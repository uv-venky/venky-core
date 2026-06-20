/* Copyright (c) 2024-present VENKY Corp. */

import { useState, useEffect, useCallback } from 'react';
import useEventListener from '@/components/core/hooks/useEventListener';
import useDebounce from '@/components/core/hooks/useDebounce';

interface WindowSize {
  width: number;
  height: number;
}

interface UseWindowSizeOptions {
  debounceMs?: number;
  initialSize?: WindowSize;
}

export default function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const { debounceMs = 150, initialSize } = options;

  const getInitialSize = useCallback((): WindowSize => {
    if (initialSize) return initialSize;

    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    return { width: 1200, height: 800 };
  }, [initialSize]);

  const [size, setSize] = useState<WindowSize>(getInitialSize);

  const [debouncedSetSize] = useDebounce((newSize: WindowSize) => {
    setSize(newSize);
  });

  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      const newSize: WindowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      if (debounceMs > 0) {
        debouncedSetSize(debounceMs, newSize);
      } else {
        setSize(newSize);
      }
    }
  }, [debounceMs, debouncedSetSize]);

  useEventListener(typeof window !== 'undefined' ? window : (null as any), 'resize', handleResize, { passive: true });

  useEffect(() => {
    handleResize();
  }, [handleResize]);

  return size;
}
