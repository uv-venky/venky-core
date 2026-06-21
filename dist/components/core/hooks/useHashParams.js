// useHashParams.ts
import { hashState } from '../../../lib/core/client/state';
import { useCallback, useEffect } from 'react';
import { subscribe, useSnapshot } from 'valtio';
import { useLatest } from '../../../components/core/hooks/useLatest';
import { usePathname } from '../../../components/core/hooks/usePathname';
export function setHashParams(key, value) {
    const newParams = new URLSearchParams(window.location.hash.slice(1));
    if (value != null) {
        newParams.set(key, value);
        hashState.hash.current.set(key, value);
    }
    else {
        newParams.delete(key);
        hashState.hash.current.delete(key);
    }
    const newHash = newParams.toString();
    const newURL = `${newHash ? `#${newHash}` : '#'}`;
    if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', newURL);
    }
}
export function useHashParams() {
    const { current, previous } = useSnapshot(hashState.hash);
    return {
        current,
        previous,
    };
}
export function useHashParam(key, onChange) {
    const pathname = usePathname();
    const onChangeRef = useLatest(onChange);
    useEffect(() => {
        const unsubscribe = subscribe(hashState, () => {
            const currentValue = hashState.hash.current.get(key);
            const previousValue = hashState.hash.previous.get(key);
            if (currentValue !== previousValue) {
                onChangeRef.current(currentValue ?? null);
            }
        });
        return unsubscribe;
    }, [key, onChangeRef]);
    const setState = useCallback((value) => {
        setHashParams(key, value);
    }, [key]);
    // Return value from hashState if pathname matches, or directly from window.location.hash
    // if we're on the page but hashState hasn't synced yet (e.g., during initial navigation)
    if (pathname === hashState.hash.pathname) {
        return [hashState.hash.current.get(key) ?? null, setState];
    }
    if (typeof window !== 'undefined' && pathname === window.location.pathname) {
        // We're on this page but hashState hasn't synced yet - read directly from URL
        const currentHash = new URLSearchParams(window.location.hash.slice(1));
        return [currentHash.get(key) ?? null, setState];
    }
    return [null, setState];
}
//# sourceMappingURL=useHashParams.js.map