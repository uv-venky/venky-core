'use client';

import { usePathname } from '@/components/core/hooks/usePathname';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHashParam } from '@/components/core/hooks/useHashParams';
import { useLatest } from '@/components/core/hooks/useLatest';
import {
  defaultDeserialize,
  defaultSerialize,
  defaultValidator,
  type Deserializer,
  type Serializer,
  type Validator,
} from '@/components/core/hooks/useURLStateUtils';

export function useURLState<T>(
  key: string,
  initialValue: T,
  {
    deserialize = defaultDeserialize as Deserializer<T>,
    serialize = defaultSerialize as Serializer<T>,
    validator = defaultValidator,
  }: {
    deserialize?: Deserializer<T>;
    serialize?: Serializer<T>;
    validator?: Validator<T>;
  } = {},
): [T, (val: T | ((prev: T) => T)) => void] {
  const pathname = usePathname();
  const isUpdatingRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validatorRef = useLatest(validator);
  const deserializeRef = useLatest(deserialize);
  const serializeRef = useLatest(serialize);

  const getValue = useCallback(
    (raw: string | null): T => {
      if (raw && pathname) {
        const val = deserializeRef.current(raw);
        if (val != null && validatorRef.current(val)) {
          return val;
        }
      }
      return initialValue;
    },
    [initialValue, deserializeRef, validatorRef, pathname],
  );

  const [hashState, setHashState] = useHashParam(key, (raw) => {
    setState(getValue(raw));
  });

  const [state, setState] = useState<T>(() => getValue(hashState));

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

  const updateURL = useCallback(
    (newState: T) => {
      if (isUpdatingRef.current) return;

      isUpdatingRef.current = true;

      const val = newState === initialValue || newState == null ? null : serializeRef.current(newState);
      setHashState(val);

      // Reset the flag after a short delay to allow URL to update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    },
    [serializeRef, initialValue, setHashState],
  );

  const debouncedUpdateURL = useCallback(
    (newState: T) => {
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
    },
    [updateURL],
  );

  useEffect(() => {
    // Skip URL update on initial mount - we want to read FROM URL, not write TO it
    if (isInitialMountRef.current) return;

    debouncedUpdateURL(state);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [state, debouncedUpdateURL]);

  // Setter function that accepts both direct values and updater functions
  const setURLState = useCallback((val: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val;
      return newValue;
    });
  }, []);

  return [state, setURLState];
}
