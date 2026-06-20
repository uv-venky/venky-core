/* Copyright (c) 2023-present Venky Corp */

import { useEffect, useRef } from 'react';
import { proxy, useSnapshot } from 'valtio';

const state = proxy({ counter: 0 });

export function touch() {
  state.counter++;
}

export function ActiveState() {
  const snap = useSnapshot(state);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeout.current && snap.counter > 0) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      // navigate('/pub/lock');
    }, 1800000);
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, [snap.counter]);

  useEffect(() => {
    document.addEventListener('click', touch);
    return () => {
      document.removeEventListener('click', touch);
    };
  }, []);

  return null;
}
