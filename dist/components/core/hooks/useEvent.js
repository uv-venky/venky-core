import { useRef, useCallback, useInsertionEffect } from 'react';
export function useEvent(callback) {
    const ref = useRef(callback);
    useInsertionEffect(() => {
        ref.current = callback;
    }, [callback]);
    return useCallback((...args) => {
        return ref.current?.(...args);
    }, []);
}
//# sourceMappingURL=useEvent.js.map