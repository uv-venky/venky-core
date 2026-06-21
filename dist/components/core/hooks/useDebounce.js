/* Copyright (c) 2024-present VENKY Corp. */
import { useEffect, useRef } from 'react';
import { useEvent } from '../../../components/core/hooks/useEvent';
import { useLatest } from '../../../components/core/hooks/useLatest';
export default function useDebounce(callback) {
  const requestRef = useRef(null);
  const callbackRef = useLatest(callback);
  const argsRef = useRef([]);
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        clearTimeout(requestRef.current);
        requestRef.current = null;
      }
    };
  }, []);
  const call = useEvent(() => {
    requestRef.current = null;
    callbackRef.current(...argsRef.current);
  });
  const callImmediate = useEvent((...args) => {
    if (requestRef.current) {
      clearTimeout(requestRef.current);
      requestRef.current = null;
    }
    callbackRef.current(...args);
  });
  const debounce = useEvent((timeout, ...args) => {
    argsRef.current = args;
    if (requestRef.current) {
      clearTimeout(requestRef.current);
    }
    requestRef.current = setTimeout(call, timeout);
  });
  const cancelDebounce = useEvent(() => {
    if (requestRef.current) {
      clearTimeout(requestRef.current);
      requestRef.current = null;
    }
  });
  return [debounce, cancelDebounce, callImmediate];
}
//# sourceMappingURL=useDebounce.js.map
