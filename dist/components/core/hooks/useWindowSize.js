/* Copyright (c) 2024-present VENKY Corp. */
import { useState, useEffect, useCallback } from 'react';
import useEventListener from '../../../components/core/hooks/useEventListener';
import useDebounce from '../../../components/core/hooks/useDebounce';
export default function useWindowSize(options = {}) {
  const { debounceMs = 150, initialSize } = options;
  const getInitialSize = useCallback(() => {
    if (initialSize) return initialSize;
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 1200, height: 800 };
  }, [initialSize]);
  const [size, setSize] = useState(getInitialSize);
  const [debouncedSetSize] = useDebounce((newSize) => {
    setSize(newSize);
  });
  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      const newSize = {
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
  useEventListener(typeof window !== 'undefined' ? window : null, 'resize', handleResize, { passive: true });
  useEffect(() => {
    handleResize();
  }, [handleResize]);
  return size;
}
//# sourceMappingURL=useWindowSize.js.map
