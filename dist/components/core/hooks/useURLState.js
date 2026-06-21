'use client';
import { usePathname } from '../../../components/core/hooks/usePathname';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHashParam } from '../../../components/core/hooks/useHashParams';
import { useLatest } from '../../../components/core/hooks/useLatest';
import { defaultDeserialize, defaultSerialize, defaultValidator, } from '../../../components/core/hooks/useURLStateUtils';
export function useURLState(key, initialValue, { deserialize = defaultDeserialize, serialize = defaultSerialize, validator = defaultValidator, } = {}) {
    const pathname = usePathname();
    const isUpdatingRef = useRef(false);
    const isInitialMountRef = useRef(true);
    const debounceTimeoutRef = useRef(null);
    const validatorRef = useLatest(validator);
    const deserializeRef = useLatest(deserialize);
    const serializeRef = useLatest(serialize);
    const getValue = useCallback((raw) => {
        if (raw && pathname) {
            const val = deserializeRef.current(raw);
            if (val != null && validatorRef.current(val)) {
                return val;
            }
        }
        return initialValue;
    }, [initialValue, deserializeRef, validatorRef, pathname]);
    const [hashState, setHashState] = useHashParam(key, (raw) => {
        setState(getValue(raw));
    });
    const [state, setState] = useState(() => getValue(hashState));
    // On initial mount, sync state FROM URL (not the other way around)
    useEffect(() => {
        if (isInitialMountRef.current && typeof window !== 'undefined') {
            const currentHash = new URLSearchParams(window.location.hash.slice(1));
            const urlValue = currentHash.get(key);
            if (urlValue) {
                const parsedValue = getValue(urlValue);
                if (parsedValue !== initialValue) {
                    setState(parsedValue);
                }
            }
            isInitialMountRef.current = false;
        }
    }, [key, getValue, initialValue]);
    const updateURL = useCallback((newState) => {
        if (isUpdatingRef.current)
            return;
        isUpdatingRef.current = true;
        const val = newState === initialValue || newState == null ? null : serializeRef.current(newState);
        setHashState(val);
        // Reset the flag after a short delay to allow URL to update
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 0);
    }, [serializeRef, initialValue, setHashState]);
    const debouncedUpdateURL = useCallback((newState) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            updateURL(newState);
        }, 600);
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [updateURL]);
    useEffect(() => {
        // Skip URL update on initial mount - we want to read FROM URL, not write TO it
        if (isInitialMountRef.current)
            return;
        debouncedUpdateURL(state);
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [state, debouncedUpdateURL]);
    // Setter function that accepts both direct values and updater functions
    const setURLState = useCallback((val) => {
        setState((prev) => {
            const newValue = typeof val === 'function' ? val(prev) : val;
            return newValue;
        });
    }, []);
    return [state, setURLState];
}
//# sourceMappingURL=useURLState.js.map