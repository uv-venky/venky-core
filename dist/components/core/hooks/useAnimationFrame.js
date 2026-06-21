/* Copyright (c) 2024-present VENKY Corp. */
import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from '../../../components/core/hooks/useLatest';
export default function useAnimationFrame(callback) {
  const requestRef = useRef(0);
  const callbackRef = useLatest(callback);
  const argsRef = useRef([]);
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = 0;
      }
    };
  }, []);
  const call = useCallback(() => {
    requestRef.current = 0;
    callbackRef.current(...argsRef.current);
  }, [callbackRef]);
  const debounce = useCallback(
    (...args) => {
      argsRef.current = args;
      if (requestRef.current) {
        return;
      }
      requestRef.current = requestAnimationFrame(call);
    },
    [call],
  );
  return debounce;
}
//# sourceMappingURL=useAnimationFrame.js.map
