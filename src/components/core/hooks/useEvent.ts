import { useRef, useCallback, useInsertionEffect } from 'react';

export function useEvent<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef<T>(callback);

  useInsertionEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback((...args: any[]) => {
    return ref.current?.(...args);
  }, []) as unknown as T;
}
