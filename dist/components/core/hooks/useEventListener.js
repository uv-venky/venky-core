/* Copyright (c) 2024-present VENKY Corp. */
import { useEffect } from 'react';
import { useLatest } from '../../../components/core/hooks/useLatest';
function useEventListener(element, eventName, handler, options) {
  const savedHandler = useLatest(handler);
  useEffect(() => {
    let el = null;
    if (typeof element === 'object' && 'current' in element) {
      el = element.current;
    } else {
      el = element;
    }
    if (!el) return;
    // Make sure element supports addEventListener
    const isSupported = el.addEventListener;
    if (!isSupported) return;
    // Create event listener that calls handler function stored in ref
    const eventListener = (event) => savedHandler.current(event);
    // Add event listener
    el.addEventListener(eventName, eventListener, options);
    // Remove event listener on cleanup
    return () => {
      el.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options, savedHandler]);
}
export default useEventListener;
//# sourceMappingURL=useEventListener.js.map
